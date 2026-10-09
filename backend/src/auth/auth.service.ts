import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../common/email/email.service';
import { UserRole } from '@prisma/client';
import { AUTH_CONSTANTS } from './constants/auth.constants';

import { TokenService } from './services/token.service';
import { OtpService } from './services/otp.service';
import { PasswordService } from './services/password.service';
import { UserValidationService } from './services/user-validation.service';
import { ModerationService } from '../common/services/moderation.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
    private readonly passwordService: PasswordService,
    private readonly userValidationService: UserValidationService,
    private readonly emailService: EmailService,
    private readonly moderationService: ModerationService,
  ) { }

  // ========================= REGISTER =========================

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    if (dto.role === UserRole.VENDOR && !dto.boutiqueName) {
      throw new HttpException(
        'Boutique name is required for vendors',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validation du mot de passe
    this.passwordService.validateComplexity(dto.password);

    const passwordHash = await this.passwordService.hash(dto.password);

    const trustScore = this.userValidationService.getInitialTrustScore(dto.role);
    const kycStatus = this.userValidationService.getInitialKycStatus(dto.role);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        province: dto.province,
        commune: dto.commune,
        city: dto.city || dto.commune,
        country: dto.country || "RD Congo",
        address: dto.address,
        boutiqueName: dto.boutiqueName,
        role: dto.role,
        kycStatus,
        trustScore,
        dailyPublications: 0,
        language: dto.language || 'fr',
      },
    });

    await this.otpService.generateAndSend(user.id, user.email, user.language);

    return {
      success: true,
      message: 'Registration successful. Verify OTP.',
      requiresKyc: dto.role === UserRole.VENDOR,
    };
  }

  // ========================= VERIFY OTP =========================

  async verifyOtp(dto: VerifyOtpDto) {
    await this.otpService.verify(dto.email, dto.otp);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpHash: null,
        otpExpiresAt: null,
        otpAttempts: 0,
        trustScore: this.userValidationService.calculateScoreAfterVerification(user.trustScore),
      },
    });

    // Envoi du message de bienvenue (CORRIGÉ : sendWelcome -> sendWelcomeEmail)
    this.emailService.sendWelcomeEmail(user.email, user.fullName, user.language).catch(err =>
      this.logger.error(`Failed to send welcome email to ${user.email}`, err)
    );

    return { success: true, message: 'Account verified successfully' };
  }

  // ========================= LOGIN =========================

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.debug(`Utilisateur non trouvé: ${dto.email}`);
      // En prod, message générique pour sécurité. En dev, message spécifique
      const message = process.env.NODE_ENV === 'production'
        ? 'Identifiants invalides'
        : 'Email not found';
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }

    this.logger.debug(`Tentative de connexion pour: ${dto.email}, Password Length: ${dto.password?.length}`);
    const isPasswordValid = await this.passwordService.compare(dto.password, user.password);
    this.logger.debug(`Mot de passe valide: ${isPasswordValid}`);

    if (!isPasswordValid) {
      this.logger.debug(`Mot de passe incorrect pour: ${dto.email}`);
      // En prod, message générique pour sécurité. En dev, message spécifique
      const message = process.env.NODE_ENV === 'production'
        ? 'Identifiants invalides'
        : 'Invalid password';
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }

    this.userValidationService.validateLoginEligibility(user);

    const tokens = await this.tokenService.generateTokenPair(user);
    await this.tokenService.saveRefreshToken(user.id, tokens.refresh_token);

    return {
      success: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        province: user.province,
        commune: user.commune,
        address: user.address,
        boutiqueName: user.boutiqueName,
        kycStatus: user.kycStatus,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        role: user.role,
        trustScore: user.trustScore,
        city: user.city,
        country: user.country,
        createdAt: user.createdAt,
      },
    };
  }

  // ========================= FORGOT PASSWORD =========================

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { token, hash: tokenHash } = await this.passwordService.generateResetToken();

    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`[DEV RESET TOKEN] ${dto.email} -> ${token}`);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: new Date(Date.now() + AUTH_CONSTANTS.RESET_TOKEN_EXPIRY_MS),
      },
    });

    await this.emailService.sendPasswordReset(dto.email, token, user.language);
    return { success: true };
  }

  // ========================= RESET PASSWORD (CORRIGÉ) =========================

  async resetPassword(dto: ResetPasswordDto) {
    // VÉRIFICATION PAR EMAIL - CORRECTION CRITIQUE
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new HttpException('Invalid or expired token', HttpStatus.BAD_REQUEST);
    }

    if (!user.resetTokenHash || !user.resetTokenExpiresAt) {
      throw new HttpException('No active reset request', HttpStatus.BAD_REQUEST);
    }

    if (new Date() > user.resetTokenExpiresAt) {
      // Nettoyer le token expiré
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: null,
          resetTokenExpiresAt: null,
        },
      });
      throw new HttpException('Reset token has expired', HttpStatus.BAD_REQUEST);
    }

    const isValid = await this.passwordService.verifyResetToken(dto.token, user.resetTokenHash);
    if (!isValid) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    // Validation de la complexité du nouveau mot de passe
    this.passwordService.validateComplexity(dto.newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await this.passwordService.hash(dto.newPassword),
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    // Invalidate all sessions after password change
    await this.tokenService.revokeAllRefreshTokens(user.id);

    return { success: true, message: 'Password reset successful' };
  }

  // ========================= LOGOUT =========================

  async logout(userId: string, refreshToken?: string) {
    const revoked = await this.tokenService.revokeRefreshToken(userId, refreshToken || '');

    return {
      success: true,
      message: revoked ? 'Session logged out successfully' : 'Session already terminated',
    };
  }

  async logoutAll(userId: string) {
    await this.tokenService.revokeAllRefreshTokens(userId);
    return { success: true, message: 'All sessions logged out' };
  }

  // ========================= REFRESH =========================

  async refreshTokens(userId: string, refreshToken: string) {
    const tokens = await this.tokenService.refreshTokenPair(userId, refreshToken);
    return {
      success: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  // ========================= UTILITY =========================

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        province: true,
        commune: true,
        city: true,
        country: true,
        address: true,
        boutiqueName: true,
        kycStatus: true,
        trustScore: true,
        isVerified: true,
        avatarUrl: true,
        coverUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return { success: true, user };
  }

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.isVerified) {
      return { success: true };
    }

    await this.otpService.generateAndSend(user.id, user.email, user.language);
    return { success: true, message: 'New OTP sent' };
  }

  // ========================= DEV METHODS =========================

  async updateProfile(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }

    const data: any = {};

    if (dto.fullName) data.fullName = dto.fullName;
    if (dto.email) data.email = dto.email;
    if (dto.phone) data.phone = dto.phone;
    if (dto.province) data.province = dto.province;
    if (dto.commune) data.commune = dto.commune;
    if (dto.address) data.address = dto.address;
    if (dto.city) data.city = dto.city;
    if (dto.boutiqueName) data.boutiqueName = dto.boutiqueName;
    if (dto.avatarUrl) data.avatarUrl = dto.avatarUrl;
    if (dto.language && ['fr', 'en', 'sw'].includes(dto.language)) data.language = dto.language;
    if (dto.profilePicture && typeof dto.profilePicture === 'string') {
      const isValid = await this.moderationService.validateImage(dto.profilePicture);
      if (!isValid) {
        throw new HttpException('Image de profil inappropriée détectée', HttpStatus.BAD_REQUEST);
      }
      data.avatarUrl = dto.profilePicture;
    }

    if (dto.coverPicture && typeof dto.coverPicture === 'string') {
      const isValid = await this.moderationService.validateImage(dto.coverPicture);
      if (!isValid) {
        throw new HttpException('Image de couverture inappropriée détectée', HttpStatus.BAD_REQUEST);
      }
      data.coverUrl = dto.coverPicture;
    }

    // Gestion du mot de passe
    if (dto.password) {
      if (!dto.oldPassword) {
        throw new HttpException('L\'ancien mot de passe est requis', HttpStatus.BAD_REQUEST);
      }
      const isOldPasswordValid = await this.passwordService.compare(dto.oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new HttpException('L\'ancien mot de passe est incorrect', HttpStatus.UNAUTHORIZED);
      }

      // Validation de la complexité du nouveau mot de passe
      this.passwordService.validateComplexity(dto.password);

      data.password = await this.passwordService.hash(dto.password);
    }

    // Mise à jour (Prisma)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        province: true,
        commune: true,
        city: true,
        country: true,
        address: true,
        boutiqueName: true,
        kycStatus: true,
        trustScore: true,
        isVerified: true,
        avatarUrl: true,
        coverUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, user: updatedUser };
  }

  // ========================= NOTIFICATION PREFERENCES =========================

  /**
   * Récupère les préférences de notifications de l'utilisateur.
   * Crée des préférences par défaut si elles n'existent pas encore (upsert).
   */
  async getNotificationPreferences(userId: string) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  /**
   * Si l'entrée de notifications n'existe pas.
   */
  async updateNotificationPreferences(userId: string, dto: Partial<{
    ordersPush: boolean; ordersEmail: boolean; ordersInApp: boolean; ordersSms: boolean;
    followsPush: boolean; followsEmail: boolean; followsInApp: boolean; followsSms: boolean;
    promosPush: boolean; promosEmail: boolean; promosSms: boolean;
    securityEmail: boolean; securityInApp: boolean;
  }>) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }

  async getUsersForTesting() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
        kycStatus: true,
        boutiqueName: true,
        province: true,
        commune: true,
        city: true,
        country: true,
        trustScore: true,
        createdAt: true,
      },
    });
  }

  async clearUsersForTesting() {
    await this.prisma.refreshToken.deleteMany({});
    await this.prisma.user.deleteMany({});
    this.logger.warn('All users and tokens cleared (DEV)');
  }
}
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import { JwtPayload, TokenPair, TokenGenerationOptions } from '../types/token.types';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

/**
 * Service de gestion des tokens JWT (access & refresh)
 * 
 * Responsabilits :
 * - Gnration de paires de tokens
 * - Validation et rafrachissement des tokens
 * - Rvocation de tokens (logout)
 * - Rotation des refresh tokens pour scurit renforce
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Gnre une paire de tokens (access + refresh) pour un utilisateur
   */
  async generateTokenPair(
    user: User,
    options?: TokenGenerationOptions
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.generateAccessToken(payload, options?.accessTokenExpiry),
      this.generateRefreshToken(payload, options?.refreshTokenExpiry),
    ]);

    return { access_token, refresh_token };
  }

  /**
   * Sauvegarde un refresh token dans la base de donnes
   */
  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS);

    try {
      await this.prisma.refreshToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });
      
      this.logger.debug(`Refresh token saved for user ${userId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to save refresh token: ${message}`);
      throw new HttpException(
        'Failed to save refresh token',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Rvoque un refresh token spcifique (logout simple)
   */
  async revokeRefreshToken(userId: string, token: string): Promise<boolean> {
    if (!token) {
      this.logger.debug(`No refresh token provided for revocation, user ${userId}`);
      return false;
    }

    const tokenHash = this.hashToken(token);
    
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: { userId, tokenHash },
      });

      if (result.count === 0) {
        this.logger.warn(`Token not found for user ${userId} during revocation`);
        return false;
      }

      this.logger.debug(`Refresh token revoked for user ${userId}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to revoke token: ${message}`);
      throw new HttpException(
        'Failed to revoke token',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Rvoque TOUS les refresh tokens d'un utilisateur
   */
  async revokeAllRefreshTokens(userId: string): Promise<number> {
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });

      this.logger.debug(`${result.count} tokens revoked for user ${userId}`);
      return result.count;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to revoke all tokens: ${message}`);
      throw new HttpException(
        'Failed to revoke tokens',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Valide et rafrachit une paire de tokens (Rotation)
   */
  async refreshTokenPair(userId: string, refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new HttpException(
        'Refresh token is required',
        HttpStatus.BAD_REQUEST
      );
    }

    const tokenHash = this.hashToken(refreshToken);

    try {
      // 1. Rcuprer le token stock
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      // 2. Verifier validit
      if (!storedToken) {
        throw new HttpException('Session expire ou invalide', HttpStatus.UNAUTHORIZED);
      }

      if (storedToken.expiresAt < new Date()) {
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } }).catch(() => {});
        throw new HttpException('Session expire', HttpStatus.UNAUTHORIZED);
      }

      // 3. Verifier userId
      if (storedToken.userId !== userId) {
        throw new HttpException('Utilisateur invalide', HttpStatus.FORBIDDEN);
      }

      // 4. Rotation : supprimer l'ancien
      await this.prisma.refreshToken.deleteMany({
        where: { tokenHash },
      });

      // 5. Nouvelle paire
      const user = storedToken.user;
      const newTokens = await this.generateTokenPair(user);

      // 6. Sauver nouveau refresh
      await this.saveRefreshToken(user.id, newTokens.refresh_token);

      return newTokens;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Token refresh failed: ${message}`);
      throw new HttpException('Erreur lors du rafrachissement', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async generateAccessToken(
    payload: JwtPayload,
    expiresIn: string = process.env.JWT_ACCESS_EXPIRATION || AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY
  ): Promise<string> {
    return this.jwtService.signAsync({ ...payload }, {
      secret: this.getSecret('JWT_ACCESS_SECRET'),
      expiresIn: expiresIn as any,
    });
  }

  private async generateRefreshToken(
    payload: JwtPayload,
    expiresIn: string = process.env.JWT_REFRESH_EXPIRATION || AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY
  ): Promise<string> {
    const enhancedPayload: JwtPayload = {
      ...payload,
      jti: crypto.randomBytes(16).toString('hex'),
    };

    return this.jwtService.signAsync({ ...enhancedPayload }, {
      secret: this.getSecret('JWT_REFRESH_SECRET'),
      expiresIn: expiresIn as any,
    });
  }

  private hashToken(token: string): string {
    if (!token) throw new Error('Cannot hash empty token');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private getSecret(key: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET'): string {
    const secret = key === 'JWT_ACCESS_SECRET'
      ? process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET
      : process.env.JWT_REFRESH_SECRET;

    if (process.env.NODE_ENV === 'production') {
      if (!secret || secret.length < AUTH_CONSTANTS.MIN_SECRET_LENGTH_PROD) {
        const displayKey = key === 'JWT_ACCESS_SECRET' ? 'JWT_ACCESS_SECRET or JWT_SECRET' : key;
        throw new Error(`Invalid or missing ${displayKey} in production`);
      }
      return secret;
    }

    if (!secret) {
      return key === 'JWT_ACCESS_SECRET' ? AUTH_CONSTANTS.DEV_SECRETS.JWT_SECRET : AUTH_CONSTANTS.DEV_SECRETS.JWT_REFRESH_SECRET;
    }
    return secret;
  }
}


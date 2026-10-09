import { Controller, Post, Body, HttpCode, HttpStatus, Get, Delete, Patch, Put, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RtGuard } from './guards/rt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UseGuards } from '@nestjs/common';
import { AuthThrottlerGuard } from './guards/auth-throttler.guard';
import type { JwtRequest, RefreshRequest } from './types/auth-request.types';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { FastifyReply } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // =============== PUBLIC ROUTES ===============

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthThrottlerGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.authService.login(loginDto);
    this.setRefreshTokenCookie(res, result.refresh_token);
    const { refresh_token, ...rest } = result;
    return rest;
  }

  @UseGuards(AuthThrottlerGuard)
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @UseGuards(AuthThrottlerGuard)
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  resendOtp(@Body('email') email: string) {
    return this.authService.resendOtp(email);
  }

  @UseGuards(AuthThrottlerGuard)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);

  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // =============== PROTECTED ROUTES ===============

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: JwtRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const userId = req.user.id;
    const refreshToken = req.cookies?.['wapibei_rt'];
    await this.authService.logout(userId, refreshToken);
    this.clearRefreshTokenCookie(res);
    return { success: true, message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Req() req: JwtRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const userId = req.user.id;
    await this.authService.logoutAll(userId);
    this.clearRefreshTokenCookie(res);
    return { success: true, message: 'All sessions logged out' };
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const userId = req.user.sub;
    const refreshToken = req.cookies?.['wapibei_rt'];
    const result = await this.authService.refreshTokens(userId, refreshToken);
    this.setRefreshTokenCookie(res, result.refresh_token);
    const { refresh_token, ...rest } = result;
    return rest;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@Req() req: JwtRequest) {
    const userId = req.user.id;
    return this.authService.getUserProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('profile')
  async updateProfile(
    @Req() req: JwtRequest,
    @Body() dto: any,
  ) {
    const userId = req.user.id;
    return this.authService.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('profile')
  async patchProfile(
    @Req() req: JwtRequest,
    @Body() dto: any,
  ) {
    const userId = req.user.id;
    return this.authService.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notification-preferences')
  @HttpCode(HttpStatus.OK)
  getNotificationPreferences(@Req() req: JwtRequest) {
    return this.authService.getNotificationPreferences(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('notification-preferences')
  @HttpCode(HttpStatus.OK)
  updateNotificationPreferences(
    @Req() req: JwtRequest,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.authService.updateNotificationPreferences(req.user.id, dto);
  }

  // =============== DEV ROUTES ===============

  @Get('test-users')
  @HttpCode(HttpStatus.OK)
  async getTestUsers() {
    if (process.env.NODE_ENV === 'production') {
      return { success: false, message: 'Not available in production' };
    }
    const users = await this.authService.getUsersForTesting();
    return {
      success: true,
      count: users.length,
      users,
    };
  }

  @Delete('test-users')
  @HttpCode(HttpStatus.OK)
  async clearTestUsers() {
    if (process.env.NODE_ENV === 'production') {
      return { success: false, message: 'Not available in production' };
    }
    await this.authService.clearUsersForTesting();
    return {
      success: true,
      message: 'Test users cleared',
      timestamp: new Date().toISOString(),
    };
  }

  private setRefreshTokenCookie(res: FastifyReply, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.setCookie('wapibei_rt', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearRefreshTokenCookie(res: FastifyReply) {
    res.clearCookie('wapibei_rt', {
      path: '/api/auth',
    });
  }
}


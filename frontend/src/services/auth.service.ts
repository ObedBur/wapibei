import { api, setAccessToken, getAccessToken } from '@/lib/axios';
import axios from 'axios';
import { LoginDto, RegisterDto, AuthResponse, User, RegisterResponse, VerifyOtpDto, VerifyOtpResponse, ResendOtpDto, ResendOtpResponse, ForgotPasswordDto, ForgotPasswordResponse, ResetPasswordDto, ResetPasswordResponse } from '@/types/auth';

export const authService = {
  async register(data: RegisterDto): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    this.handleAuthResponse(response.data);
    return response.data;
  },

  handleAuthResponse(data: AuthResponse) {
    setAccessToken(data.access_token);
    // Le refresh token est maintenant dans un cookie HttpOnly, plus dans localStorage
    
    // Ajout d'un cookie de rôle pour le middleware (proxy.ts)
    if (typeof window !== 'undefined') {
      document.cookie = `wapibei_role=${data.user.role}; path=/; max-age=604800; samesite=lax`;
    }
  },

  async logout(): Promise<void> {
    try {
      // Le refresh token est dans le cookie HttpOnly, pas besoin de l'envoyer
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setAccessToken(null);
      // Supprimer le cookie de rôle
      if (typeof window !== 'undefined') {
        document.cookie = 'wapibei_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  },

  async initAuth(): Promise<User | null> {
    try {
      const currentToken = getAccessToken();
      
      // Si on n'a pas d'access token (suite à un F5), on rafraîchit MANUELLEMENT 
      // avant d'appeler /auth/profile. Le cookie HttpOnly sera envoyé automatiquement.
      if (!currentToken) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';
        const refreshResponse = await axios.post(`${apiUrl}/auth/refresh`, {}, {
          withCredentials: true, // Important pour envoyer le cookie HttpOnly
        });
        
        setAccessToken(refreshResponse.data.access_token);
      }

      const response = await api.get<{ success: boolean; user: User }>('/auth/profile');
      return response.data.user;
    } catch (error) {
      console.error('Failed to init auth session:', error);
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        document.cookie = 'wapibei_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      return null;
    }
  },

  async verifyOtp(data: VerifyOtpDto): Promise<VerifyOtpResponse> {
    const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', data);
    return response.data;
  },

  async resendOtp(data: ResendOtpDto): Promise<ResendOtpResponse> {
    const response = await api.post<ResendOtpResponse>('/auth/resend-otp', data);
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  },

  async resetPassword(data: ResetPasswordDto): Promise<ResetPasswordResponse> {
    const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
    return response.data;
  },

  async updateProfile(data: any): Promise<{ success: boolean; user: User }> {
    // On envoie tout en JSON par défaut pour éviter l'erreur 415 Multipart sur Fastify sans plugin
    const response = await api.patch<{ success: boolean; user: User }>('/auth/profile', data);
    return response.data;
  }
};

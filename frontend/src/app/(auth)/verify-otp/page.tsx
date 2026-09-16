'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/i18n/useT';
import { mapBackendError } from '@/utils/errors';
import { OtpInput } from '@/components/ui/OtpInput';
import { Button } from '@/components/ui/Button';

import { Suspense } from 'react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, hideToast } = useToast();
  const { t } = useT();
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('registrationEmail');
    const userEmail = emailParam || storedEmail || '';
    setEmail(userEmail);

    if (!userEmail) {
      router.push('/register');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpComplete = (otpCode: string) => {
    handleSubmit(otpCode);
  };

  const handleSubmit = async (otpCode: string) => {
    if (otpCode.length !== 6) return;

    setOtpError(false);
    setIsLoading(true);
    // On stocke l'ID du toast de chargement
    const loadingToastId = showToast(t('auth.verifyOtp.loadingToast'), 'loading');

    try {
      await authService.verifyOtp({ email, otp: otpCode });
      
      // On supprime le toast de chargement avant d'afficher le succès
      hideToast(loadingToastId);
      showToast(t('auth.verifyOtp.successToast'), 'success');
      
      localStorage.removeItem('registrationEmail');

      // Redirection rapide vers login (1s pour voir le message de succès)
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // On supprime aussi le toast en cas d'erreur
      hideToast(loadingToastId);
      
      setOtpError(true);
      showToast(mapBackendError(err, t), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    try {
      await authService.resendOtp({ email });
      showToast(t('auth.verifyOtp.resendSuccessToast'), 'success');
      setTimer(60);
      setOtpError(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(mapBackendError(err, t), 'error');
    }
  };

  return (
    <div className="flex items-center justify-center p-2 sm:p-4 font-sans">
      {/* Main Container */}
      <div className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden flex flex-col h-auto min-h-[520px] sm:min-h-[600px]">

        {/* Top App Bar */}
        <header className="flex items-center justify-between p-4 sm:p-6 z-10">
          <Link href="/register" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-800 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex-1"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-5 sm:px-8 pt-3 sm:pt-4 pb-6 sm:pb-8">

          {/* Icon/Hero Section */}
          <div className="flex flex-col items-center justify-center mb-5 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4 sm:mb-6 relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-[#E67E22]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div className="absolute top-0 right-0 w-5 h-5 bg-[#E67E22] rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <h1 className="text-slate-900 dark:text-white text-2xl sm:text-[28px] font-bold leading-tight text-center mb-2 sm:mb-3">{t('auth.verifyOtp.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-normal leading-relaxed text-center max-w-[260px] sm:max-w-[280px]">
              {t('auth.verifyOtp.description')}<span className="font-medium text-slate-900 dark:text-slate-200" translate="no">{isMounted ? (email || t('auth.verifyOtp.yourEmail')) : '...'}</span>.
            </p>
          </div>

          {/* OTP Input Section */}
          <div className="flex flex-col items-center w-full mb-5 sm:mb-8">
            <OtpInput length={6} onComplete={handleOtpComplete} error={otpError} />
          </div>

          {/* Timer and Resend */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 mb-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                {t('auth.verifyOtp.timerPrefix')} <span className="text-[#E67E22] font-bold">00:{timer.toString().padStart(2, '0')}</span>
              </p>
            </div>
            <button
              type="button"
              className={`text-sm font-semibold transition-colors ${timer === 0 ? 'text-[#E67E22] hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'}`}
              disabled={timer > 0}
              onClick={handleResend}
            >
              {t('auth.verifyOtp.resendButton')}
            </button>
          </div>

          {/* Bottom Action Area */}
          <div className="mt-5 sm:mt-8 w-full">
            <Button
              isLoading={isLoading}
              fullWidth
              disabled={isLoading}
              className="!bg-[#E67E22] hover:!bg-[#D35400] !shadow-lg !shadow-[#E67E22]/25 !border-none transition-all duration-300"
              onClick={() => {
                // If the user clicks manual verify, we check if OTP is filled elsewhere
                // But OtpInput auto-submits on completion
              }}
            >
              <span>{t('auth.verifyOtp.verifyButton')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>
            <div className="mt-4 sm:mt-6 flex justify-center">
              <a href="#" className="text-sm text-slate-500 hover:text-[#E67E22] dark:text-slate-400 dark:hover:text-[#E67E22] transition-colors">
                {t('auth.verifyOtp.needHelp')}
              </a>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-2 sm:p-4 font-sans min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b border-[#E67E22]"></div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}

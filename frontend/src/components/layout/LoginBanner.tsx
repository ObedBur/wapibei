"use client";
import React from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n/useT";

export const LoginBanner: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useT();

  // Don't show the banner if the user is already authenticated or if we're still loading the auth state
  if (isAuthenticated || isLoading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none md:bottom-6 md:right-6">
      <div className="pointer-events-auto">
        <div className="bg-[#ffebdb]/95 dark:bg-slate-900/90 backdrop-blur-md border border-[#E67E22]/30 dark:border-white/10 p-3 rounded-2xl flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-10 max-w-sm">
          <div className="flex items-center gap-3 pl-1">
            <div className="size-8 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <LogIn className="w-5 h-5 text-[#E67E22]" strokeWidth={1.75} />
            </div>
            <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-tight">
              {t('home.loginBanner.message')}
            </p>
          </div>
          <Link
            href="/login"
            className="h-9 px-4 text-xs bg-[#E67E22] hover:bg-[#E67E22]/90 text-white rounded-xl font-bold transition-all transform active:scale-[0.98] flex items-center justify-center shrink-0 shadow-lg shadow-[#E67E22]/30"
          >
            {t('home.loginBanner.action')}
          </Link>
        </div>
      </div>
    </div>
  );
};

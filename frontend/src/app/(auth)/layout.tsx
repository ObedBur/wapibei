"use client";

import React from "react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { useT } from "@/i18n/useT";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language, setLanguage } = useSettings();
  const { t } = useT();

  return (
    <div className="bg-white dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-100 min-h-screen flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-3xl animate-fade-in"></div>
        <div
          className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] bg-red-500/10 rounded-full blur-3xl animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 w-full">{children}</div>

      {/* Micro-Footer */}
      <footer className="relative z-10 py-8 border-t border-slate-100 dark:border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright & Badge de confiance */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                © 2026 WapiBei{" "}
                <span className="hidden sm:inline">• {t("auth.footer.secure")}</span>
              </p>
            </div>

            {/* Liens de Navigation Secondaires */}
            <nav className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Link
                href="/terms"
                className="hover:text-orange-500 transition-colors"
              >
                {t("auth.footer.terms")}
              </Link>
              <Link
                href="/privacy"
                className="hover:text-orange-500 transition-colors"
              >
                {t("auth.footer.privacy")}
              </Link>
              <Link
                href="/cookies"
                className="hover:text-orange-500 transition-colors"
              >
                {t("auth.footer.help")}
              </Link>
            </nav>

            {/* Sélecteur de Langue Stylisé */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="opacity-50">{t("auth.footer.languageLabel")}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as typeof language)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
              </select>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

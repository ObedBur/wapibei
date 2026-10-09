'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Bell,
  ShoppingBag,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '@/types/auth';
import { ProfileDropdown } from './ProfileDropdown';
import { GlobalSearch } from './GlobalSearch';
import { LocationCurrencySelector } from './LocationCurrencySelector';
import { CategoriesDropdown } from './CategoriesDropdown';
import { NotificationDropdownPanel } from './NotificationDropdownPanel';
import { useAppNotifications } from '@/hooks/useAppNotifications';
import { useEscape } from '@/hooks/useEscape';
import { useT } from '@/i18n/useT';

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// VARIANCE: 7 / MOTION: 6 / DENSITY: 5
// Cubic-bezier premium: simule la physique réelle (masse + ressort)
// Utilisé inline via ease-[cubic-bezier(0.32,0.72,0,1)] dans les classNames.

interface DesktopHeaderProps {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: User | null;
  logout: () => void;
  totalItems: number;
}



// ─── Main ─────────────────────────────────────────────────────────────────────
export const DesktopHeader = ({
  isAuthenticated,
  isAuthLoading,
  user,
  logout,
  totalItems,
}: DesktopHeaderProps) => {
  const pathname = usePathname();
  const { t } = useT();
  const isActive = (path: string) => pathname === path;
  const { unreadCount } = useAppNotifications();

  const isAuthPage = [
    '/login', '/register', '/forgot-password', '/reset-password', '/verify-otp',
  ].some((path) => pathname.startsWith(path));

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Échap : ferme les notifications et rend le focus à la cloche
  useEscape(isNotifOpen, () => {
    setIsNotifOpen(false);
    bellRef.current?.focus();
  });

  // ── Vue auth épurée ──────────────────────────────────────────────────────
  if (isAuthPage) {
    return (
      <div className="hidden lg:flex w-full h-[72px] items-center justify-between px-6 lg:px-10 max-w-[1440px] mx-auto">
        <Link
          href="/"
          className="flex items-center gap-3 group select-none"
          aria-label="Wapibei - Retour à l'accueil"
        >
          {/* Double-bezel logo container */}
          <div className="p-[3px] rounded-[14px] bg-gradient-to-br from-[#E67E22]/20 to-[#E67E22]/5 ring-1 ring-[#E67E22]/20">
            <div className="size-10 rounded-[11px] bg-gradient-to-tr from-[#E67E22] to-[#F39C12] p-1.5 flex items-center justify-center shadow-inner shadow-white/20">
              <Image
                src="/shopping-cart.png"
                alt="WapiBei"
                width={28}
                height={28}
                className="w-full h-full object-contain filter brightness-0 invert"
                priority
              />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight">
            <span className="text-[#E67E22]">Wapi</span>
            <span className="text-[#2D5A27]">Bei</span>
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-[#E67E22] bg-gray-100/60 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>{t('header.nav.home')}</span>
        </Link>
        <div className="w-[120px] invisible" />
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col w-full">

      {/* ── NIVEAU 1 : TOPBAR ─────────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0f0f0f] border-b border-gray-100/60 dark:border-white/[0.06]">
        <div className="flex w-full h-[76px] items-center justify-between px-6 xl:px-10 max-w-[1440px] mx-auto gap-8 xl:gap-12">

          {/* ── LOGO (double-bezel premium) ─────────────────────────────── */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="flex items-center gap-3.5 group select-none"
              aria-label="Wapibei - Retour à l'accueil"
            >
              {/* Outer shell */}
              <div className="p-[3px] rounded-[16px] ring-1 ring-[#E67E22]/20 dark:ring-[#E67E22]/15 bg-gradient-to-br from-[#E67E22]/15 to-transparent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:ring-[#E67E22]/40 group-hover:from-[#E67E22]/25">
                {/* Inner core */}
                <div className="relative size-11 rounded-[13px] bg-gradient-to-tr from-[#E67E22] to-[#F5A623] flex items-center justify-center shadow-lg shadow-[#E67E22]/30 overflow-hidden">
                  {/* Inner highlight */}
                  <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]" />
                  <Image
                    src="/shopping-cart.png"
                    alt="WapiBei"
                    width={32}
                    height={32}
                    className="w-[70%] h-[70%] object-contain filter brightness-0 invert relative z-10"
                    priority
                  />
                </div>
              </div>

              {/* Wordmark */}
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-[26px] font-black tracking-tight leading-none">
                  <span className="text-[#E67E22]">Wapi</span>
                  <span className="text-[#2D5A27] dark:text-emerald-400">Bei</span>
                </span>
                <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-slate-400 dark:text-slate-600">
                  Marketplace
                </span>
              </div>
            </Link>
          </div>

          {/* ── RECHERCHE CENTRALE ─────────────────────────────────────── */}
          <div className="flex-1 max-w-[680px] min-w-0">
            <GlobalSearch alwaysOpen />
          </div>

          {/* ── ACTIONS DROITE ─────────────────────────────────────────── */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">

            {/* Langue / Devise */}
            <LocationCurrencySelector />

            {/* Séparateur vertical */}
            <div className="w-px h-7 bg-gray-100 dark:bg-white/8 shrink-0" />

            {/* ── Notifications ───────────────────────────────────────── */}
            <div className="relative shrink-0" ref={notifRef}>
              <motion.button
                ref={bellRef}
                onClick={() => setIsNotifOpen((prev) => !prev)}
                aria-label={t('header.notifications')}
                aria-expanded={isNotifOpen}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`
                  relative flex flex-col items-center justify-center gap-0.5 p-2.5 rounded-xl
                  transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer
                  ${isNotifOpen
                    ? 'bg-[#E67E22]/10 text-[#E67E22]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#E67E22] hover:bg-gray-50 dark:hover:bg-white/5'
                  }
                `}
              >
                <Bell className="w-5 h-5" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute top-1.5 right-1.5 size-[18px] bg-[#E67E22] text-white text-[9px] font-black flex items-center justify-center rounded-full shadow-sm border-2 border-white dark:border-[#0f0f0f]"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Panneau de notifications partagé */}
              <NotificationDropdownPanel
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
              />
            </div>

            {/* ── Panier (double-bezel button-in-button) ──────────────── */}
            <Link
              href="/cart"
              className="group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gray-50 dark:hover:bg-white/5 shrink-0"
            >
              {/* Outer shell */}
              <div className="p-[3px] rounded-[14px] ring-1 ring-gray-200/80 dark:ring-white/8 group-hover:ring-[#E67E22]/30 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                {/* Inner icon */}
                <div className="relative size-9 rounded-[11px] bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 group-hover:bg-[#E67E22] group-hover:text-white transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <ShoppingBag className="w-4.5 h-4.5" strokeWidth={1.5} />
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className="absolute -top-2 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E67E22] px-1 text-[9px] font-black text-white shadow-sm border-2 border-white dark:border-[#0f0f0f] group-hover:bg-white group-hover:text-[#E67E22] transition-colors duration-200"
                    >
                      {totalItems > 99 ? '99+' : totalItems}
                    </motion.span>
                  )}
                </div>
              </div>
              <div className="flex flex-col text-left leading-none gap-0.5">
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Panier
                </span>
                <span className="text-[13px] font-black tracking-tight text-gray-900 dark:text-white group-hover:text-[#E67E22] transition-colors duration-200">
                  {totalItems} article{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>

            {/* ── Profil ──────────────────────────────────────────────── */}
            <ProfileDropdown
              isAuthenticated={isAuthenticated}
              isAuthLoading={isAuthLoading}
              user={user}
              onLogout={logout}
              isProfileOpen={isProfileOpen}
              setIsProfileOpen={setIsProfileOpen}
            />
          </div>
        </div>
      </div>

      {/* ── NIVEAU 2 : SOUS-BARRE — 3 chunks : catégories | confiance | actions ── */}
      <div className="w-full bg-white dark:bg-[#0f0f0f] border-b border-gray-100/60 dark:border-white/[0.06] relative z-40">
        <div className="flex items-center justify-between px-6 xl:px-10 max-w-[1440px] mx-auto h-[46px]">

          <div className="flex items-center min-w-0 flex-1">

            {/* Chunk 1 : Méga-menu catégories */}
            <CategoriesDropdown />

            <div className="w-px h-4 bg-gray-200 dark:bg-white/8 mx-4 shrink-0" />

            {/* Chunk 2 : Confiance & provenance */}
            <nav className="flex items-center min-w-0">
              {[
                { label: 'Direct Producteur', href: '/products?filter=local' },
                { label: 'Vendeurs vérifiés', href: '/sellers' },
                { label: 'Boutique Express',  href: '/products?category=Boutique+Express' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={`
                    group relative flex items-center px-4 h-[46px] text-[13px] whitespace-nowrap shrink-0 select-none
                    transition-colors duration-200
                    ${isActive(href)
                      ? 'text-[#E67E22] font-semibold'
                      : 'text-gray-600 dark:text-gray-300 font-normal hover:text-[#E67E22] dark:hover:text-[#E67E22]'
                    }
                  `}
                >
                  {label}
                  <span className={`
                    absolute bottom-0 left-4 right-4 h-[2px] rounded-t-full bg-[#E67E22]
                    origin-left transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isActive(href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                  `} />
                </Link>
              ))}
            </nav>

            <div className="w-px h-4 bg-gray-200 dark:bg-white/8 mx-4 shrink-0" />

            {/* Chunk 3 : Actions (SuperDeals + Comparer) */}
            <nav className="flex items-center min-w-0">
              {[
                { label: 'SuperDeals', href: '/products?filter=deals', accent: true },
                { label: 'Comparer',   href: '/compare',               accent: false },
              ].map(({ label, href, accent }) => (
                <Link
                  key={label}
                  href={href}
                  className={`
                    group relative flex items-center gap-1.5 px-4 h-[46px] text-[13px] whitespace-nowrap shrink-0 select-none
                    transition-colors duration-200
                    ${isActive(href)
                      ? 'text-[#E67E22] font-semibold'
                      : accent
                        ? 'text-rose-600 dark:text-rose-400 font-medium hover:text-rose-700 dark:hover:text-rose-300'
                        : 'text-gray-600 dark:text-gray-300 font-normal hover:text-[#E67E22] dark:hover:text-[#E67E22]'
                    }
                  `}
                >
                  {accent && <span className="size-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden="true" />}
                  {label}
                  <span className={`
                    absolute bottom-0 left-4 right-4 h-[2px] rounded-t-full bg-[#E67E22]
                    origin-left transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isActive(href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                  `} />
                </Link>
              ))}
            </nav>
          </div>

        </div>
      </div>
    </div>
  );
};


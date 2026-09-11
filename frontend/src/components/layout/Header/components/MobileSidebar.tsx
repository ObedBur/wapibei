'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { User as UserType } from '@/types/auth';
import {
  X,
  Home,
  ShoppingBag,
  Store,
  Scale,
  LayoutGrid,
  Settings,
  LogOut,
  User as UserIcon,
  ArrowRight,
  ChevronRight,
  GripHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { useT } from '@/i18n/useT';

interface NavLink {
  id: string;
  label: string;
  icon: string;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: UserType | null;
  onLogout: () => void;
}

const NAV_ICONS: Record<string, LucideIcon> = {
  home: Home,
  inventory_2: ShoppingBag,
  store: Store,
  compare_arrows: Scale,
};
const MobileSidebarContent: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  navLinks,
  isAuthenticated,
  isAuthLoading,
  user,
  onLogout,
}) => {
  const pathname = usePathname();
  const { t } = useT();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isActive = (path: string) => pathname === path;

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || 'U';

  const isVendor = user?.role === 'VENDOR';
  const navItems = navLinks.map((item) => ({
    ...item,
    Icon: NAV_ICONS[item.icon] ?? Home,
  }));

  const sidebarContent = (
    <div
      className={`fixed inset-0 z-[99999] transition-all duration-500 ${
        isOpen ? 'visible' : 'invisible'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-[88vw] max-w-[400px] bg-[#F8FAFC] dark:bg-[#0f172a] shadow-[0_0_60px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) rounded-l-[2.5rem] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
          {/* Header section with Menu & Login */}
          <div className="bg-white dark:bg-[#1e293b] pt-8 pb-6 px-6 sm:px-8 rounded-bl-[2.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] shrink-0">
            {/* Title + Close */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-xl font-black text-[#0F172A] dark:text-white uppercase tracking-wider">
                  {t('header.menu')}
                </span>
                <div className="h-1 w-8 bg-[#E67E22] rounded-full mt-1.5" />
              </div>

              <button
                onClick={onClose}
                aria-label={t('header.menu')}
                className="size-10 flex items-center justify-center rounded-full bg-[#F1F5F9] dark:bg-white/10 text-[#0F172A] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Auth Card */}
            {isAuthLoading ? (
              <div className="h-[84px] w-full rounded-3xl bg-gray-100 dark:bg-white/5 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4 bg-[#0F172A] dark:bg-white/5 p-4 sm:p-5 rounded-3xl shadow-lg shadow-slate-900/10">
                <div className="size-12 sm:size-14 rounded-2xl bg-[#E67E22] flex items-center justify-center text-white text-lg font-black shadow-inner overflow-hidden relative shrink-0">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName || ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    getInitials(user?.fullName || '')
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-white truncate">
                    {user?.fullName?.split(' ')[0]}
                  </p>
                  <p className="text-xs text-white/60 mt-0.5 truncate">
                    {isVendor ? t('header.vendor') : t('header.client')}
                  </p>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-4 bg-[#0F172A] dark:bg-white/5 p-4 sm:p-5 rounded-3xl shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-transform group"
              >
                <div className="size-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <UserIcon size={20} className="text-white" strokeWidth={2} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-white">{t('header.login')}</p>
                  <p className="text-[11px] text-white/60 mt-0.5 truncate">{t('header.loginDesc')}</p>
                </div>

                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#E67E22] transition-colors">
                  <ArrowRight size={16} className="text-white" strokeWidth={2} />
                </div>
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <div className="px-4 sm:px-6 py-6 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <LayoutGrid size={15} className="text-[#94A3B8]" strokeWidth={2.5} />
              <span className="text-[11px] font-black text-[#64748B] dark:text-gray-400 uppercase tracking-widest shrink-0">
                {t('header.mainNavigation')}
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            </div>

            <div className="flex flex-col gap-1">
              {navItems.map(({ id, label, Icon }) => {
                const active = isActive(id);

                return (
                  <Link
                    key={id}
                    href={id}
                    onClick={onClose}
                    className={`flex items-center gap-4 py-3.5 px-3 rounded-2xl transition-colors duration-200 ${
                      active
                        ? 'bg-[#E67E22]/10 dark:bg-[#E67E22]/20'
                        : 'hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    
                      <Icon
                        size={22}
                        strokeWidth={active ? 2.5 : 2}
                        className={active ? 'text-[#E67E22]' : 'text-slate-500 dark:text-slate-400'}
                      />
                    <span className={`min-w-0 flex-1 text-[16px] font-semibold ${active ? 'text-[#E67E22] dark:text-[#E67E22]' : 'text-slate-700 dark:text-slate-200'}`}>
                      {label}
                    </span>

                    {active && <div className="size-1.5 rounded-full bg-[#E67E22]" />}
                  </Link>
                );
              })}
            </div>

            {/* Authenticated extras */}
            {isAuthenticated && (
              <div className="mt-8 pt-1">
                <div className="flex items-center gap-3 mb-5">
                  <GripHorizontal size={15} className="text-[#94A3B8]" strokeWidth={2.5} />
                  <span className="text-[11px] font-black text-[#64748B] dark:text-gray-400 uppercase tracking-widest shrink-0">
                    {isVendor ? t('header.vendorSpace') : t('header.clientSpace')}
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                </div>

                <div className="flex flex-col gap-1">
                  {isVendor && (
                    <Link
                      href="/dashboard"
                      onClick={onClose}
                      className={`flex items-center gap-4 py-3.5 px-3 rounded-2xl transition-colors duration-200 ${
                        isActive('/dashboard')
                          ? 'bg-[#E67E22]/10 dark:bg-[#E67E22]/20'
                          : 'hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <LayoutGrid size={22} strokeWidth={isActive('/dashboard') ? 2.5 : 2} className={isActive('/dashboard') ? 'text-[#E67E22]' : 'text-slate-500 dark:text-slate-400'} />
                      <span className={`flex-1 text-[15px] font-bold ${isActive('/dashboard') ? 'text-white' : 'text-[#0F172A] dark:text-white'}`}>
                        {t('header.dashboard')}
                      </span>
                      {isActive('/dashboard') && <div className="size-1.5 rounded-full bg-[#E67E22]" />}
                    </Link>
                  )}

<Link
                    href="/settings"
                    onClick={onClose}
                    className={`flex items-center gap-4 py-3.5 px-3 rounded-2xl transition-colors duration-200 ${
                      isActive('/settings')
                        ? 'bg-[#E67E22]/10 dark:bg-[#E67E22]/20'
                        : 'hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Settings size={22} strokeWidth={isActive('/settings') ? 2.5 : 2} className={isActive('/settings') ? 'text-[#E67E22]' : 'text-slate-500 dark:text-slate-400'} />
                    <span className={`flex-1 text-[15px] font-bold ${isActive('/settings') ? 'text-white' : 'text-[#0F172A] dark:text-white'}`}>
                      {t('header.myAccount')}
                    </span>
                    {isActive('/settings') && <div className="size-1.5 rounded-full bg-[#E67E22]" />}
                  </Link>

                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex items-center gap-4 py-3.5 px-3 rounded-2xl transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-500/10 mt-1"
                  >
                    <LogOut size={22} strokeWidth={2} className="text-red-500" />
                    <span className="flex-1 text-[16px] font-semibold text-red-500 text-left">
                      {t('header.logout')}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(sidebarContent, document.body);
};

export const MobileSidebar: React.FC<MobileSidebarProps> = (props) => {
  return (
    <React.Suspense fallback={null}>
      <MobileSidebarContent {...props} />
    </React.Suspense>
  );
};






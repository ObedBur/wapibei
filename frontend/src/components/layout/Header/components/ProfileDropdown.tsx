'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User as UserIcon, ChevronDown, ShieldCheck, LogOut, Package, Heart, Settings, Store } from 'lucide-react';
import { User } from '@/types/auth';
import { useT } from '@/i18n/useT';
import { useEscape } from '@/hooks/useEscape';

interface ProfileDropdownProps {
  isAuthenticated: boolean;
  isAuthLoading?: boolean;
  user: User | null;
  onLogout: () => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
  isAuthenticated, 
  isAuthLoading = false,
  user,
  onLogout,
  isProfileOpen, 
  setIsProfileOpen 
}) => {
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { t } = useT();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsProfileOpen]);

  // Échap : ferme le menu et rend le focus au bouton profil
  useEscape(isProfileOpen, () => {
    setIsProfileOpen(false);
    triggerRef.current?.focus();
  });

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  // Liens dynamiques selon rôle
  const getNavItems = () => {
    if (user?.role === 'VENDOR') {
      return [
        { label: t('header.dashboard'), href: '/dashboard', icon: Store },
        { label: t('header.myAccount'), href: '/settings', icon: Settings },
      ];
    } 
    
    return [
      { label: t('header.myAccount'), href: '/settings', icon: Settings },
      { label: t('header.myOrders'), href: '/settings?tab=orders', icon: Package },
      { label: t('header.myFavorites'), href: '/settings?tab=favorites', icon: Heart },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="relative shrink-0" ref={profileMenuRef}>
      {isAuthLoading ? (
        <div
          className="size-9 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse"
          aria-label={t('header.loadingProfile')}
        />
      ) : isAuthenticated ? (
        <button 
          type="button"
          ref={triggerRef}
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          aria-expanded={isProfileOpen}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-gray-700 dark:text-gray-300 group cursor-pointer"
        >
          <div className="size-8 rounded-full bg-[#E67E22] flex items-center justify-center text-white text-[11px] font-black shadow-xs overflow-hidden relative select-none">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName}
                fill
                className="object-cover"
              />
            ) : (
              getInitials(user?.fullName || '')
            )}
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate max-w-[80px]">
              Bonjour, {user?.fullName?.split(' ')[0] || 'Client'}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[11px] font-black tracking-tight text-gray-900 dark:text-white group-hover:text-[#E67E22] transition-colors">
                Mon Compte
              </span>
              <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
            </div>
          </div>
        </button>
      ) : (
        <Link 
          href="/login"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-gray-700 dark:text-gray-300 group cursor-pointer"
          title={t('header.login')}
          aria-label={t('header.login')}
        >
          <div className="size-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-800 dark:text-gray-200 group-hover:bg-[#E67E22] group-hover:text-white transition-colors">
            <UserIcon className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate">
              Bienvenue
            </span>
            <span className="text-[11px] font-black tracking-tight text-gray-900 dark:text-white group-hover:text-[#E67E22] transition-colors mt-0.5">
              Se connecter
            </span>
          </div>
        </Link>
      )}

      {isAuthenticated && isProfileOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 dark:bg-[#151515] backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-3">
            <div className="mb-2 px-2 pb-2 border-b border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                {user?.role === 'VENDOR' ? t('header.menuVendor') : t('header.menuPersonal')}
              </span>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate mt-0.5">
                {user?.fullName}
              </p>
            </div>

            <div className="space-y-0.5">
              {navItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-[#E67E22]/10 hover:text-[#E67E22] transition-all group"
                  >
                    <ItemIcon className="w-4 h-4 text-gray-400 group-hover:text-[#E67E22] transition-colors" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-[#2D5A27]/10 hover:text-[#2D5A27] transition-all group"
                >
                  <ShieldCheck className="w-4 h-4 text-[#2D5A27]" strokeWidth={1.75} />
                  <span>{t('header.admin')}</span>
                </Link>
              )}
            </div>

            <div className="h-px bg-gray-100 dark:bg-white/5 my-2"></div>

            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group cursor-pointer"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.75} />
              <span>{t('header.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/types/auth';
import { ChevronDown } from 'lucide-react';
import { useT } from '@/i18n/useT';

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

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  // Build dynamic navigation based on user role
  const getNavItems = () => {
    if (user?.role === 'VENDOR') {
      // Links specific to Sellers
      return [
        { label: t('header.dashboard'), href: '/dashboard' },
        { label: t('header.myAccount'), href: '/settings' }
      ];
    } 
    
    // Links specific to Customers (and Admin)
    return [
      { label: t('header.myAccount'), href: '/settings' },
      { label: t('header.myOrders'), href: '/settings?tab=orders' },
      { label: t('header.myFavorites'), href: '/settings?tab=favorites' }
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="relative" ref={profileMenuRef}>
      {isAuthLoading ? (
        <div
          className="size-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse"
          aria-label={t('header.loadingProfile')}
        />
      ) : isAuthenticated ? (
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="group p-0.5 flex items-center gap-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300"
        >
          <div className="size-9 rounded-full bg-[#5E5CE6] flex items-center justify-center text-white text-[11px] font-black shadow-sm group-hover:shadow-md transition-all duration-300 overflow-hidden relative select-none">
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
          <div className="hidden sm:flex flex-col items-start pr-1">
            <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider leading-tight">
              {user?.fullName?.split(' ')[0] || 'OBED'}
            </span>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">
              {user?.role === 'VENDOR' ? t('header.vendorBadge') : t('header.clientBadge')}
            </span>
          </div>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <Link 
          href="/login"
            className="size-10 flex items-center justify-center text-slate-900 dark:text-gray-400 hover:text-[#4f46e5] hover:bg-blue-50 dark:hover:bg-white/5 rounded-full transition-all duration-300"
            title={t('header.login')}
        >
            <span className="material-symbols-outlined text-[24px]">account_circle</span>
        </Link>
      )}

      {isAuthenticated && isProfileOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-white/5 overflow-hidden z-[200] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          {/* Body */}
          <div className="p-2.5">
            <div className="mb-1 px-2.5">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] py-2 block">
                {user?.role === 'VENDOR' ? t('header.menuVendor') : t('header.menuPersonal')}
              </span>
            </div>

            <div className="space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 dark:text-gray-300 hover:bg-[#4f46e5]/5 dark:hover:bg-white/5 hover:text-[#4f46e5] transition-all group"
                >
                  {item.label}
                </Link>
              ))}

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 dark:text-gray-300 hover:bg-[#2D5A27]/5 dark:hover:bg-white/5 hover:text-[#2D5A27] transition-all group"
                >
                  <span className="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-[#2D5A27] transition-colors">admin_panel_settings</span>
                  {t('header.admin')}
                </Link>
              )}
            </div>

            <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-2"></div>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">logout</span>
              {t('header.logout')}
            </button>
          </div>

          {/* Footer/Badge */}
          <div className="p-3 bg-gray-50/50 dark:bg-white/5 text-center">
            <p className="text-[9px] font-black text-[#2D5A27] uppercase tracking-widest">{t('header.exclusive')}</p>
          </div>
        </div>
      )}
    </div>
  );
};



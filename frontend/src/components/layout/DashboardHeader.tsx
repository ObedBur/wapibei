'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProfileDropdown } from './Header/components/ProfileDropdown';
import { NotificationDropdownPanel } from './Header/components/NotificationDropdownPanel';
import { Bell, Search } from 'lucide-react';
import { useAppNotifications } from '@/hooks/useAppNotifications';
import { useEscape } from '@/hooks/useEscape';
import { useT } from '@/i18n/useT';

export const DashboardHeader = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const router = useRouter();
    const { t } = useT();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const notifRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLButtonElement>(null);

    const { unreadCount } = useAppNotifications();

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

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;
        router.push(`/products?q=${encodeURIComponent(query)}`);
    };

    return (
        <>
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-black/[0.03] dark:border-slate-700/70 h-16 md:h-20 shrink-0">
            <div className="container mx-auto max-w-7xl h-full px-6 md:px-12 lg:px-16 flex items-center justify-between">

                {/* Left: Logo */}
                <div className="flex items-center gap-3 md:hidden">
                    <Link href="/" className="flex items-center gap-2 cursor-pointer shrink-0 group">
                        <div className="flex items-center justify-center size-8 rounded-xl bg-[#E67E22] shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
                            <div className="size-[14px] bg-white rounded-sm rotate-45" />
                        </div>
                        <h1 className="text-[18px] font-black tracking-tighter uppercase">
                            <span className="text-[#E67E22]">Wapi</span>
                            <span className="text-[#2D5A27] dark:text-[#52c140]">Bei</span>
                        </h1>
                    </Link>
                </div>

                {/* Center: Search (desktop only) */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="relative w-64 md:w-80 hidden md:block"
                    role="search"
                >
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={16} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('products.sidebar.searchPlaceholder')}
                        aria-label={t('products.sidebar.search')}
                        className="w-full bg-[#F3F4F6] dark:bg-white/5 border-none rounded-full pl-11 pr-4 py-2 text-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#E67E22]/10 dark:text-white"
                    />
                </form>

                {/* Right: Notifications + Profile */}
                <div className="flex items-center gap-4 sm:gap-6">

                    {/* Notification Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            ref={bellRef}
                            onClick={() => setIsNotifOpen(prev => !prev)}
                            aria-label={t('header.notifications')}
                            aria-expanded={isNotifOpen}
                            className="relative size-9 flex items-center justify-center text-slate-500 hover:text-[#E67E22] hover:bg-[#E67E22]/10 rounded-full transition-all duration-300 shrink-0"
                        >
                            <Bell size={20} strokeWidth={1.75} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 size-5 bg-[#E67E22] text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white dark:border-[#111]">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Panneau de notifications partagé */}
                        <div className="fixed left-4 right-4 top-[72px] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+12px)] sm:origin-top-right origin-top z-50">
                            <NotificationDropdownPanel
                                isOpen={isNotifOpen}
                                onClose={() => setIsNotifOpen(false)}
                                className="w-full sm:w-80"
                            />
                        </div>
                    </div>

                    <div className="h-5 w-px bg-slate-200 dark:bg-white/10 hidden lg:block" />

                    <ProfileDropdown
                        isAuthenticated={isAuthenticated}
                        user={user}
                        onLogout={logout}
                        isProfileOpen={isProfileOpen}
                        setIsProfileOpen={setIsProfileOpen}
                    />
                </div>
            </div>
        </header>

        </>
    );
};

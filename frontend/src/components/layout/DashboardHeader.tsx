'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProfileDropdown } from './Header/components/ProfileDropdown';
import { Search } from 'lucide-react';
import { useAppNotifications } from '@/hooks/useAppNotifications';
import { resolveNotificationUrl } from '@/types/notification';

export const DashboardHeader = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const { notifications, unreadCount, markAsRead } = useAppNotifications();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                <div className="relative w-64 md:w-80 hidden md:block">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={16} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-[#F3F4F6] dark:bg-white/5 border-none rounded-full pl-11 pr-4 py-2 text-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#E67E22]/10 dark:text-white"
                    />
                </div>

                {/* Right: Notifications + Profile */}
                <div className="flex items-center gap-4 sm:gap-6">

                    {/* Notification Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setIsNotifOpen(prev => !prev)}
                            className="relative size-9 flex items-center justify-center text-slate-500 hover:text-[#E67E22] hover:bg-[#E67E22]/10 rounded-full transition-all duration-300 shrink-0"
                        >
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 size-5 bg-[#E67E22] text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white dark:border-[#111] animate-in zoom-in">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        <div className={`absolute right-0 top-[calc(100%+12px)] w-80 transition-all duration-300 transform origin-top-right z-50 ${isNotifOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                            <div className="bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[400px]">

                                <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent shrink-0">
                                    <h3 className="text-black dark:text-white font-black text-sm tracking-tight">Notifications</h3>
                                    {unreadCount > 0 ? (
                                        <span className="text-[10px] text-white font-black bg-[#E67E22] px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                            {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-gray-400 font-bold bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-widest">
                                            0 nouvelle
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center flex flex-col items-center justify-center">
                                            <div className="size-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3">
                                                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[24px]">notifications_off</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-400">Aucune notification</p>
                                            <p className="text-[10px] text-gray-400/70 mt-1 uppercase tracking-wider">Vous êtes à jour !</p>
                                        </div>
                                    ) : (
                                        notifications.slice(0, 5).map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => {
                                                    if (!notification.isRead) markAsRead(notification.id);
                                                    setIsNotifOpen(false);
                                                    const url = resolveNotificationUrl(notification, user?.role);
                                                    if (url) router.push(url);
                                                }}
                                                className={`p-4 border-b border-gray-100 dark:border-white/5 transition-colors cursor-pointer relative ${!notification.isRead ? 'bg-[#E67E22]/5 hover:bg-[#E67E22]/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                            >
                                                {!notification.isRead && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E67E22]" />
                                                )}
                                                <p className="text-[13px] text-gray-800 dark:text-gray-200 font-medium leading-tight mb-1">{notification.title}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{notification.message}</p>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {new Date(notification.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="p-3 bg-gray-50/50 dark:bg-white/5 text-center border-t border-gray-100 dark:border-white/5 shrink-0">
                                    <Link
                                        href="/notifications"
                                        onClick={() => setIsNotifOpen(false)}
                                        className="text-[10px] text-black/60 dark:text-white/60 hover:text-[#E67E22] dark:hover:text-[#E67E22] transition-colors font-black uppercase tracking-widest block py-1"
                                    >
                                        Voir toutes les notifications
                                    </Link>
                                </div>
                            </div>
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

'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    User, Package, ShoppingBag,
    Bell, ShieldCheck, Settings as SettingsIcon, Heart, TrendingUp, LogOut, ArrowLeft, MapPin
} from 'lucide-react';
import { User as UserType } from '@/types/auth';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/i18n/useT';

interface VendorSidebarProps {
    user: UserType | null;
}

const VendorSidebarContent: React.FC<VendorSidebarProps> = ({ user }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab');
    const { count: wishlistCount } = useWishlist();
    const { logout } = useAuth();
    const { t } = useT();

    const navItems = [
        { id: 'profile', label: t('vendor.sidebar.myProfile'), href: '/settings', icon: User },
        ...((user?.role === 'VENDOR' || pathname?.startsWith('/dashboard')) ? [
            { id: 'orders', label: t('vendor.sidebar.mySales'), href: '/dashboard/orders', icon: Package },
            { id: 'products', label: t('vendor.sidebar.myProducts'), href: '/dashboard/products', icon: ShoppingBag },
            { id: 'analytics', label: t('vendor.sidebar.analytics'), href: '/dashboard/analytics', icon: TrendingUp },
        ] : [
            { id: 'orders', label: t('vendor.sidebar.myOrders'), href: '/settings?tab=orders', icon: Package },
            { id: 'wishlist', label: t('vendor.sidebar.myFavorites'), href: '/settings?tab=favorites', icon: Heart },
        ]),
        { id: 'notifications', label: t('vendor.sidebar.notifications'), href: '/settings?tab=notifications', icon: Bell },
        { id: 'security', label: t('vendor.sidebar.security'), href: '/settings?tab=security', icon: ShieldCheck },
        ...(user?.role !== 'VENDOR' ? [
            { id: 'addresses', label: t('vendor.sidebar.addressBook'), href: '/settings?tab=addresses', icon: MapPin },
        ] : []),
        { id: 'preferences', label: t('vendor.sidebar.preferences'), href: '/settings?tab=preferences', icon: SettingsIcon },
    ];

    return (
        <aside className="hidden lg:flex lg:w-[260px] h-[100dvh] bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-slate-700/70 sticky top-0 flex-col shrink-0 z-40">
            
            {/* LOGO */}
            <div className="h-[76px] px-8 flex items-center justify-start gap-3 border-b border-gray-100 dark:border-white/5 shrink-0">
                <Link href="/" className="flex items-center gap-2">
                    {/* WapiBei orange rounded logo with white circle */}
                    <div className="size-[30px] bg-[#E67E22] rounded-[10px] flex items-center justify-center shadow-sm shrink-0">
                        <div className="size-[10px] bg-white rounded-full" />
                    </div>
                    <span className="text-[20px] font-black tracking-tight leading-none">
                        <span className="text-[#E67E22]">WAPI</span>
                        <span className="text-[#2D5A27] dark:text-[#52c140]">BEI</span>
                    </span>
                </Link>
            </div>

            {/* Subtitle / User Role */}
            <div className="px-8 pt-6 pb-2 shrink-0">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                    {user?.role === 'VENDOR' ? t('vendor.sidebar.menuVendor') : t('vendor.sidebar.menuClient')}
                </p>
            </div>

            {/* NAVIGATION LINKS */}
            <nav className="flex-grow px-2 md:px-4 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {navItems.map((item) => {
                    let isActive = false;
                    if (item.href.includes('?tab=')) {
                        const tabName = item.href.split('?tab=')[1];
                        isActive = currentTab === tabName;
                    } else if (item.href === '/settings') {
                        isActive = pathname === '/settings' && !currentTab;
                    } else {
                        isActive = pathname === item.href;
                    }

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            title={item.label}
                            className={`w-full relative flex items-center justify-start gap-4 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                                isActive
                                    ? 'bg-[#E67E22] text-white shadow-sm shadow-[#E67E22]/20'
                                    : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-white/10'
                            }`}
                        >
                            <item.icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                            <span>{item.label}</span>
                            {item.id === 'wishlist' && wishlistCount > 0 && (
                                <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight flex items-center justify-center ${
                                    isActive ? 'bg-white text-[#E67E22]' : 'bg-[#E67E22] text-white shadow-sm'
                                }`}>
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom footer branding / Actions */}
            <div className="mt-auto p-4 md:p-6 border-t border-gray-100 dark:border-white/5 shrink-0 flex flex-col gap-2 md:gap-4">
                {/* Back to shop */}
                <Link
                    href="/"
                    title="Retour à la boutique"
                    className="w-full relative flex items-center justify-start gap-4 px-5 py-3 rounded-xl text-sm font-semibold transition-all text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                >
                    <ArrowLeft size={20} className="shrink-0" />
                    <span>{t('vendor.sidebar.backToShop')}</span>
                </Link>

                {/* Logout */}
                <button
                    onClick={() => logout()}
                    className="w-full relative flex items-center justify-start gap-4 px-5 py-3 rounded-xl text-sm font-semibold transition-all text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="Déconnexion"
                >
                    <LogOut size={20} className="shrink-0" />
                    <span>{t('vendor.sidebar.logout')}</span>
                </button>
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-center">
                    <p className="text-xs font-black text-slate-800 dark:text-white tracking-tight">{t('vendor.sidebar.appName')}</p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('vendor.sidebar.myAccount')}</p>
                </div>
            </div>
        </aside>
    );
};

export const VendorSidebar: React.FC<VendorSidebarProps> = (props) => {
    return (
            <Suspense fallback={<aside className="hidden lg:flex lg:w-[260px] h-[100dvh] bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-slate-700/70 sticky top-0 flex-col shrink-0 z-40"></aside>}>
            <VendorSidebarContent {...props} />
        </Suspense>
    );
};

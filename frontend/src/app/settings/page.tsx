"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Bell,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Package,
  Smartphone,
  Lock,
  CheckCircle2,
  Edit3,
  Globe,
  LogOut
} from "lucide-react";
import EditProfileModal from "../modal/EditProfileModal";
import { DeleteConfirmationModal } from "@/app/dashboard/products/components/DeleteConfirmationModal";

import { useAuth } from "@/context/AuthContext";
import { Language, Theme, Currency, useSettings } from "@/context/SettingsContext";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppNotifications } from "@/hooks/useAppNotifications";
import { getNotificationPreferences, saveNotificationPreferences, NotificationPreferences } from "@/features/notifications/services/preferences.service";
import { resolveNotificationUrl, AppNotification } from "@/types/notification";
import { toast } from "sonner";

import { getClientOrders, Order } from "@/features/vendors/services/orders.service";
import { useCurrency } from "@/hooks/useCurrency";
import { AddressBookSection } from "@/features/addresses/components/AddressBookSection";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductCard } from "@/features/products/components/ProductCard";
import { useQuickView } from "@/features/products/hooks/useQuickView";
import { ProductQuickView } from "@/features/products/components/ProductQuickView";
import { ListSkeleton, TableSkeleton } from "@/components/ui/SkeletonLoaders";
import { useT } from "@/i18n/useT";

type SettingsTab = 'profile' | 'store' | 'favorites' | 'notifications' | 'security' | 'preferences' | 'orders' | 'addresses';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const getInitials = (name: string) => {
  if (!name) return 'SP';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const localeByLanguage = {
  fr: "fr-FR",
  en: "en-US",
  sw: "sw-KE",
} as const;

function SettingsPageFallback() {
  const { t } = useT();

  return (
    <div className="min-h-screen flex items-center justify-center">
      {t("settingsPage.loading")}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageFallback />}>
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const { user, logout } = useAuth();
  const { theme, setTheme, language, setLanguage, currency, setCurrency } = useSettings();
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const dateLocale = localeByLanguage[language];
  const activeTab = (searchParams.get('tab') as SettingsTab) || null;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);



  // État des préférences de notifications
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isSavingPref, setIsSavingPref] = useState(false);

  // Favoris / Wishlist states
  const { wishlist, toggleFavorite } = useWishlist();
  const { selectedProduct, openQuickView, closeQuickView } = useQuickView();
  const [isClearFavoritesModalOpen, setIsClearFavoritesModalOpen] = useState(false);
  const [isClearingFavorites, setIsClearingFavorites] = useState(false);

  const handleClearAllFavorites = async () => {
    setIsClearingFavorites(true);
    try {
      [...wishlist].forEach(p => toggleFavorite(p));
      toast.success(t("settingsPage.toasts.clearFavoritesSuccess"));
    } finally {
      setIsClearingFavorites(false);
      setIsClearFavoritesModalOpen(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'orders') {
      const loadOrders = async () => {
        setIsLoadingOrders(true);
        const res = await getClientOrders();
        if (res.success) setClientOrders(res.data || []);
        setIsLoadingOrders(false);
      };
      loadOrders();
    }
    if (activeTab === 'notifications') {
      getNotificationPreferences().then(setPreferences);
    }
  }, [activeTab]);

  const handleSavePreferences = async () => {
    if (!preferences) return;
    setIsSavingPref(true);
    try {
      await saveNotificationPreferences(preferences);
      toast.success(t("settingsPage.toasts.notificationSaved"));
    } catch {
      toast.error(t("settingsPage.toasts.notificationSaveError"));
    } finally {
      setIsSavingPref(false);
    }
  };

  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useAppNotifications();

  // Clic intelligent : marque comme lu + redirige vers l'URL contextuelle
  const handleNotificationClick = (n: AppNotification) => {
    if (!n.isRead) markAsRead(n.id);
    const url = resolveNotificationUrl(n, user?.role);
    if (url) router.push(url);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t("settingsPage.toasts.logoutSuccess"));
      router.push("/");
    } catch {
      toast.error(t("settingsPage.toasts.logoutError"));
    }
  };

  // Define menu items based on user role
  const menuItems = [
    { label: t("settingsPage.menu.profile"), href: "/settings?tab=profile" },
    ...(user?.role === 'VENDOR' ? [
      { label: t("settingsPage.menu.vendorDashboard"), href: "/dashboard" },
    ] : [
      { label: t("settingsPage.menu.orders"), href: "/settings?tab=orders" },
      { label: t("settingsPage.menu.favorites"), href: "/settings?tab=favorites" },
    ]),
    { label: t("settingsPage.menu.notifications"), href: "/settings?tab=notifications" },
    { label: t("settingsPage.menu.security"), href: "/settings?tab=security" },
    { label: t("settingsPage.menu.addresses"), href: "/settings?tab=addresses" },
    { label: t("settingsPage.menu.preferences"), href: "/settings?tab=preferences" },
    { label: t("settingsPage.menu.helpCenter"), href: "#" },
  ];

  // If there is an active tab, render that tab's content
  // This unified view works on both mobile (full screen) and desktop (content area beside VendorSidebar)
  if (activeTab) {
    return (
      <div className="min-h-0 bg-[#F6F1E0] dark:bg-[#0B1220] lg:bg-transparent dark:lg:bg-transparent">
        <div className="max-w-md mx-auto min-h-0 bg-white dark:bg-[#111827] shadow-2xl lg:max-w-none lg:shadow-none lg:mx-0 lg:px-8">
          {/* Modale d'édition */}
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
          {/* Header — back button only on mobile (desktop has VendorSidebar for nav) */}
          <header className="px-6 pt-12 pb-6 lg:pt-8 lg:pb-4 lg:px-0">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors mr-4"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-black">
                {activeTab === 'profile' ? t("settingsPage.tabs.profile") :
                  activeTab === 'store' ? t("settingsPage.tabs.store") :
                    activeTab === 'favorites' ? t("settingsPage.tabs.favorites") :
                      activeTab === 'notifications' ? t("settingsPage.tabs.notifications") :
                        activeTab === 'security' ? t("settingsPage.tabs.security") :
                          activeTab === 'preferences' ? t("settingsPage.tabs.preferences") :
                            activeTab === 'orders' ? t("settingsPage.tabs.orders") :
                              activeTab === 'addresses' ? t("settingsPage.tabs.addresses") : t("settingsPage.tabs.default")}
              </h1>
            </div>
          </header>
          <main className="flex-grow px-6 pb-20 lg:px-0">
            <div className="w-full max-w-5xl mx-auto">
              <div className="space-y-6">
                <DeleteConfirmationModal
                  isOpen={isClearFavoritesModalOpen}
                  onClose={() => setIsClearFavoritesModalOpen(false)}
                  onConfirm={handleClearAllFavorites}
                    itemName={t("settingsPage.favorites.clearAllItemName")}
                  isDeleting={isClearingFavorites}
                />


                {/* --- DYNAMIC SECTION --- */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {activeTab === 'notifications' && (
                      <div className="space-y-8">
                        {/* --- SECTION 1: PRÉFÉRENCES (DESIGN UNTITLED UI) --- */}
                        <section className="bg-white dark:bg-[#111827] p-4 space-y-6">
                          <div className="mb-6">
                            <h3 className="text-xl font-black text-black dark:text-white tracking-tight">{t("settingsPage.notifications.title")}</h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{t("settingsPage.notifications.description")}</p>
                          </div>

                          <div className="space-y-6">
                            {[
                              {
                                id: 'orders',
                                title: user?.role === 'VENDOR'
                                  ? t("settingsPage.notifications.categories.ordersVendorTitle")
                                  : t("settingsPage.notifications.categories.ordersClientTitle"),
                                desc: user?.role === 'VENDOR'
                                  ? t("settingsPage.notifications.categories.ordersVendorDesc")
                                  : t("settingsPage.notifications.categories.ordersClientDesc"),
                                channels: [
                                  { label: 'Push', key: 'ordersPush' as keyof NotificationPreferences },
                                  { label: 'Email', key: 'ordersEmail' as keyof NotificationPreferences },
                                  { label: 'In-App', key: 'ordersInApp' as keyof NotificationPreferences },
                                  { label: 'SMS', key: 'ordersSms' as keyof NotificationPreferences },
                                ]
                              },
                              ...(user?.role !== 'VENDOR' ? [
                                {
                                  id: 'follows',
                                  title: t("settingsPage.notifications.categories.followsTitle"),
                                  desc: t("settingsPage.notifications.categories.followsDesc"),
                                  channels: [
                                    { label: 'Push', key: 'followsPush' as keyof NotificationPreferences },
                                    { label: 'Email', key: 'followsEmail' as keyof NotificationPreferences },
                                    { label: 'In-App', key: 'followsInApp' as keyof NotificationPreferences },
                                    { label: 'SMS', key: 'followsSms' as keyof NotificationPreferences },
                                  ]
                                },
                                {
                                  id: 'promos',
                                  title: t("settingsPage.notifications.categories.promosTitle"),
                                  desc: t("settingsPage.notifications.categories.promosDesc"),
                                  channels: [
                                    { label: 'Push', key: 'promosPush' as keyof NotificationPreferences },
                                    { label: 'Email', key: 'promosEmail' as keyof NotificationPreferences },
                                    { label: 'SMS', key: 'promosSms' as keyof NotificationPreferences },
                                  ]
                                }
                              ] : []),
                              {
                                id: 'security',
                                title: t("settingsPage.notifications.categories.securityTitle"),
                                desc: t("settingsPage.notifications.categories.securityDesc"),
                                forced: true,
                                channels: [
                                  { label: 'Email', key: 'securityEmail' as keyof NotificationPreferences },
                                  { label: 'In-App', key: 'securityInApp' as keyof NotificationPreferences },
                                ],
                              }
                            ].map((cat) => (
                              <div key={cat.id} className="group flex flex-col gap-4 pb-6 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                                <div className="max-w-md">
                                  <h4 className="text-base font-black text-black dark:text-white mb-1.5">{cat.title}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{cat.desc}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                  {cat.channels.map((channel) => (
                                    <div key={channel.label} className="flex items-center gap-3">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          className="sr-only peer"
                                          checked={preferences ? Boolean(preferences[channel.key]) : true}
                                          disabled={cat.forced}
                                          onChange={(e) =>
                                            setPreferences(prev =>
                                              prev ? { ...prev, [channel.key]: e.target.checked } : prev
                                            )
                                          }
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#E67E22] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                                        <span className="ml-3 text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{channel.label}</span>
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-8 flex justify-end">
                            <button
                              onClick={handleSavePreferences}
                              disabled={isSavingPref || !preferences}
                              className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSavingPref
                                ? t("settingsPage.notifications.saving")
                                : t("settingsPage.notifications.save")}
                            </button>
                          </div>
                        </section>

                        {/* --- SECTION 2: ACTIVITÉ RÉCENTE --- */}
                        <section className="bg-white dark:bg-[#111827] p-4 space-y-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div className="space-y-1">
                              <h3 className="text-xl font-black text-black dark:text-white tracking-tight">{t("settingsPage.notifications.recentTitle")}</h3>
                              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 italic">{t("settingsPage.notifications.recentSubtitle")}</p>
                            </div>
                            {notifications.some(n => !n.isRead) && (
                              <button
                                onClick={() => markAllAsRead()}
                                className="group flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-slate-900 dark:text-gray-400 hover:text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                <CheckCircle2 size={14} />
                                {t("settingsPage.notifications.markAllRead")}
                              </button>
                            )}
                          </div>

                          <div className="space-y-4">
                            {isLoading ? (
                              <ListSkeleton count={3} />
                            ) : notifications.length === 0 ? (
                              <div className="py-12 text-center">
                                <Bell size={40} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t("settingsPage.notifications.empty")}</p>
                              </div>
                            ) : (
                              <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
                                  {notifications.map((n) => (
                                    <motion.div
                                      variants={fadeUp}
                                      key={n.id}
                                      onClick={() => handleNotificationClick(n)}
                                      className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${n.isRead ? 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5' : 'bg-orange-50/30 dark:bg-orange-500/10 border-orange-100/50 dark:border-orange-500/20 shadow-sm'}`}
                                    >
                                      <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${n.isRead ? 'bg-gray-50 dark:bg-white/5 text-gray-400' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600'}`}>
                                        <Bell size={18} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-black truncate ${n.isRead ? 'text-gray-900 dark:text-gray-200' : 'text-orange-950 dark:text-orange-300'}`}>{n.title}</h4>
                                        <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-1">{n.message}</p>
                                      </div>
                                      <div className="text-[10px] font-bold text-gray-300 shrink-0">
                                        {new Date(n.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}
                                      </div>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              </div>
                            )}
                          </div>
                        </section>
                      </div>
                    )}

                    {activeTab === 'preferences' && (
                      <div className="space-y-8">
                        <div className="bg-white dark:bg-[#111827] p-6 border border-slate-100 dark:border-white/5 shadow-sm space-y-8">
                          <div className="pb-6 border-b border-slate-100 dark:border-white/5">
                            <h2 className="text-xl font-bold text-black dark:text-white">{t("settingsPage.preferences.title")}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">{t("settingsPage.preferences.description")}</p>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-sm font-bold text-black dark:text-white">{t("settingsPage.preferences.theme.title")}</h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">{t("settingsPage.preferences.theme.description")}</p>
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                {
                                  label: t("settingsPage.preferences.theme.light"),
                                  value: 'light' as Theme,
                                  toastLabel: t("settingsPage.preferences.theme.appliedLight"),
                                },
                                {
                                  label: t("settingsPage.preferences.theme.dark"),
                                  value: 'dark' as Theme,
                                  toastLabel: t("settingsPage.preferences.theme.appliedDark"),
                                },
                                {
                                  label: t("settingsPage.preferences.theme.system"),
                                  value: 'system' as Theme,
                                  toastLabel: t("settingsPage.preferences.theme.appliedSystem"),
                                },
                              ].map((themeOption) => (
                                <button
                                  key={themeOption.value}
                                  type="button"
                                  onClick={() => {
                                    setTheme(themeOption.value);
                                    toast.success(themeOption.toastLabel);
                                  }}
                                  className={`py-3.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${theme === themeOption.value
                                    ? "bg-black dark:bg-white text-white dark:text-black border-transparent shadow-sm"
                                    : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                                    }`}
                                >
                                  {themeOption.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-6">
                            <h3 className="text-sm font-bold text-black dark:text-white">{t("settingsPage.preferences.language.title")}</h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">{t("settingsPage.preferences.language.description")}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[
                                {
                                  label: t("settingsPage.preferences.language.frenchLabel"),
                                  desc: t("settingsPage.preferences.language.frenchDesc"),
                                  value: 'fr' as Language,
                                  toastLabel: t("settingsPage.preferences.language.setFrench"),
                                },
                                {
                                  label: t("settingsPage.preferences.language.englishLabel"),
                                  desc: t("settingsPage.preferences.language.englishDesc"),
                                  value: 'en' as Language,
                                  toastLabel: t("settingsPage.preferences.language.setEnglish"),
                                },
                                {
                                  label: t("settingsPage.preferences.language.swahiliLabel"),
                                  desc: t("settingsPage.preferences.language.swahiliDesc"),
                                  value: 'sw' as Language,
                                  toastLabel: t("settingsPage.preferences.language.setSwahili"),
                                },
                              ].map((lang) => (
                                <button
                                  key={lang.label}
                                  type="button"
                                  onClick={() => {
                                    setLanguage(lang.value);
                                    toast.success(lang.toastLabel);
                                  }}
                                  className={`p-4 rounded-full text-left transition-all border cursor-pointer ${language === lang.value
                                    ? "bg-white dark:bg-white/10 border-[#E67E22] shadow-sm relative ring-2 ring-orange-500/10"
                                    : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                                    }`}
                                >
                                  <p className="text-xs font-bold text-black dark:text-white">{lang.label}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{lang.desc}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-6">
                            <h3 className="text-sm font-bold text-black dark:text-white">{t("settingsPage.preferences.currency.title")}</h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">{t("settingsPage.preferences.currency.description")}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[
                                {
                                  label: t("settingsPage.preferences.currency.usdLabel"),
                                  value: 'USD' as Currency,
                                  desc: t("settingsPage.preferences.currency.usdDesc"),
                                  toastLabel: t("settingsPage.preferences.currency.setUsd"),
                                },
                                {
                                  label: t("settingsPage.preferences.currency.cdfLabel"),
                                  value: 'CDF' as Currency,
                                  desc: t("settingsPage.preferences.currency.cdfDesc"),
                                  toastLabel: t("settingsPage.preferences.currency.setCdf"),
                                }
                              ].map((curr) => (
                                <button
                                  key={curr.label}
                                  type="button"
                                  onClick={() => {
                                    setCurrency(curr.value);
                                    toast.success(curr.toastLabel);
                                  }}
                                  className={`p-4 rounded-full text-left transition-all border cursor-pointer ${currency === curr.value
                                    ? "bg-white dark:bg-white/10 border-[#E67E22] shadow-sm relative ring-2 ring-orange-500/10"
                                    : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                                    }`}
                                >
                                  <p className="text-xs font-bold text-black dark:text-white">{curr.label}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{curr.desc}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'profile' && (
                      <div className="space-y-8 max-w-3xl">
                        <div className="bg-white dark:bg-[#111827] overflow-hidden rounded-2xl">
                          <div className="px-6 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5 pt-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                              <div className="relative group shrink-0">
                                <div className="w-24 sm:w-28 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg relative">
                                  {user?.avatarUrl ? (
                                    <Image src={user.avatarUrl} alt={user.fullName} width={100} height={100} className="w-full h-full object-cover" unoptimized />
                                  ) : (
                                    <span className="text-3xl font-black tracking-tight">{getInitials(user?.fullName || '')}</span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsEditModalOpen(true)}
                                  className="absolute bottom-0 right-0 p-2 bg-[#E67E22] text-white rounded-full border-2 border-white shadow-md hover:scale-105 transition-transform active:scale-95 z-20"
                                >
                                  <Edit3 size={11} />
                                </button>
                              </div>

                              <div className="sm:pb-1">
                                <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white flex items-center justify-center sm:justify-start gap-2">
                                  {user?.fullName || t("settingsPage.profile.defaultUser")}
                                  {user?.isVerified && (
                                    <span className="text-[#2D5A27] bg-green-50 dark:bg-green-500/10 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                                      {t("settingsPage.profile.active")}
                                    </span>
                                  )}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 uppercase tracking-wider">
                                  {user?.role === 'VENDOR'
                                    ? t("settingsPage.profile.vendorCertified")
                                    : t("settingsPage.profile.clientVerified")}
                                </p>
                              </div>
                            </div>

                            <div className="sm:pb-1 z-10">
                              <button
                                type="button"
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#E67E22] hover:bg-[#cf6d18] text-white rounded-full text-xs font-semibold transition-all shadow-sm shadow-orange-500/10 active:scale-95 shrink-0"
                              >
                                <Edit3 size={14} />
                                {t("settingsPage.profile.editProfile")}
                              </button>
                            </div>
                          </div>

                          <div className="px-6 pb-8 space-y-6 pt-6">
                            <div>
                              <h2 className="text-lg font-bold text-black dark:text-white">{t("settingsPage.profile.accountInfoTitle")}</h2>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">{t("settingsPage.profile.accountInfoDesc")}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.firstName")}</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={user?.fullName?.split(' ')[0] || ''}
                                  className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.lastName")}</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={user?.fullName?.split(' ').slice(1).join(' ') || ''}
                                  className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.email")}</label>
                                <div className="relative">
                                  <input
                                    type="email"
                                    readOnly
                                    value={user?.email || ''}
                                    className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full pl-4 pr-24 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
                                    <CheckCircle2 size={10} />
                                    {t("settingsPage.profile.verified")}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.phone")}</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    readOnly
                                  value={user?.phone || t("settingsPage.profile.phoneUnspecified")}
                                    className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full pl-4 pr-24 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed"
                                  />
                                  {user?.phoneVerified && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
                                      <CheckCircle2 size={10} />
                                        {t("settingsPage.profile.active")}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.province")}</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={user?.province || t("settingsPage.profile.undefinedValue")}
                                  className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.cityCommune")}</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={user?.commune || t("settingsPage.profile.undefinedValue")}
                                  className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed"
                                />
                              </div>

                              {user?.role === 'VENDOR' && (
                                <div className="space-y-2 md:col-span-2">
                                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.shopName")}</label>
                                  <input
                                    type="text"
                                    readOnly
                                    value={user?.boutiqueName || t("settingsPage.profile.noShop")}
                                    className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed"
                                  />
                                </div>
                              )}

                              <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.memberSince")}</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' }) : t("settingsPage.profile.recently")}
                                  className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'orders' && (
                      <motion.div variants={fadeUp} className="bg-white dark:bg-[#111827] p-4 sm:p-6">
                        {user?.role === 'VENDOR' ? (
                          <div className="text-center py-12">
                            <h3 className="text-xl font-black text-black dark:text-white mb-4">{t("settingsPage.orders.unauthorizedTitle")}</h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">{t("settingsPage.orders.unauthorizedDesc")}</p>
                            <Link href="/dashboard/orders" className="px-6 py-3 bg-[#E67E22] text-white rounded-xl font-bold hover:bg-[#cf6d18] transition-colors inline-block">{t("settingsPage.orders.goToDashboard")}</Link>
                          </div>
                        ) : (
                          <>
                            {/* Header + stats */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                              <div>
                                <h3 className="text-xl font-black text-black dark:text-white tracking-tight leading-none">{t("settingsPage.orders.title")}</h3>
                                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-1">{t("settingsPage.orders.subtitle")}</p>
                              </div>
                              {clientOrders.length > 0 && (
                                <div className="flex items-center gap-3">
                                  <span className="px-3 py-1.5 bg-orange-50 text-[#E67E22] rounded-full text-xs font-black">
                                    {clientOrders.length} {clientOrders.length > 1
                                      ? t("settingsPage.orders.countOrderPlural")
                                      : t("settingsPage.orders.countOrderSingular")}
                                  </span>
                                  <span className="px-3 py-1.5 bg-green-50 text-[#2D5A27] rounded-full text-xs font-black">
                                    {clientOrders.filter(o => o.status === 'DELIVERED').length} {clientOrders.filter(o => o.status === 'DELIVERED').length > 1
                                      ? t("settingsPage.orders.countDeliveredPlural")
                                      : t("settingsPage.orders.countDeliveredSingular")}
                                  </span>
                                </div>
                              )}
                            </div>

                            {isLoadingOrders ? (
                              <TableSkeleton rows={5} cols={4} />
                            ) : clientOrders.length === 0 ? (
                              <div className="text-center py-12">
                                <Package className="size-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-lg font-black text-black">{t("settingsPage.orders.emptyTitle")}</p>
                                <Link href="/products" className="text-[#E67E22] font-bold text-sm hover:underline mt-4 block uppercase tracking-widest">
                                  {t("settingsPage.orders.discoverProducts")}
                                </Link>
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {clientOrders.map((order) => (
                                  <div
                                    key={order.id}
                                    className="flex items-center gap-3 sm:gap-5 py-4 first:pt-0 last:pb-0 hover:bg-orange-50/30 -mx-2 px-2 sm:-mx-4 sm:px-4 rounded-xl transition-colors"
                                  >
                                    {/* Image — toujours à gauche */}
                                    <div className="size-14 sm:size-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                      <Image
                                        src={order.product?.image || ""}
                                        alt={order.product?.name || ""}
                                        width={64}
                                        height={64}
                                        className="object-cover h-full w-full"
                                      />
                                    </div>

                                    {/* Info produit — au centre, flex-1 */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-black text-gray-900 dark:text-gray-100 text-sm sm:text-base leading-tight truncate">
                                        {order.product?.name}
                                      </h4>
                                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                          ID: {order.id.substring(0, 8).toUpperCase()}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                                          order.status === 'DELIVERED'
                                            ? 'bg-green-50 text-[#2D5A27]'
                                            : order.status === 'CANCELLED'
                                            ? 'bg-red-50 text-red-600'
                                            : 'bg-orange-50 text-[#E67E22]'
                                        }`}>
                                          {order.status === 'DELIVERED' ? t("settingsPage.orders.statusDelivered")
                                            : order.status === 'CANCELLED' ? t("settingsPage.orders.statusCancelled")
                                            : order.status === 'PENDING' ? t("settingsPage.orders.statusPending")
                                            : order.status}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Prix + date — toujours à droite */}
                                    <div className="text-right shrink-0">
                                      <p className="text-sm sm:text-base font-black text-[#E67E22]">
                                        {formatPrice(order.totalPrice)}
                                      </p>
                                      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString(dateLocale, {
                                          day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                            )}
                          </>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'favorites' && (
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 border border-slate-100 dark:border-white/5 shadow-sm space-y-5">
                          {user?.role === 'VENDOR' ? (
                            <div className="text-center py-12">
                              <h3 className="text-xl font-black text-black dark:text-white mb-4">{t("settingsPage.favorites.unauthorizedTitle")}</h3>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">{t("settingsPage.favorites.unauthorizedDesc")}</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
                                <div>
                                  <h2 className="text-xl font-black text-black dark:text-white">{t("settingsPage.favorites.title")}</h2>
                                  {wishlist.length > 0 && (
                                    <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                      {wishlist.length} {wishlist.length > 1
                                        ? t("settingsPage.favorites.articlePlural")
                                        : t("settingsPage.favorites.articleSingular")} {wishlist.length > 1
                                        ? t("settingsPage.favorites.savedPlural")
                                        : t("settingsPage.favorites.savedSingular")}
                                    </p>
                                  )}
                                </div>
                                {wishlist.length > 0 && (
                                  <button
                                    onClick={() => setIsClearFavoritesModalOpen(true)}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-full transition-all"
                                  >
                                    {t("settingsPage.favorites.clearList")}
                                  </button>
                                )}
                              </div>

                              {wishlist.length === 0 ? (
                                <div className="text-center py-12">
                                  <Heart className="size-16 text-gray-200 mx-auto mb-4" />
                                  <p className="text-lg font-black text-black">{t("settingsPage.favorites.emptyTitle")}</p>
                                  <Link href="/products" className="text-[#E67E22] font-bold text-sm hover:underline mt-4 block uppercase tracking-widest">
                                    {t("settingsPage.favorites.discoverProducts")}
                                  </Link>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                  {wishlist.map((product) => (
                                    <ProductCard
                                      key={product.id}
                                      product={product}
                                      onQuickView={openQuickView}
                                    />
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'security' && (
                      <div className="space-y-8">
                        <div className="bg-white dark:bg-[#111827] p-6 border border-slate-100 dark:border-white/5 shadow-sm space-y-8 animate-fade-in">
                          <div className="pb-6 border-b border-slate-100 dark:border-white/5">
                            <h2 className="text-xl font-bold text-black dark:text-white">{t("settingsPage.security.title")}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">{t("settingsPage.security.description")}</p>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-orange-50 rounded-full text-[#E67E22] shrink-0">
                                <Lock size={18} />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-black dark:text-white">{t("settingsPage.security.password.title")}</h3>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{t("settingsPage.security.password.description")}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.security.password.current")}</label>
                                <input
                                  type="password"
                                  placeholder="••••••••"
                                  className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none focus:border-[#E67E22] transition-colors"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.security.password.new")}</label>
                                <input
                                  type="password"
                                  placeholder="••••••••"
                                  className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none focus:border-[#E67E22] transition-colors"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.security.password.confirm")}</label>
                                <input
                                  type="password"
                                  placeholder="••••••••"
                                  className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none focus:border-[#E67E22] transition-colors"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-2 border-b border-slate-100 pb-6">
                              <button
                                type="button"
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-5 py-2.5 bg-[#E67E22] hover:bg-[#cf6d18] text-white rounded-full text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                              >
                                {t("settingsPage.security.password.update")}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-emerald-50 rounded-full text-emerald-600 shrink-0">
                                <ShieldCheck size={18} />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-black dark:text-white">{t("settingsPage.security.pin.title")}</h3>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{t("settingsPage.security.pin.description")}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.security.pin.new")}</label>
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder={t("settingsPage.security.pin.placeholder")}
                                  className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500 transition-colors"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.security.pin.confirm")}</label>
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder={t("settingsPage.security.pin.placeholder")}
                                  className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500 transition-colors"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-2 border-b border-slate-100 pb-6">
                              <button
                                type="button"
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-full text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                              >
                                {t("settingsPage.security.pin.save")}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-blue-50 rounded-full text-blue-600 shrink-0">
                                <Smartphone size={18} />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-black dark:text-white">{t("settingsPage.security.phone.title")}</h3>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{t("settingsPage.security.phone.description")}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t("settingsPage.security.phone.status")}: {user?.phoneVerified
                                    ? t("settingsPage.security.phone.verified")
                                    : t("settingsPage.security.phone.unverified")}
                                </span>
                              </div>
                              <button className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-900 transition-colors">
                                {t("settingsPage.security.phone.verify")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'addresses' && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="bg-white dark:bg-[#111827] p-6 border border-slate-100 dark:border-white/5 shadow-sm rounded-2xl">
                          {user?.role === 'VENDOR' ? (
                            <div className="text-center py-12">
                              <h3 className="text-xl md:text-xl font-black text-black dark:text-white mb-4">{t("settingsPage.addresses.unauthorizedTitle")}</h3>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("settingsPage.addresses.unauthorizedDesc")}</p>
                            </div>
                          ) : (
                            <AddressBookSection />
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Otherwise, render the main menu (mobile/tablet only — desktop uses VendorSidebar navigation)
  return (
    <>
      {/* ===== Mobile/Tablet : App Shell account ===== */}
      <div className="lg:hidden min-h-0 bg-[#F6F1E0]">
        {/* Container */}
        <div className="max-w-md mx-auto min-h-0 bg-white shadow-2xl">
          {/* Modale d'édition */}
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />

          {/* Header */}
          <div className="px-6 pt-12 pb-8">
            <h1 className="text-3xl font-bold text-black">{t("settingsPage.accountTitle")}</h1>
          </div>

          {/* User Info */}
          <div className="px-6 pb-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 overflow-hidden ring-4 ring-gray-50">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span>{getInitials(user?.fullName || '')}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 w-full px-4">
              <h2 className="font-bold text-black text-xl truncate">{user?.fullName || t("settingsPage.profile.defaultUser")}</h2>
              <p className="text-sm text-gray-500 truncate mt-0.5">{user?.email || 'email@example.com'}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{user?.role === 'VENDOR' ? t("settingsPage.profile.vendorActive") : t("settingsPage.profile.clientVerified")}</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="border-t border-gray-200">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-black">{item.label}</span>
                <ChevronRight size={20} className="text-gray-400" />
              </Link>
            ))}
          </div>

          {/* Log Out Button */}
          <div className="px-6 pt-10 pb-4">
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              {t("common.logout")}
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 pb-12 pt-4 text-center">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
              App v4.32.0 b3564
              <Globe size={16} />
            </p>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP : Affiche le profil complet par défaut ===== */}
      <div className="hidden lg:block px-8 py-8 dark:bg-transparent">
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
        <div className="w-full space-y-8">
          <div className="bg-white dark:bg-[#111827] overflow-hidden">
            {/* Header avatar + bouton */}
            <div className="px-6 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5 pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                <div className="relative group shrink-0">
                  <div className="w-24 sm:w-28 rounded-full overflow-hidden bg-gradient-to-br from-[#E67E22] to-[#2D5A27] flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg relative">
                    {user?.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.fullName} width={100} height={100} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <span className="text-3xl font-black tracking-tight">{getInitials(user?.fullName || '')}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute bottom-0 right-0 p-2 bg-[#E67E22] text-white rounded-full border-2 border-white shadow-md hover:scale-105 transition-transform active:scale-95 z-20"
                  >
                    <Edit3 size={11} />
                  </button>
                </div>
                <div className="sm:pb-1">
                  <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white flex items-center justify-center sm:justify-start gap-2">
                    {user?.fullName || t("settingsPage.profile.defaultUser")}
                    {user?.isVerified && (
                      <span className="text-[#2D5A27] bg-green-50 dark:bg-green-500/10 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                        {t("settingsPage.profile.active")}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 uppercase tracking-wider">
                    {user?.role === 'VENDOR' ? t("settingsPage.profile.vendorCertified") : t("settingsPage.profile.clientVerified")}
                  </p>
                </div>
              </div>
              <div className="sm:pb-1 z-10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#E67E22] hover:bg-[#cf6d18] text-white rounded-full text-xs font-semibold transition-all shadow-sm shadow-orange-500/10 active:scale-95 shrink-0"
                >
                  <Edit3 size={14} />
                  {t("settingsPage.profile.editProfile")}
                </button>
              </div>
            </div>

            {/* Champs d'information */}
            <div className="px-6 pb-8 space-y-6 pt-6">
              <div>
                <h2 className="text-lg font-bold text-black dark:text-white">{t("settingsPage.profile.accountInfoTitle")}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">{t("settingsPage.profile.accountInfoDesc")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.firstName")}</label>
                  <input type="text" readOnly value={user?.fullName?.split(' ')[0] || ''}
                    className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.lastName")}</label>
                  <input type="text" readOnly value={user?.fullName?.split(' ').slice(1).join(' ') || ''}
                    className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.email")}</label>
                  <div className="relative">
                    <input type="email" readOnly value={user?.email || ''}
                      className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full pl-4 pr-24 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
                      <CheckCircle2 size={10} />
                      {t("settingsPage.profile.verified")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.phone")}</label>
                  <div className="relative">
                    <input type="text" readOnly value={user?.phone || t("settingsPage.profile.phoneUnspecified")}
                      className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full pl-4 pr-24 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed" />
                    {user?.phoneVerified && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
                        <CheckCircle2 size={10} />
                        {t("settingsPage.profile.active")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.province")}</label>
                  <input type="text" readOnly value={user?.province || t("settingsPage.profile.undefinedValue")}
                    className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.cityCommune")}</label>
                  <input type="text" readOnly value={user?.commune || t("settingsPage.profile.undefinedValue")}
                    className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed" />
                </div>

                {user?.role === 'VENDOR' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.shopName")}</label>
                    <input type="text" readOnly value={user?.boutiqueName || t("settingsPage.profile.noShop")}
                      className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed" />
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("settingsPage.profile.memberSince")}</label>
                  <input type="text" readOnly
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' }) : t("settingsPage.profile.recently")}
                    className="w-full bg-[#F9FAFB] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-not-allowed" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          onClose={closeQuickView}
        />
      )}
    </>
  );
}

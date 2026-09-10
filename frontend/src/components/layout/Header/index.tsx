"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBar } from "./components/SearchBar";
import { MobileSidebar } from "./components/MobileSidebar";
import { DesktopHeader } from "./components/DesktopHeader";
import { useCart } from "@/features/cart/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n/useT";
import { useAppNotifications } from "@/hooks/useAppNotifications";

/**
 * Inner component keyed by `pathname`.
 * When the route changes, React remounts this component,
 * which naturally resets all overlay states to `false`.
 */
const HeaderOverlays = ({
  pathname,
  totalItems,
  isAuthenticated,
  isAuthLoading,
  user,
  logout,
}: {
  pathname: string;
  totalItems: number;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: ReturnType<typeof useAuth>["user"];
  logout: () => Promise<void>;
}) => {
  const { t } = useT();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { unreadCount } = useAppNotifications();

  const navLinks = [
    { id: "/", label: t("header.nav.home"), icon: "home" },
    { id: "/products", label: t("header.nav.products"), icon: "inventory_2" },
    { id: "/sellers", label: t("header.nav.sellers"), icon: "store" },
    { id: "/compare", label: t("header.nav.compare"), icon: "compare_arrows" },
  ];

  const isActive = (path: string) => pathname === path;
  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
  ].some((path) => pathname.startsWith(path));

  return (
    <>
      <DesktopHeader
        navLinks={navLinks}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        user={user}
        logout={logout}
        totalItems={totalItems}
      />

      <div
        className={`w-full px-4 md:px-6 h-16 md:h-20 flex lg:hidden items-center ${isAuthPage ? "justify-center" : "justify-between"} gap-2 relative`}
      >
        {isAuthPage && (
          <Link
            href="/"
            className="absolute left-4 p-2 rounded-full bg-[#E67E22]/10 text-[#E67E22] hover:bg-[#E67E22]/20 transition-all border border-[#E67E22]/20"
            title={t("header.backToHome")}
          >
            <span className="material-symbols-outlined text-[24px]">
              arrow_back
            </span>
          </Link>
        )}

        {!isSearchExpanded && (
          <Link
            href="/"
            className={`flex items-center gap-1.5 md:gap-2 cursor-pointer shrink-0 animate-in fade-in duration-300 ${isAuthPage ? "mx-auto" : ""}`}
          >

            <h1 className="text-[18px] md:text-2xl font-black tracking-tighter uppercase">
              <span className="text-[#E67E22]">Wapi</span><span className="text-[#2D5A27]">Bei</span>
            </h1>
          </Link>
        )}

        {!isAuthPage && (
          <SearchBar
            isSearchExpanded={isSearchExpanded}
            setIsSearchExpanded={setIsSearchExpanded}
          />
        )}

        {!isSearchExpanded && !isAuthPage && (
          <div className="flex items-center gap-1 md:gap-3 shrink-0 animate-in fade-in duration-300">
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="md:hidden p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-label={t("header.search")}
            >
              <span className="material-symbols-outlined text-[24px]">
                search
              </span>
            </button>

            {isAuthenticated && (
              <Link
                href="/notifications"
                className="lg:hidden relative p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[24px]">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 size-4 bg-[#E67E22] text-white text-[9px] font-black flex items-center justify-center rounded-full shadow-lg border border-white dark:border-black">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              href="/cart"
              className="lg:hidden relative p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-label={t("header.viewCart")}
            >
              <span className="material-symbols-outlined text-[24px]">
                shopping_bag
              </span>
              {totalItems > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#E67E22] px-1 text-[10px] font-black leading-none tabular-nums text-white shadow-md dark:border-[#111]"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              aria-label={t("header.openMenu")}
              aria-expanded={isSidebarOpen ? "true" : "false"}
            >
              <span className="material-symbols-outlined text-[24px] md:text-[28px] font-bold">
                menu
              </span>
            </button>
          </div>
        )}
      </div>

      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navLinks={navLinks}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        user={user}
        onLogout={logout}
      />
    </>
  );
};

export const Header = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#111]/80 backdrop-blur-lg border-b border-gray-100/50 dark:border-white/5">
      <HeaderOverlays
        key={pathname}
        pathname={pathname}
        totalItems={totalItems}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isLoading}
        user={user}
        logout={logout}
      />
    </header>
  );
};

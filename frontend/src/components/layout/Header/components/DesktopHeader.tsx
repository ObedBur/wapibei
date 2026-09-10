'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/types/auth';
import { ProfileDropdown } from './ProfileDropdown';
import { GlobalSearch } from './GlobalSearch';
import { useAppNotifications } from '@/hooks/useAppNotifications';
import { resolveNotificationUrl } from '@/types/notification';
import { useT } from '@/i18n/useT';

interface NavLink {
  id: string;
  label: string;
  icon: string;
}

interface DesktopHeaderProps {
  navLinks: NavLink[];
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: User | null;
  logout: () => void;
  totalItems: number;
}

/**
 * Composant DesktopHeader
 * 
 * Gère l'affichage de l'en-tête principal pour les écrans de bureau (lg+).
 * Il s'adapte dynamiquement au contexte : sur les pages d'authentification, 
 * il masque les actions (recherche, panier) et recentre le logo pour minimiser les distractions.
 * 
 * @param navLinks - Liste des liens de navigation (Accueil, Produits, etc.)
 * @param isAuthenticated - État de connexion de l'utilisateur
 * @param user - Données de l'utilisateur connecté
 * @param logout - Fonction de déconnexion
 * @param totalItems - Nombre total d'articles dans le panier (pour le badge)
 */
export const DesktopHeader = ({
  navLinks,
  isAuthenticated,
  isAuthLoading,
  user,
  logout,
  totalItems,
}: DesktopHeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useT();
  const isActive = (path: string) => pathname === path;
  const { notifications, unreadCount, markAsRead } = useAppNotifications();
  
  // Detect if current page is an authentication page
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'].some(path => pathname.startsWith(path));

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Ferme le menu déroulant des notifications si l'utilisateur clique en dehors de celui-ci
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
    <div className="hidden lg:flex w-full h-20 xl:h-24 justify-center px-4 xl:px-10 relative bg-transparent z-50">
      <div className="w-full max-w-7xl flex items-center justify-between gap-4 xl:gap-8 relative">
      
      {/* LEFT: Nav Links */}
      <div 
        className="
          shrink-0 flex items-center gap-1
          bg-white/70 dark:bg-black/40 
          backdrop-blur-2xl
          px-4 py-2
          rounded-full 
          border border-white/40 dark:border-white/10
          shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
          transition-all duration-500
          hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
          z-20
        "
      >
        {isAuthPage ? (
          <Link
            href="/"
            className="px-4 xl:px-6 py-1.5 xl:py-2 rounded-full text-[10px] xl:text-xs font-bold tracking-widest[0.1em] uppercase bg-[#E67E22] text-white shadow-lg shadow-[#E67E22]/25 hover:scale-105 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px] xl:text-[18px]">arrow_back</span>
            {t('header.nav.home')}
          </Link>
        ) : (
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.id}
                className={`
                  px-3 xl:px-5 py-1.5 xl:py-2 rounded-full text-[10px] xl:text-xs tracking-widest[0.1em] uppercase transition-all duration-300 whitespace-nowrap
                  ${isActive(link.id) 
                    ? 'font-bold bg-[#E67E22] text-white shadow-lg shadow-[#E67E22]/25' 
                    : `font-medium text-gray-800 dark:text-gray-200 hover:text-[#E67E22] relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-[#E67E22] hover:after:w-1/2 after:transition-all after:duration-300`}
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* CENTER: Logo */}
      <div className="flex-1 flex justify-center items-center pointer-events-none group z-10 min-w-max">
        <Link href="/" className="flex flex-col items-center pointer-events-auto">
          <h1 className="text-2xl xl:text-4xl font-black tracking-[0.2em] xl:tracking-[0.3em] drop-shadow-md group-hover:scale-105 transition-transform duration-500 uppercase">
            <span className="text-[#E67E22]">WAPI</span><span className="text-[#2D5A27]">BEI</span>
           </h1>
          <div className="w-8 xl:w-12 h-1 bg-[#E67E22] rounded-full mt-1 opacity-0 group-hover:opacity-100 group-hover:w-16 xl:group-hover:w-20 transition-all duration-500"></div>
        </Link>
      </div>

      {/* RIGHT: Search + Actions */}
      {!isAuthPage && (
        <div 
          className="
            shrink-0 flex items-center gap-3
            bg-white/70 dark:bg-black/40 
            backdrop-blur-2xl
            px-3 xl:px-4 py-1.5
            rounded-full 
            border border-white/40 dark:border-white/10
            shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
            transition-all duration-500
            hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
          "
        >
          {/* Global Search Bar */}
          <div className="transition-all duration-300 flex items-center justify-end">
            <GlobalSearch />
          </div>

          <div className="w-px h-6 bg-black/10 dark:bg-white/10 shrink-0"></div>

          {/* Notifications */}
          <div className="relative group" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(prev => !prev)}
              className="relative size-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-[#E67E22] hover:bg-[#E67E22]/10 dark:hover:bg-[#E67E22]/20 hover:scale-105 rounded-full transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 size-5 bg-[#E67E22] text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white dark:border-black animate-in zoom-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className={`absolute right-[-10px] top-[100%] pt-4 w-80 transition-all duration-300 transform origin-top-right z-50 group-hover:opacity-100 group-hover:visible group-hover:scale-100 ${isNotifOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
              <div className="bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[400px]">
                <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent shrink-0">
                  <h3 className="text-black dark:text-white font-black text-sm tracking-tight">{t('header.notifications')}</h3>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] text-white font-black bg-[#E67E22] px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                      {t('header.newNotification').replace('{count}', String(unreadCount)).replace('{s}', unreadCount > 1 ? 's' : '')}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-widest">
                      {t('header.newNotification').replace('{count}', '0').replace('{s}', '')}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <div className="size-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[24px]">notifications_off</span>
                      </div>
                      <p className="text-sm font-bold text-gray-400">{t('header.noNotifications')}</p>
                      <p className="text-[10px] text-gray-400/70 mt-1 uppercase tracking-wider">{t('header.upToDate')}</p>
                    </div>
                  ) : (
                    notifications.slice(0, 3).map((notification) => (
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
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E67E22]"></div>
                        )}
                        <p className="text-[13px] text-gray-800 dark:text-gray-200 font-medium leading-tight mb-1">
                          {notification.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {new Date(notification.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 bg-gray-50/50 dark:bg-white/5 text-center border-t border-gray-100 dark:border-white/5 shrink-0">
                  <Link href="/notifications" onClick={() => setIsNotifOpen(false)} className="text-[10px] text-black/60 dark:text-white/60 hover:text-[#E67E22] dark:hover:text-[#E67E22] transition-colors font-black uppercase tracking-widest block py-1">
                    {t('header.viewAllNotifications')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Cart */}
          <Link 
              href="/cart"
              className="relative size-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-[#E67E22] hover:bg-[#E67E22]/10 dark:hover:bg-[#E67E22]/20 hover:scale-105 rounded-full transition-all duration-300"
          >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {totalItems > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#E67E22] px-1 text-[10px] font-black leading-none tabular-nums text-white shadow-md dark:border-black"
                  >
                      {totalItems > 99 ? '99+' : totalItems}
                  </span>
              )}
          </Link>
          
          {/* Profile */}
          <div className="ml-1">
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
      )}

      {isAuthPage && <div className="w-[120px] invisible"></div>}
      
      </div>
    </div>
  );
};

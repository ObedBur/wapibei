'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BellOff, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useAppNotifications } from '@/hooks/useAppNotifications';
import { resolveNotificationUrl, AppNotification } from '@/types/notification';
import { useT } from '@/i18n/useT';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

interface NotificationDropdownPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Classes additionnelles pour la largeur / positionnement fourni par le header parent. */
  className?: string;
}

/**
 * Panneau de notifications partagé entre le Header site (DesktopHeader)
 * et le DashboardHeader. Le parent gère le bouton cloche + le ref de
 * fermeture au clic extérieur ; ce composant ne gère que le contenu du
 * panneau (en-tête, liste, état vide, pied de page).
 */
export const NotificationDropdownPanel: React.FC<NotificationDropdownPanelProps> = ({
  isOpen,
  onClose,
  className = 'w-[340px]',
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useT();
  const { notifications, unreadCount, markAsRead } = useAppNotifications();

  const handleNotifClick = (notif: AppNotification) => {
    if (!notif.isRead) markAsRead(notif.id);
    onClose();
    const url = resolveNotificationUrl(notif, user?.role);
    if (url) router.push(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className={`${className} bg-white dark:bg-[#161616] border border-gray-100 dark:border-white/8 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50 origin-top-right flex flex-col max-h-[400px]`}
        >
          {/* En-tête */}
          <div className="px-5 py-4 border-b border-gray-50 dark:border-white/8 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {t('header.notifications')}
            </h3>
            {unreadCount > 0 ? (
              <span className="text-[10px] text-white font-black bg-[#E67E22] px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                {unreadCount} {unreadCount > 1 ? 'nouvelles' : 'nouvelle'}
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 dark:bg-white/8 px-2.5 py-0.5 rounded-full">
                À jour
              </span>
            )}
          </div>

          {/* Liste */}
          <div className="divide-y divide-gray-50 dark:divide-white/5 overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center gap-3">
                <div className="size-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                  <BellOff className="w-6 h-6 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  {t('header.noNotifications')}
                </p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <motion.button
                  type="button"
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  whileHover={{ backgroundColor: notif.isRead ? 'rgba(0,0,0,0.02)' : 'rgba(230,126,34,0.06)' }}
                  aria-label={!notif.isRead ? `${notif.title} — ${t('header.unread')}` : notif.title}
                  className={`relative block w-full text-left px-5 py-3.5 cursor-pointer ${
                    !notif.isRead ? 'bg-[#E67E22]/[0.03]' : ''
                  }`}
                >
                  {!notif.isRead && (
                    <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-[#E67E22]" />
                  )}
                  <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 mb-0.5 line-clamp-1">
                    {notif.title}
                  </p>
                  <p className="text-[12px] text-gray-400 dark:text-gray-500 line-clamp-1 mb-1">
                    {notif.message}
                  </p>
                    <span className="text-[10px] text-gray-300 dark:text-gray-600 font-medium">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                </motion.button>
              ))
            )}
          </div>

          {/* Pied de page */}
          <div className="px-5 py-3 border-t border-gray-50 dark:border-white/8 bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
            <Link
              href="/notifications"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#E67E22] dark:hover:text-[#E67E22] transition-colors duration-200"
            >
              {t('header.viewAllNotifications')}
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

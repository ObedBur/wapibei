'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const STORAGE_KEY = 'wapibei_cookie_consent';

export type CookieConsentValue = 'accepted' | 'declined' | null;

function readConsent(): CookieConsentValue {
  try {
    return localStorage.getItem(STORAGE_KEY) as CookieConsentValue;
  } catch {
    return null;
  }
}

function writeConsent(value: 'accepted' | 'declined') {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // storage full or blocked — silently ignore
  }
}

export function useCookieConsent(): CookieConsentValue {
  const [consent, setConsent] = useState<CookieConsentValue>(null);

  useEffect(() => {
    setConsent(readConsent());
  }, []);

  return consent;
}

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) setIsVisible(true);
  }, []);

  const dismiss = useCallback((value: 'accepted' | 'declined') => {
    writeConsent(value);
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss('declined');
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, dismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="alertdialog"
          aria-label="Consentement aux cookies"
          aria-describedby="cookie-consent-desc"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] w-[calc(100vw-2rem)] max-w-[400px] glass-panel rounded-[var(--radius)] p-5 md:p-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-xl select-none">
              shield
            </span>
            <h4 className="font-display font-black text-foreground text-sm uppercase tracking-wider">
              Confidentialité
            </h4>
          </div>

          {/* Body */}
          <p
            id="cookie-consent-desc"
            className="text-sm text-foreground/70 mb-5 leading-relaxed"
          >
            WapiBei utilise des cookies pour optimiser votre expérience,
            mémoriser vos préférences et sécuriser vos transactions.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <Button
              variant="cta"
              size="sm"
              fullWidth
              onClick={() => dismiss('accepted')}
              className="text-xs uppercase tracking-widest"
            >
              Accepter les cookies
            </Button>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => dismiss('declined')}
              className="text-xs uppercase tracking-widest"
            >
              Refuser
            </Button>

            <Link
              href="/cookies"
              className="text-[11px] text-foreground/40 font-semibold uppercase tracking-widest hover:text-primary transition-colors text-center mt-1"
            >
              Lire nos engagements
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

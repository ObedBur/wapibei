
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLoading } from '@/context/LoadingContext';

const MAX_DISPLAY_TIME = 1500; // Safety fallback: always hide after 1.5s
const MIN_DISPLAY_TIME = 800;
const SPLASH_SEEN_KEY = 'wapibei_splash_seen';

const MESSAGES = [
  "Bienvenue sur WapiBei",
  "Chargement du marketplace Africain",
  "Prêt dans un instant..."
];

const readSeenFlag = (): boolean => {
  try {
    return typeof window !== 'undefined' && sessionStorage.getItem(SPLASH_SEEN_KEY) !== null;
  } catch {
    return false;
  }
};

const writeSeenFlag = () => {
  try {
    sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
  } catch {
    // Ignore: sessionStorage may be unavailable (private mode, etc.)
  }
};

export const SplashScreen: React.FC = () => {
  const { isAppReady } = useLoading();
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  // Espace admin = zone de travail : pas d'intro de marque, pas de splash.
  const isAdminArea = pathname?.startsWith('/admin');

  // Only render once per session: a pre-paint inline script in layout.tsx adds
  // the "splash-seen" class when the flag already exists (CSS hides the overlay
  // before hydration, then we unmount here).
  const [shouldRender, setShouldRender] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const startTimeRef = useRef<number>(0);

  // Gate: never render again if the splash was already shown this session
  useEffect(() => {
    if (readSeenFlag()) {
      setShouldRender(false);
    }
  }, []);

  useEffect(() => {
    if (shouldRender) {
      startTimeRef.current = Date.now();
    }
  }, [shouldRender]);

  // The home route controls its own handoff once HomeClient mounts. Other
  // routes keep a safety timeout in case they never emit a ready signal.
  useEffect(() => {
    if (!shouldRender || isHomePage) return;
    const fallback = setTimeout(() => {
      setIsVisible(false);
    }, MAX_DISPLAY_TIME);
    return () => clearTimeout(fallback);
  }, [isHomePage, shouldRender]);

  // Normal logic: hide splash when app is ready AND minimum time has elapsed
  useEffect(() => {
    if (!shouldRender || !isAppReady) return;
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTimeRef.current;
    const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [isAppReady, shouldRender]);

  // Messages animation loop
  useEffect(() => {
    if (!isVisible || !shouldRender) return;

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        const nextIndex = prev + 1;
        return nextIndex >= MESSAGES.length ? MESSAGES.length - 1 : nextIndex;
      });
    }, 400);

    return () => clearInterval(messageInterval);
  }, [isVisible, shouldRender]);

  // Remember that the splash has been shown once the exit animation completes
  const handleExitComplete = () => {
    writeSeenFlag();
  };

  if (!shouldRender || isAdminArea) return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          key="wapibei-splash"
          id="wapibei-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white"
          role="status"
          aria-live="polite"
          aria-label="Chargement de WapiBei"
        >
          {/* Background Decor */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse motion-reduce:animate-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-gray-50/50 to-transparent"></div>
          </div>

          <div className="relative flex flex-col items-center z-10">
            {/* Logo Container with Glow */}
            <div className="relative mb-12 animate-in fade-in zoom-in-95 duration-1000">
              {/* Subtle Outer Glow */}
              <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-2xl animate-pulse motion-reduce:animate-none"></div>

              {/* Main Logo Card */}
              <div className="relative flex items-center justify-center size-24 md:size-32 rounded-[2.5rem] bg-white p-6 shadow-[0_20px_50px_rgba(255,107,0,0.15)] border border-primary/10 animate-float motion-reduce:animate-none">
                <Image
                  src="/shopping-cart.png"
                  alt="WapiBei Shopping Cart"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>

              {/* Decorative Ring */}
              <div className="absolute -inset-2 border-2 border-primary/5 rounded-[3.5rem] animate-[spin_8s_linear_infinite] motion-reduce:animate-none"></div>
            </div>

            <div className="text-center space-y-6">
              <div className="overflow-hidden">
                <h1 className="text-5xl md:text-6xl font-black tracking-[-0.05em] text-slate-900 leading-none animate-in slide-in-from-bottom-full duration-700">
                  Wapi<span className="text-primary italic">Bei</span>
                </h1>
              </div>

              <div className="h-8 relative flex justify-center w-72 mx-auto">
                {MESSAGES.map((msg, idx) => (
                  <p
                    key={idx}
                    className={`absolute inset-0 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.3em] transition-all duration-700 ease-in-out
                      ${idx === messageIndex ? 'opacity-100 blur-none scale-100' : 'opacity-0 blur-sm scale-90 translate-y-2'}`}
                  >
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Modern Progress Bar */}
          <div className="absolute bottom-16 w-48 h-[2px] bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((messageIndex + 1) / MESSAGES.length) * 100}%` }}
            ></div>
          </div>

          <div className="absolute bottom-8 opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Marketplace Afrique</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

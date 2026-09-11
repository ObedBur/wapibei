"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { AnimatePresence, motion } from "framer-motion";
import { HeroSlide } from "../services/content.service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/useT";

const SLIDE_TITLE_KEYS: Record<string, string> = {
  "L'excellence à portée de main": "home.hero.fallbackSlides.s1Title",
  "L'élégance du détail": "home.hero.fallbackSlides.s2Title",
  "Qualité supérieure": "home.hero.fallbackSlides.s3Title",
  "Le meilleur choix": "home.hero.fallbackSlides.s4Title",
  "Style & Confort": "home.hero.fallbackSlides.s5Title",
};

interface HeroSlideshowProps {
  slides: HeroSlide[];
}

const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useT();

  const slideIds = useMemo(() => slides.map((s) => s.id).join("|"), [slides]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [slideIds]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) {
    return (
      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[400px] lg:h-[500px] rounded-3xl md:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 bg-gray-100 dark:bg-white/5 flex items-center justify-center">
        <p className="text-gray-400 font-medium">{t("home.hero.initializing")}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[260px] sm:h-[320px] md:h-[400px] lg:h-[500px] rounded-3xl md:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 group bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Ken Burns Effect Image */}
          <motion.div
            initial={{ scale: 1.2, rotate: 1 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 10, ease: "linear" }}
            className="absolute inset-0"
          >
            <Image
              src={slides[currentIndex].imageUrl}
              alt={slides[currentIndex].title}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={/^https?:\/\//i.test(slides[currentIndex].imageUrl)}
            />
          </motion.div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

          {/* Content Animation */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10 lg:p-12">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="max-w-md"
            >
              {slides[currentIndex].label && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Badge className="mb-2 sm:mb-4 bg-primary/20 backdrop-blur-md border-primary/30 text-primary-foreground">
                    {slides[currentIndex].label}
                  </Badge>
                </motion.div>
              )}

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight"
              >
                {slides[currentIndex].title}
              </motion.h3>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="flex items-center gap-3 mt-2 sm:mt-4"
              >
                <div className="h-px w-8 bg-primary/50" />
                <p className="text-white/70 text-xs md:text-sm font-bold uppercase tracking-widest">
                  {t("home.hero.exclusive")}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-30 flex gap-1.5 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={t("home.hero.goToSlide").replace("{index}", String(index + 1))}
              className="group relative"
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${index === currentIndex ? "w-8 bg-primary shadow-sm shadow-primary/50" : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface HeroProps {
  slides: HeroSlide[];
}

const REGISTER_VENDOR_HREF = "/register?role=VENDOR#role-vendeur";

export const Hero: React.FC<HeroProps> = ({ slides }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useT();

  const LOCAL_SLIDES: HeroSlide[] = [
    { id: 'slide-1', title: t("home.hero.fallbackSlides.s1Title"), imageUrl: '/hero/slide1.png', label: t("home.hero.fallbackSlides.s1Label") },
    { id: 'slide-2', title: t("home.hero.fallbackSlides.s2Title"), imageUrl: '/hero/slide2.png', label: t("home.hero.fallbackSlides.s2Label") },
    { id: 'slide-3', title: t("home.hero.fallbackSlides.s3Title"), imageUrl: '/hero/slide3.png', label: t("home.hero.fallbackSlides.s3Label") },
    { id: 'slide-4', title: t("home.hero.fallbackSlides.s4Title"), imageUrl: '/hero/slide4.png', label: t("home.hero.fallbackSlides.s4Label") },
    { id: 'slide-5', title: t("home.hero.fallbackSlides.s5Title"), imageUrl: '/hero/slide5.png', label: t("home.hero.fallbackSlides.s5Label") },
  ];

  const activeSlides = (slides.length > 0 ? slides : LOCAL_SLIDES).map((slide) => ({
    ...slide,
    title: SLIDE_TITLE_KEYS[slide.title] ? t(SLIDE_TITLE_KEYS[slide.title]) : slide.title,
  }));

  const handleVendorClick = async (e: React.MouseEvent) => {
    if (!isAuthenticated) return; // non connecté → lien normal vers /register

    e.preventDefault();

    const isVendor = user?.role === 'VENDOR' || user?.role === 'ADMIN';

    if (isVendor) {
      // Vendeur/Admin → redirection directe vers le dashboard
      window.location.href = '/dashboard';
      return;
    }

    // Client connecté → demander confirmation avant de déconnecter
    const firstName = user?.fullName?.split(' ')[0] ?? 'vous';
    const confirmed = window.confirm(
      `Vous êtes connecté en tant que ${firstName}.\n\nPour créer un compte vendeur, vous devez d'abord vous déconnecter.\n\nVoulez-vous continuer ?`
    );

    if (confirmed) {
      await logout();
      window.location.href = REGISTER_VENDOR_HREF;
    }
  };

  // Libellé et destination du bouton 2 selon le rôle
  const isVendorOrAdmin = user?.role === 'VENDOR' || user?.role === 'ADMIN';
  const vendorBtnLabel = isVendorOrAdmin
    ? t('home.hero.myVendorSpace')
    : t('home.hero.becomeVendor');
  const vendorBtnHref = isVendorOrAdmin ? '/dashboard' : REGISTER_VENDOR_HREF;

  return (
    <section className="relative px-4 py-12 md:py-20 lg:py-24 container mx-auto max-w-7xl overflow-hidden">
      <div className="absolute inset-0 bg-grid-tech radial-mask -z-20 opacity-40 pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6 items-center lg:items-start text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tighter text-deep-blue dark:text-white">
              <span className="text-[#E67E22]">{t("home.hero.bestProducts")}</span> <br />
              <span className="relative inline-block">
                {/* Conteneur pour l'effet d'écriture et le changement de couleurs fluide */}
                <motion.span
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }}
                  className="relative z-10"
                >
                  {t("home.hero.animatedWord").split("").map((char, index) => (
                    <motion.span
                      key={index}
                      variants={{
                        hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
                        visible: {
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px)",
                          color: ["#0f7a01ff", "#3e8135ff", "#2D5A27", "#1E3D1A"],
                          transition: {
                            opacity: { duration: 0.5 },
                            y: { duration: 0.5 },
                            filter: { duration: 0.5 },
                            color: {
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear",
                              delay: index * 0.1,
                            },
                          },
                        },
                      }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>

                {/* SVG qui se dessine tout seul avec un mouvement fluide */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-2 pointer-events-none"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: 1,
                      stroke: ["#E67E22", "#F39C12", "#D35400", "#E67E22"],
                    }}
                    transition={{
                      pathLength: {
                        delay: 1.2,
                        duration: 1.5,
                        ease: "easeInOut",
                      },
                      opacity: { delay: 1.2, duration: 1.5, ease: "easeInOut" },
                      stroke: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 1.2,
                      },
                    }}
                    d="M5 15Q100 0 195 15"
                    stroke="#E67E22"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>{" "}
              <br className="hidden md:block" />
              {t("home.hero.atFairPrice")}
            </h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0 pt-4">
              {t("home.hero.description")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
            <Link href="/products" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group h-14 w-full sm:w-auto px-8 rounded-xl bg-[#E67E22] text-white font-bold overflow-hidden transition-all shadow-lg hover:shadow-[#E67E22]/40 flex items-center justify-center cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t("home.hero.exploreProducts")}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-linear-to-r from-transparent via-white/30 to-transparent" />
              </motion.div>
            </Link>

            <Link href={vendorBtnHref} className="w-full sm:w-auto" onClick={handleVendorClick}>
              <motion.div
                whileHover={{ y: -2 }}
                className="h-14 w-full sm:w-auto px-8 rounded-xl border-2 border-[#2D5A27]/20 text-[#2D5A27] font-bold hover:bg-[#2D5A27] hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black transition-colors duration-300 flex items-center justify-center cursor-pointer"
              >
                {vendorBtnLabel}
              </motion.div>
            </Link>
          </div>
        </div>

        <div className="relative w-full hidden lg:block animate-in zoom-in fade-in duration-1000">
          <HeroSlideshow slides={activeSlides} />
          <div className="absolute -z-10 -top-6 -right-6 size-48 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -z-10 -bottom-10 -left-10 size-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
};
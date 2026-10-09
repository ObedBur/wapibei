"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/useT";
import { ChronicleButton } from "@/components/ui/chronicle-button";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

const REGISTER_VENDOR_HREF = "/register?role=VENDOR#role-vendeur";

// 4 images authentiques — aucune surcharge décorative, la photo est la star
const DICED_IMAGES = [
  {
    title: "Légumes & Récoltes",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
    cornerClass: "bottom-right",
    category: "Agricole",
    floatOffset: { y: [-4, 4, -4], duration: 5.5 },
  },
  {
    title: "Fruits frais exotiques",
    image: "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80",
    cornerClass: "bottom-left",
    category: "Alimentation",
    floatOffset: { y: [4, -4, 4], duration: 6.2 },
  },
  {
    title: "Fraises & Saveurs",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
    cornerClass: "top-right",
    category: "Frais",
    floatOffset: { y: [-4, 4, -4], duration: 5.8 },
  },
  {
    title: "Chou-fleur & Maraîchage",
    image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80",
    cornerClass: "top-left",
    category: "Terroir",
    floatOffset: { y: [4, -4, 4], duration: 6.6 },
  },
];

interface HeroProps {
  slides?: unknown[];
}

export const Hero: React.FC<HeroProps> = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useT();
  const router = useRouter();

  // Index de l'image survolée
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleVendorClick = async (e: React.MouseEvent) => {
    if (!isAuthenticated) return;
    e.preventDefault();

    const isVendor = user?.role === "VENDOR" || user?.role === "ADMIN";
    if (isVendor) {
      window.location.href = "/dashboard";
      return;
    }

    const firstName = user?.fullName?.split(" ")[0] ?? "vous";
    const confirmed = window.confirm(
      `Vous êtes connecté en tant que ${firstName}.\n\nPour créer un compte vendeur, vous devez d'abord vous déconnecter.\n\nVoulez-vous continuer ?`
    );

    if (confirmed) {
      await logout();
      window.location.href = REGISTER_VENDOR_HREF;
    }
  };

  const isVendorOrAdmin = user?.role === "VENDOR" || user?.role === "ADMIN";

  return (
    <section className="relative px-6 lg:px-10 py-12 md:py-16 lg:py-24 container mx-auto max-w-[1440px] overflow-hidden">
      {/* Léger halo d'ambiance discret */}
      <div className="absolute inset-0 bg-grid-tech radial-mask -z-20 opacity-20 pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* ─── GAUCHE : TEXTE SOBRE, CLAIR ET VIVANT (ORCHESTRATION D'ENTRÉE) ─── */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-10">
          {/* Surtitre orienté bénéfice client */}
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-[#E67E22] dark:text-[#F39C12] mb-3 select-none"
          >
            Comparez, trouvez et économisez
          </motion.span>

          {/* Titre H1 percutant avec effet Typewriter Framer sans saut de ligne */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-[2.65rem] lg:text-[2.35rem] xl:text-[2.75rem] font-black tracking-tight leading-[1.2] text-slate-900 dark:text-white"
          >
            <span className="block whitespace-nowrap">La qualité d&apos;ici,</span>
            <span className="inline-flex flex-nowrap items-baseline justify-center lg:justify-start gap-x-2 sm:gap-x-2.5 whitespace-nowrap">
              <span>de nos produits</span>
              <TypewriterEffect
                words={[{ word: "au juste prix." }]}
                loop={true}
                typingSpeed={90}
                deletingSpeed={50}
                pauseDuration={2600}
                cursorColor="#E67E22"
                cursorWidth={4}
                cursorHeight={85}
                className="inline-flex font-black pt-1 pb-2"
              />
            </span>
          </motion.h1>

          {/* Paragraphe descriptif sans faute, fluide et captivant */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl mt-5 md:mt-6 mb-8"
          >
            La qualité d&apos;ici, de nos produits, au juste prix. Produits agricoles, alimentation fraîche, mode ou high-tech : comparez les offres en temps réel et achetez directement auprès de vendeurs vérifiés, sans frais cachés.
          </motion.p>

          {/* Actions / Boutons avec physique interactive agréable */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full sm:w-auto"
          >
            {/* Bouton Primaire interactif avec l'animation de roll/flip 3D ChronicleButton */}
            <Link href="/products" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto shadow-md shadow-[#E67E22]/20 hover:shadow-xl hover:shadow-[#E67E22]/30 transition-shadow rounded-[14px] overflow-hidden"
              >
                <ChronicleButton
                  text="Explorer les offres"
                  onClick={() => router.push("/products")}
                  width="210px"
                  borderRadius="14px"
                  customBackground="#E67E22"
                  customForeground="#ffffff"
                  hoverColor="#2D5A27"
                  hoverForeground="#ffffff"
                />
              </motion.div>
            </Link>

            {/* Bouton Secondaire : uniquement pour les visiteurs / non-vendeurs */}
            {!isVendorOrAdmin && (
              <Link href={REGISTER_VENDOR_HREF} onClick={handleVendorClick} className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  type="button"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-[14px] font-bold text-sm md:text-base border-2 border-[#2D5A27]/30 text-[#2D5A27] dark:text-emerald-400 dark:border-emerald-500/30 hover:bg-[#2D5A27] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  {t("home.hero.becomeVendor")}
                </motion.button>
              </Link>
            )}
          </motion.div>
        </div>

        {/* ─── DROITE : MOSAÏQUE 21ST.DEV EXACTE (TRÈFLE IDENTIQUE À LA RÉFÉRENCE) ─── */}
        <div className="relative w-full max-w-[480px] lg:max-w-[520px] mx-auto z-10">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
              width: "100%",
              aspectRatio: "1 / 1",
            }}
          >
            {DICED_IMAGES.map((item, index) => {
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "100%",
                    overflow: "hidden",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/products?cat=${encodeURIComponent(item.category)}`)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`warped-image ${item.cornerClass}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      cursor: "pointer",
                      transform: isHovered ? "scale(1.06)" : "scale(1)",
                      transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Masque CSS du trèfle identique à la référence 21st.dev */}
      <style>{`
        .warped-image {
          --r: 20px;
          --s: 40px;
          --x: 25px;
          --y: 5px;
        }

        .bottom-right {
          --_m: /calc(2*var(--r)) calc(2*var(--r)) radial-gradient(#000 70%, #0000 72%);
          --_g: conic-gradient(from 90deg at calc(100% - var(--r)) calc(100% - var(--r)), #0000 25%, #000 0);
          --_d: (var(--s) + var(--r));
          -webkit-mask: calc(100% - var(--_d) - var(--x)) 100% var(--_m), 100% calc(100% - var(--_d) - var(--y)) var(--_m), radial-gradient(var(--s) at 100% 100%, #0000 99%, #000 calc(100% + 1px)) calc(-1*var(--r) - var(--x)) calc(-1*var(--r) - var(--y)), var(--_g) calc(-1*var(--_d) - var(--x)) 0, var(--_g) 0 calc(-1*var(--_d) - var(--y));
          mask: calc(100% - var(--_d) - var(--x)) 100% var(--_m), 100% calc(100% - var(--_d) - var(--y)) var(--_m), radial-gradient(var(--s) at 100% 100%, #0000 99%, #000 calc(100% + 1px)) calc(-1*var(--r) - var(--x)) calc(-1*var(--r) - var(--y)), var(--_g) calc(-1*var(--_d) - var(--x)) 0, var(--_g) 0 calc(-1*var(--_d) - var(--y));
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
        }

        .bottom-left {
          --_m: /calc(2*var(--r)) calc(2*var(--r)) radial-gradient(#000 70%, #0000 72%);
          --_g: conic-gradient(from 180deg at var(--r) calc(100% - var(--r)), #0000 25%, #000 0);
          --_d: (var(--s) + var(--r));
          -webkit-mask: calc(var(--_d) + var(--x)) 100% var(--_m), 0 calc(100% - var(--_d) - var(--y)) var(--_m), radial-gradient(var(--s) at 0 100%, #0000 99%, #000 calc(100% + 1px)) calc(var(--r) + var(--x)) calc(-1*var(--r) - var(--y)), var(--_g) calc(var(--_d) + var(--x)) 0, var(--_g) 0 calc(-1*var(--_d) - var(--y));
          mask: calc(var(--_d) + var(--x)) 100% var(--_m), 0 calc(100% - var(--_d) - var(--y)) var(--_m), radial-gradient(var(--s) at 0 100%, #0000 99%, #000 calc(100% + 1px)) calc(var(--r) + var(--x)) calc(-1*var(--r) - var(--y)), var(--_g) calc(var(--_d) + var(--x)) 0, var(--_g) 0 calc(-1*var(--_d) - var(--y));
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
        }

        .top-right {
          --_m: /calc(2*var(--r)) calc(2*var(--r)) radial-gradient(#000 70%, #0000 72%);
          --_g: conic-gradient(at calc(100% - var(--r)) var(--r), #0000 25%, #000 0);
          --_d: (var(--s) + var(--r));
          -webkit-mask: calc(100% - var(--_d) - var(--x)) 0 var(--_m), 100% calc(var(--_d) + var(--y)) var(--_m), radial-gradient(var(--s) at 100% 0, #0000 99%, #000 calc(100% + 1px)) calc(-1*var(--r) - var(--x)) calc(var(--r) + var(--y)), var(--_g) calc(-1*var(--_d) - var(--x)) 0, var(--_g) 0 calc(var(--_d) + var(--y));
          mask: calc(100% - var(--_d) - var(--x)) 0 var(--_m), 100% calc(var(--_d) + var(--y)) var(--_m), radial-gradient(var(--s) at 100% 0, #0000 99%, #000 calc(100% + 1px)) calc(-1*var(--r) - var(--x)) calc(var(--r) + var(--y)), var(--_g) calc(-1*var(--_d) - var(--x)) 0, var(--_g) 0 calc(var(--_d) + var(--y));
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
        }

        .top-left {
          --_m: /calc(2*var(--r)) calc(2*var(--r)) radial-gradient(#000 70%, #0000 72%);
          --_g: conic-gradient(at var(--r) var(--r), #000 75%, #0000 0);
          --_d: (var(--s) + var(--r));
          -webkit-mask: calc(var(--_d) + var(--x)) 0 var(--_m), 0 calc(var(--_d) + var(--y)) var(--_m), radial-gradient(var(--s) at 0 0, #0000 99%, #000 calc(100% + 1px)) calc(var(--r) + var(--x)) calc(var(--r) + var(--y)), var(--_g) calc(var(--_d) + var(--x)) 0, var(--_g) 0 calc(var(--_d) + var(--y));
          mask: calc(var(--_d) + var(--x)) 0 var(--_m), 0 calc(var(--_d) + var(--y)) var(--_m), radial-gradient(var(--s) at 0 0, #0000 99%, #000 calc(100% + 1px)) calc(var(--r) + var(--x)) calc(var(--r) + var(--y)), var(--_g) calc(var(--_d) + var(--x)) 0, var(--_g) 0 calc(var(--_d) + var(--y));
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
        }
      `}</style>
    </section>
  );
};
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from 'next/image';
import { useT } from "@/i18n/useT";
import { getCategories } from "@/features/products/services/product.service";

// Cache module : évite de refetch les catégories à chaque navigation/remontage
let categoryIdCache: Record<string, number> | null = null;

// --- Sous-composant pour éviter la répétition ---
const FooterLink = ({ href, label, dotColor = "bg-[#E67E22]/30" }: { href: string; label: string; dotColor?: string }) => (
  <li>
    <Link href={href} className="text-sm font-bold text-slate-600 hover:text-[#E67E22] transition-colors flex items-center gap-2 group">
      <span className={`size-1 rounded-full group-hover:bg-[#E67E22] transition-colors ${dotColor}`}></span>
      {label}
    </Link>
  </li>
);

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { t } = useT();
  const authPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

  const [categoryIds, setCategoryIds] = useState<Record<string, number>>(
    categoryIdCache ?? {}
  );

  useEffect(() => {
    if (categoryIdCache) return;

    let cancelled = false;
    getCategories().then((res) => {
      const map: Record<string, number> = {};
      for (const c of res.success ? res.data : []) {
        map[c.name] = c.id;
      }
      categoryIdCache = map;
      if (!cancelled) setCategoryIds(map);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (authPaths.some((path) => pathname?.startsWith(path))) return null;

  const NAV_LINKS = [
    { label: t("header.nav.home"), href: "/" },
    { label: t("header.nav.products"), href: "/products" },
    { label: t("header.nav.sellers"), href: "/sellers" },
    { label: t("footer.howItWorks"), href: "/#how-it-works" },
  ];

  const SECTORS = [
    { key: "footer.sectorsList.agricultural", catName: "Agricole" },
    { key: "footer.sectorsList.highTech", catName: "High-Tech" },
    { key: "footer.sectorsList.fashion", catName: "Mode" },
    { key: "footer.sectorsList.express", catName: "Boutique Express" },
    { key: "footer.sectorsList.services", catName: "Services & Travaux" },
  ];

  const sectorHref = (catName: string) => {
    const id = categoryIds[catName];
    return id ? `/products?category=${id}` : "/products";
  };

  return (
    <footer className="bg-slate-50 dark:bg-[#0b1221] text-slate-900 dark:text-white pt-24 pb-12 border-t border-slate-200 dark:border-white/10 relative overflow-hidden">
      {/* Effets de fond */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E67E22]/20 to-transparent" />
      <div className="absolute -top-64 -right-64 w-[500px] h-[500px] bg-[#E67E22]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">

          {/* Logo & Slogan (Col 4) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center size-25  rounded-[1.5rem] bg-white dark:bg-slate-800 p-6  animate-float">
                <Image
                  src="/shopping-cart.png"
                  alt="WapiBei Shopping Cart"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <h2 className="text-3xl font-black tracking-tighter">Wapi<span className="text-[#E67E22]">Bei</span></h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium max-w-sm">
              {t("footer.description")}
            </p>
          </div>

          {/* Navigation (Col 2) */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#E67E22]">{t("footer.navigation")}</h4>
            <ul className="space-y-4">
              {NAV_LINKS.map((link) => <FooterLink key={link.label} {...link} />)}
            </ul>
          </div>

          {/* Secteurs (Col 3) */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#E67E22]">{t("footer.sectors")}</h4>
            <ul className="space-y-4">
              {SECTORS.map((s) => (
                <FooterLink key={s.key} label={t(s.key)} href={sectorHref(s.catName)} dotColor="bg-slate-300 dark:bg-slate-700" />
              ))}
            </ul>
          </div>

          {/* Contact (Col 3) */}
          <div className="lg:col-span-3 space-y-8 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#E67E22]">{t("footer.customerService")}</h4>
            <ContactItem icon="call" label={t("footer.phone")} value="+243 999 123 456" />
            <ContactItem icon="alternate_email" label={t("footer.emailSupport")} value="contact@wapibei.cd" />
          </div>
        </div>

        {/* Bottom bar simplifiée */}
        <div className="pt-12 mt-12 border-t border-slate-200 dark:border-white/10 flex flex-col items-start gap-4 text-[11px] text-slate-500">

          {/* Zone des liens : Alignés à gauche comme chez Cisco */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <Link href="/privacy" className="hover:text-[#E67E22] transition-colors">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-[#E67E22] transition-colors">{t("footer.terms")}</Link>
            <Link href="/cookies" className="hover:text-[#E67E22] transition-colors">{t("footer.cookies")}</Link>
            <Link href="/mentions-legales" className="hover:text-[#E67E22] transition-colors">{t("footer.legal")}</Link>
          </div>

          <p className="text-slate-400 dark:text-slate-600">
            {t("footer.rightsReserved").replace("{year}", String(new Date().getFullYear()))}
          </p>
        </div>
      </div>
    </footer>
  );
};

// Petit composant utilitaire pour le contact
const ContactItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="flex items-start gap-4">
    <span className="material-symbols-outlined text-[#E67E22]">{icon}</span>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-black text-slate-900">{value}</p>
    </div>
  </div>
);

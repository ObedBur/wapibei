"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/useT";
import { getCategories } from "@/features/products/services/product.service";

// Cache module : évite de refetch les catégories à chaque navigation/remontage
let categoryIdCache: Record<string, number> | null = null;

// ─── SVG Icons (inline, professionnels et cohérents) ───────────────────────
const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72 2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 6.23a16 16 0 006.29 6.29l.79-.79a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);

const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const IconTruck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <path d="M16 8h4l3 4v4h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconRefresh = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
);

const IconHeadset = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/>
    <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
  </svg>
);

const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);

const IconTwitter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
  </svg>
);

const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const IconWhatsapp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
  </svg>
);

// ─── Trust Feature Strip ────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: <IconTruck />,   label: "Livraison Rapide",     sub: "Partout en RDC" },
  { icon: <IconShield />,  label: "Achat Sécurisé",       sub: "Vendeurs vérifiés" },
  { icon: <IconRefresh />, label: "Retour Facile",         sub: "Sous 7 jours" },
  { icon: <IconHeadset />, label: "Support 24/7",          sub: "+243 999 123 456" },
];

// ─── Footer Link ────────────────────────────────────────────────────────────
const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <li>
    <Link
      href={href}
      className="group flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#E67E22] dark:hover:text-[#E67E22] transition-colors duration-200"
    >
      <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-[#E67E22]">
        <IconChevron />
      </span>
      {label}
    </Link>
  </li>
);

// ─── Social Button ──────────────────────────────────────────────────────────
const SocialBtn = ({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`flex items-center justify-center size-10 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-all duration-200 hover:border-transparent hover:text-white ${color}`}
  >
    {icon}
  </a>
);

// ─── Main Component ─────────────────────────────────────────────────────────
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
    return () => { cancelled = true; };
  }, []);

  if (authPaths.some((path) => pathname?.startsWith(path))) return null;

  const sectorHref = (catName: string) => {
    const id = categoryIds[catName];
    return id ? `/products?category=${id}` : "/products";
  };

  const EXPLORE_LINKS = [
    { label: t("header.nav.home"),     href: "/" },
    { label: t("header.nav.products"), href: "/products" },
    { label: t("header.nav.sellers"),  href: "/sellers" },
    { label: t("footer.howItWorks"),   href: "/#how-it-works" },
    { label: "Comparer les prix",      href: "/compare" },
  ];

  const SECTOR_LINKS = [
    { label: t("footer.sectorsList.agricultural"), href: sectorHref("Agricole") },
    { label: t("footer.sectorsList.highTech"),     href: sectorHref("High-Tech") },
    { label: t("footer.sectorsList.fashion"),      href: sectorHref("Mode") },
    { label: t("footer.sectorsList.express"),      href: sectorHref("Boutique Express") },
    { label: t("footer.sectorsList.services"),     href: sectorHref("Services & Travaux") },
  ];

  const LEGAL_LINKS = [
    { label: t("footer.privacy"), href: "/privacy" },
    { label: t("footer.terms"),   href: "/terms" },
    { label: t("footer.cookies"), href: "/cookies" },
    { label: t("footer.legal"),   href: "/mentions-legales" },
  ];

  return (
    <footer className="bg-white dark:bg-[#0b1221] border-t border-slate-100 dark:border-white/[0.06]">

      {/* ── Trust Strip ─────────────────────────────────────────────────── */}
      <div className="border-b border-slate-100 dark:border-white/[0.06]">
        <div className="container mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-4 group">
                <div className="flex-shrink-0 flex items-center justify-center size-12 rounded-2xl bg-[#E67E22]/8 dark:bg-[#E67E22]/10 text-[#E67E22] transition-all duration-300 group-hover:bg-[#E67E22]/15 group-hover:scale-105">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{item.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer Body ─────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">

          {/* Brand col (col-span-4) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 w-fit">
              <div className="relative flex items-center justify-center size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden">
                <Image
                  src="/shopping-cart.png"
                  alt="WapiBei"
                  width={40}
                  height={40}
                  className="w-8 h-8 object-contain"
                  priority
                />
              </div>
              <span className="text-2xl font-black tracking-tight">
                Wapi<span className="text-[#E67E22]">Bei</span>
              </span>
            </Link>

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>

            {/* Social */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600 mb-4">
                Suivez-nous
              </p>
              <div className="flex items-center gap-3">
                <SocialBtn href="#" icon={<IconFacebook />} label="Facebook" color="hover:bg-[#1877f2]" />
                <SocialBtn href="#" icon={<IconTwitter />}  label="Twitter"  color="hover:bg-[#1da1f2]" />
                <SocialBtn href="#" icon={<IconInstagram />} label="Instagram" color="hover:bg-[#e1306c]" />
                <SocialBtn href="#" icon={<IconWhatsapp />} label="WhatsApp" color="hover:bg-[#25d366]" />
              </div>
            </div>
          </div>

          {/* Explore col (col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
              {t("footer.navigation")}
            </h4>
            <ul className="space-y-3.5">
              {EXPLORE_LINKS.map((l) => <FooterLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* Secteurs col (col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
              {t("footer.sectors")}
            </h4>
            <ul className="space-y-3.5">
              {SECTOR_LINKS.map((l) => <FooterLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* Contact col (col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
              {t("footer.customerService")}
            </h4>

            {/* Contact cards */}
            <div className="space-y-3">
              <a
                href="tel:+243999123456"
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-[#E67E22]/30 dark:hover:border-[#E67E22]/30 hover:bg-[#E67E22]/5 transition-all duration-200 group"
              >
                <span className="flex-shrink-0 flex items-center justify-center size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[#E67E22] shadow-sm group-hover:bg-[#E67E22] group-hover:text-white group-hover:border-[#E67E22] transition-all duration-200">
                  <IconPhone />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    {t("footer.phone")}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    +243 999 123 456
                  </p>
                </div>
              </a>

              <a
                href="mailto:contact@wapibei.cd"
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-[#E67E22]/30 dark:hover:border-[#E67E22]/30 hover:bg-[#E67E22]/5 transition-all duration-200 group"
              >
                <span className="flex-shrink-0 flex items-center justify-center size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[#E67E22] shadow-sm group-hover:bg-[#E67E22] group-hover:text-white group-hover:border-[#E67E22] transition-all duration-200">
                  <IconMail />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    {t("footer.emailSupport")}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    contact@wapibei.cd
                  </p>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 dark:border-white/[0.06]">
        <div className="container mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

            {/* Legal links */}
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[11px] font-medium text-slate-400 dark:text-slate-600 hover:text-[#E67E22] dark:hover:text-[#E67E22] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Copyright */}
            <p className="text-[11px] text-slate-400 dark:text-slate-600 whitespace-nowrap">
              {t("footer.rightsReserved").replace("{year}", String(new Date().getFullYear()))}
            </p>

          </div>
        </div>
      </div>

    </footer>
  );
};

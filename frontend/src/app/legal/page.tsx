'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Lock,
  Cookie,
  ScrollText,
} from 'lucide-react';

const pages = [
  {
    href: '/mentions-legales',
    icon: FileText,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    border: 'border-[#E67E22]/20 hover:border-[#E67E22]/50',
    title: 'Mentions légales',
    description: 'Éditeur, rôle de WapiBei, propriété intellectuelle et responsabilités.',
  },
  {
    href: '/privacy',
    icon: Lock,
    color: 'text-[#2D5A27]',
    bg: 'bg-[#2D5A27]/10',
    border: 'border-[#2D5A27]/20 hover:border-[#2D5A27]/50',
    title: 'Politique de confidentialité',
    description: 'Collecte, utilisation et protection de vos données personnelles.',
  },
  {
    href: '/cookies',
    icon: Cookie,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    border: 'border-[#E67E22]/20 hover:border-[#E67E22]/50',
    title: 'Politique des cookies',
    description: 'Cookies utilisés, consentement et gestion de vos préférences.',
  },
  {
    href: '/terms',
    icon: ScrollText,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    border: 'border-[#E67E22]/20 hover:border-[#E67E22]/50',
    title: 'Conditions d\'utilisation',
    description: 'Règles d\'utilisation, transactions et résolution des litiges.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LegalHubPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#E67E22] rounded-full blur-[160px] opacity-[0.06] dark:opacity-[0.10] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-[#2D5A27] rounded-full blur-[140px] opacity-[0.05] dark:opacity-[0.08] pointer-events-none" />
        <div className="container mx-auto max-w-4xl px-6 pt-20 pb-14 md:pt-28 md:pb-20 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <Link
                href="/"
                className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:bg-[#E67E22] hover:text-white hover:border-[#E67E22] transition-all"
              >
                <ArrowLeft size={18} />
              </Link>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E67E22]">
                Informations légales
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#E67E22]/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-[#E67E22]" strokeWidth={2} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                Mentions légales et politique
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="max-w-2xl text-base font-medium leading-8 text-muted-foreground">
              Vos droits, nos engagements. Retrouvez toutes les informations légales relatives à l&apos;utilisation de WapiBei.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Cards grid */}
      <section className="container mx-auto max-w-4xl px-6 py-12 md:py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-4 md:gap-5 sm:grid-cols-2"
        >
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <motion.div key={page.href} variants={fadeUp}>
                <Link
                  href={page.href}
                  className={`block rounded-2xl border bg-card p-5 md:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${page.border}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${page.bg}`}>
                      <Icon className={`w-5 h-5 ${page.color}`} strokeWidth={2} />
                    </span>
                    <h2 className="text-base font-bold text-foreground">{page.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {page.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </main>
  );
}

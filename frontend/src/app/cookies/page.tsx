'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Cookie,
  Settings,
  BarChart3,
  ShieldCheck,
  Mail,
} from 'lucide-react';

const sections = [
  {
    id: '1',
    icon: Cookie,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '1. Qu\'est-ce qu\'un cookie ?',
    content: [
      "Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite sur un site web. Il permet au site de mémoriser vos actions et préférences pendant une durée déterminée.",
      "Les cookies peuvent être strictement nécessaires au fonctionnement du site, ou utilisés à des fins de mesure d'audience, de personnalisation ou de publicité.",
    ],
  },
  {
    id: '2',
    icon: Settings,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '2. Cookies utilisés par WapiBei',
    content: [
      "WapiBei utilise des cookies et technologies similaires pour assurer le bon fonctionnement du site, sécuriser les sessions, mémoriser certains choix utilisateur et mesurer l'utilisation de la plateforme.",
      "Certains cookies techniques peuvent être indispensables à l'authentification, à la sécurité ou à l'accès aux espaces réservés.",
    ],
  },
  {
    id: '3',
    icon: ShieldCheck,
    color: 'text-[#2D5A27]',
    bg: 'bg-[#2D5A27]/10',
    title: '3. Cookies strictement nécessaires',
    content: [
      "Les cookies strictement nécessaires au fonctionnement du service peuvent être utilisés sans consentement préalable lorsqu'ils sont indispensables à la fourniture de la plateforme.",
      "Ces cookies incluent les tokens d'authentification, les préférences de session et les paramètres de sécurité.",
    ],
  },
  {
    id: '4',
    icon: BarChart3,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '4. Cookies de mesure d\'audience',
    content: [
      "Les cookies utilisés pour la mesure d'audience, la personnalisation avancée ou la publicité doivent être contrôlés selon les choix de l'utilisateur lorsque ces fonctionnalités sont activées.",
      "Ces cookies nous aident à comprendre comment vous utilisez la plateforme afin d'améliorer nos services.",
    ],
  },
  {
    id: '5',
    icon: Settings,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '5. Gestion de votre consentement',
    content: [
      "Le bandeau de consentement vous permet d'accepter ou de refuser l'utilisation de cookies non essentiels lors de votre première visite.",
      "Votre choix est enregistré dans votre navigateur afin d'éviter d'afficher le message à chaque visite. Vous pouvez modifier vos préférences à tout moment en vidant les données de navigation de votre navigateur.",
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function CookiesPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#E67E22] rounded-full blur-[160px] opacity-[0.06] dark:opacity-[0.10] pointer-events-none" />
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
                Cookies
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#E67E22]/10 flex items-center justify-center">
                <Cookie className="w-6 h-6 md:w-7 md:h-7 text-[#E67E22]" strokeWidth={2} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                Politique des cookies
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="max-w-2xl text-base font-medium leading-8 text-muted-foreground">
              Comment WapiBei utilise les cookies, quelles technologies sont déployées et comment vous pouvez gérer vos préférences.
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 text-sm font-bold text-muted-foreground/60">
              Dernière mise à jour : 8 juin 2026
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                id={section.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-border bg-card p-5 md:p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${section.bg}`}>
                    <Icon className={`w-4 h-4 ${section.color}`} strokeWidth={2} />
                  </span>
                  <h2 className="text-base md:text-lg font-bold text-foreground">{section.title}</h2>
                </div>
                <div className="space-y-3 pl-12">
                  {section.content.map((p) => (
                    <p key={p} className="text-sm md:text-base font-medium leading-7 text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-12 rounded-2xl border border-[#E67E22]/20 bg-[#E67E22]/[0.04] dark:bg-[#E67E22]/[0.08] p-6 md:p-8 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E67E22]/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#E67E22]" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-black text-foreground mb-2">Questions sur les cookies ?</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Contactez-nous pour toute question concernant notre politique de cookies.
          </p>
          <a
            href="mailto:contact@wapibei.cd"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E67E22] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#E67E22]/90 transition-colors"
          >
            <Mail size={16} strokeWidth={2.5} />
            Contacter le support
          </a>
        </motion.div>
      </section>
    </main>
  );
}

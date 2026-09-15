'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Building2,
  Users,
  Copyright,
  AlertTriangle,
  Mail,
  ShieldCheck,
} from 'lucide-react';

const sections = [
  {
    id: '1',
    icon: Building2,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '1. Éditeur de la plateforme',
    content: [
      'La plateforme WapiBei est un service de marketplace permettant aux utilisateurs de consulter des produits, comparer des offres et entrer en relation avec des vendeurs.',
      "Les informations administratives complètes de l'éditeur, notamment l'adresse, le numéro d'immatriculation et les coordonnées légales, doivent être complétées par l'équipe WapiBei avant publication définitive.",
    ],
  },
  {
    id: '2',
    icon: Users,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '2. Rôle de WapiBei',
    content: [
      'WapiBei agit comme intermédiaire technique entre les acheteurs, les visiteurs et les vendeurs présents sur la plateforme.',
      "Les vendeurs restent responsables des informations, prix, disponibilités, images, descriptions et conditions commerciales qu'ils publient.",
    ],
  },
  {
    id: '3',
    icon: Copyright,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '3. Propriété intellectuelle',
    content: [
      "Les textes, interfaces, logos, éléments graphiques, contenus de marque et structures de la plateforme WapiBei sont protégés par les règles applicables à la propriété intellectuelle.",
      "Toute reproduction, modification ou réutilisation non autorisée des éléments de la plateforme est interdite.",
    ],
  },
  {
    id: '4',
    icon: AlertTriangle,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '4. Responsabilités',
    content: [
      "WapiBei s'efforce de maintenir la plateforme accessible et fiable, mais ne peut garantir l'absence permanente d'interruptions, d'erreurs ou d'indisponibilités techniques.",
      "WapiBei ne peut être tenu responsable des litiges commerciaux entre un acheteur et un vendeur lorsque les informations ou engagements proviennent directement du vendeur.",
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

export default function MentionsLegalesPage() {
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
                Informations légales
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#E67E22]/10 flex items-center justify-center">
                <FileText className="w-6 h-6 md:w-7 md:h-7 text-[#E67E22]" strokeWidth={2} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                Mentions légales
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="max-w-2xl text-base font-medium leading-8 text-muted-foreground">
              Informations relatives à l&apos;éditeur, au rôle de WapiBei, à la propriété intellectuelle et aux responsabilités de la plateforme.
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
          <h3 className="text-lg font-black text-foreground mb-2">Une question légale ?</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Contactez notre équipe pour toute question relative aux mentions légales.
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

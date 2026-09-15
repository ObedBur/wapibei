'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Lock,
  Eye,
  Database,
  Share2,
  ShieldCheck,
  Mail,
} from 'lucide-react';

const sections = [
  {
    id: '1',
    icon: Database,
    color: 'text-[#2D5A27]',
    bg: 'bg-[#2D5A27]/10',
    title: '1. Données collectées',
    content: [
      "WapiBei peut collecter les données nécessaires à la création de compte, à l'authentification, à la gestion des commandes, aux notifications et à l'amélioration du service.",
      "Ces données peuvent inclure le nom, l'adresse e-mail, le numéro de téléphone, le rôle utilisateur, les préférences de notification et les informations strictement utiles au fonctionnement de la marketplace.",
    ],
  },
  {
    id: '2',
    icon: Eye,
    color: 'text-[#2D5A27]',
    bg: 'bg-[#2D5A27]/10',
    title: '2. Utilisation des données',
    content: [
      "Les données collectées sont utilisées exclusivement pour le fonctionnement de la plateforme : gestion des comptes, traitement des commandes, envoi de notifications et amélioration de l'expérience utilisateur.",
      "WapiBei ne vend pas les données personnelles des utilisateurs à des tiers. Les données peuvent être partagées uniquement avec les vendeurs concernés dans le cadre d'une transaction.",
    ],
  },
  {
    id: '3',
    icon: Share2,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '3. Partage des données',
    content: [
      "Les données personnelles ne sont jamais vendues ni louées à des tiers.",
      "Elles peuvent être partagées avec des prestataires techniques Strictement nécessaires au fonctionnement du service (hébergement, paiement, notification).",
      "Des informations peuvent être divulguées en cas d'obligation légale ou de demande judiciaire.",
    ],
  },
  {
    id: '4',
    icon: ShieldCheck,
    color: 'text-[#2D5A27]',
    bg: 'bg-[#2D5A27]/10',
    title: '4. Sécurité',
    content: [
      "WapiBei met en place des mesures raisonnables pour protéger les comptes, limiter les accès non autorisés et sécuriser les opérations sensibles.",
      "L'utilisateur reste responsable de la confidentialité de ses identifiants et doit signaler toute utilisation suspecte de son compte.",
    ],
  },
  {
    id: '5',
    icon: Lock,
    color: 'text-[#2D5A27]',
    bg: 'bg-[#2D5A27]/10',
    title: '5. Vos droits',
    content: [
      "Chaque utilisateur peut demander l'accès, la rectification ou la suppression de ses données personnelles en contactant le service client.",
      "Vous pouvez à tout moment exercer vos droits en nous écrivant à contact@wapibei.cd.",
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

export default function PrivacyPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#2D5A27] rounded-full blur-[160px] opacity-[0.05] dark:opacity-[0.08] pointer-events-none" />
        <div className="container mx-auto max-w-4xl px-6 pt-20 pb-14 md:pt-28 md:pb-20 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <Link
                href="/"
                className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] transition-all"
              >
                <ArrowLeft size={18} />
              </Link>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#2D5A27]">
                Confidentialité
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#2D5A27]/10 flex items-center justify-center">
                <Lock className="w-6 h-6 md:w-7 md:h-7 text-[#2D5A27]" strokeWidth={2} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                Politique de confidentialité
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="max-w-2xl text-base font-medium leading-8 text-muted-foreground">
              Comment WapiBei collecte, utilise et protège vos données personnelles. Vos droits et nos engagements en matière de vie privée.
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
          className="mt-12 rounded-2xl border border-[#2D5A27]/20 bg-[#2D5A27]/[0.04] dark:bg-[#2D5A27]/[0.08] p-6 md:p-8 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#2D5A27]/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#2D5A27]" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-black text-foreground mb-2">Questions sur vos données ?</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Exercez vos droits d&apos;accès, de rectification ou de suppression en nous contactant.
          </p>
          <a
            href="mailto:contact@wapibei.cd"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D5A27] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#2D5A27]/90 transition-colors"
          >
            <Mail size={16} strokeWidth={2.5} />
            Contacter le support
          </a>
        </motion.div>
      </section>
    </main>
  );
}

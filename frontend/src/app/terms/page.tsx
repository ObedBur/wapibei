'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ScrollText,
  UserPlus,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Mail,
} from 'lucide-react';

const sections = [
  {
    id: '1',
    icon: UserPlus,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '1. Acceptation des conditions',
    content: [
      "En accédant ou en utilisant la plateforme WapiBei, vous acceptez sans réserve les présentes conditions d'utilisation.",
      "Si vous n'acceptez pas ces conditions, vous devez vous abstenir d'utiliser la plateforme. WapiBei se réserve le droit de modifier ces conditions à tout moment.",
    ],
  },
  {
    id: '2',
    icon: UserPlus,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '2. Inscription et compte',
    content: [
      "L'inscription à la plateforme est gratuite. Chaque utilisateur doit fournir des informations exactes et à jour lors de la création de son compte.",
      "L'utilisateur est responsable de la confidentialité de ses identifiants et de toutes les activités effectuées depuis son compte.",
      "WapiBei se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes conditions.",
    ],
  },
  {
    id: '3',
    icon: ShieldCheck,
    color: 'text-[#2D5A27]',
    bg: 'bg-[#2D5A27]/10',
    title: '3. Règles de conduite',
    content: [
      "Les utilisateurs s'engagent à utiliser la plateforme de manière légale et respectueuse. Il est interdit de publier des contenus frauduleux, offensants, illicites ou trompeurs.",
      "Toute tentative de fraude, de manipulation de prix ou de contrefaçon de produits entraînera la suspension immédiate du compte.",
    ],
  },
  {
    id: '4',
    icon: CreditCard,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '4. Transactions et paiements',
    content: [
      "WapiBei facilite la mise en relation entre acheteurs et vendeurs. Les transactions sont conclues directement entre les parties.",
      "WapiBei n'est pas partie aux contrats de vente et ne garantit pas la qualité, la sécurité ou la légalité des produits proposés par les vendeurs.",
      "Les modalités de paiement et de livraison sont convenues entre l'acheteur et le vendeur.",
    ],
  },
  {
    id: '5',
    icon: AlertTriangle,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '5. Litiges et résolution',
    content: [
      "En cas de litige entre un acheteur et un vendeur, WapiBei encourage les parties à trouver une solution à l'amiable.",
      "WapiBei peut fournir des outils de médiation mais ne garantit pas la résolution des conflits. Les parties restent libres de saisir les juridictions compétentes.",
    ],
  },
  {
    id: '6',
    icon: RefreshCw,
    color: 'text-[#E67E22]',
    bg: 'bg-[#E67E22]/10',
    title: '6. Modification des conditions',
    content: [
      "WapiBei se réserve le droit de modifier les présentes conditions d'utilisation à tout moment. Les utilisateurs seront informés des changements significatives.",
      "La poursuite de l'utilisation de la plateforme après modification constitue l'acceptation des nouvelles conditions.",
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

export default function TermsPage() {
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
                Conditions
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#E67E22]/10 flex items-center justify-center">
                <ScrollText className="w-6 h-6 md:w-7 md:h-7 text-[#E67E22]" strokeWidth={2} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                Conditions d&apos;utilisation
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="max-w-2xl text-base font-medium leading-8 text-muted-foreground">
              Les règles encadrant l&apos;utilisation de la plateforme WapiBei, vos droits et obligations en tant qu&apos;utilisateur.
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
          <h3 className="text-lg font-black text-foreground mb-2">Une question sur les conditions ?</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Contactez notre équipe pour toute question relative aux conditions d&apos;utilisation.
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

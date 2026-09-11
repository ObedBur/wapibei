'use client';

import React from 'react';
import { MessageCircle, Scale, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useT } from '@/i18n/useT';

const journeyIcons = [Search, Scale, MessageCircle];
const journeyAccents = ['text-[#E67E22]', 'text-[#2D5A27]', 'text-[#E67E22]'];

export const MarketplaceJourney = () => {
  const { t } = useT();
  const journey = [
    {
      title: t('home.marketplaceJourney.discoverTitle'),
      description: t('home.marketplaceJourney.discoverDescription'),
    },
    {
      title: t('home.marketplaceJourney.compareTitle'),
      description: t('home.marketplaceJourney.compareDescription'),
    },
    {
      title: t('home.marketplaceJourney.connectTitle'),
      description: t('home.marketplaceJourney.connectDescription'),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 dark:bg-[#0a0a0a] md:py-24">
      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-14"
        >
          <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-[#2D5A27]">
            {t('home.marketplaceJourney.pretitle')}
          </span>
          <h2 className="mb-5 text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-5xl">
            {t('home.marketplaceJourney.title')}{' '}
            <span className="text-[#2D5A27]">{t('home.marketplaceJourney.titleHighlight')}</span>
          </h2>
          <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 md:text-lg">
            {t('home.marketplaceJourney.description')}
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {journey.map((item, index) => {
            const Icon = journeyIcons[index];

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] md:p-7"
              >
                <div className={`mb-5 flex size-11 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.08] ${journeyAccents[index]}`}>
                  <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-black text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

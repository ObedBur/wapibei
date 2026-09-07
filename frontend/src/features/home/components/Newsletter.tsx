'use client';

import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useT } from '@/i18n/useT';

export const Newsletter = () => {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulation
    toast.success(t('home.newsletter.success'));
    setEmail('');
    setLoading(false);
  };

  return (
    <section className="py-16 md:py-20 relative overflow-hidden bg-white dark:bg-black">
      {/* Blob décoratif subtil */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#E67E22]/5 dark:bg-[#E67E22]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#2D5A27]/5 dark:bg-[#2D5A27]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16"
        >
          {/* Text */}
          <div className="text-slate-900 dark:text-white max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#E67E22]/10 border border-[#E67E22]/30 rounded-full px-4 py-2 text-xs font-black tracking-wide text-[#E67E22] dark:text-[#E67E22] mb-5">
              <Sparkles size={14} />
              {t('home.newsletter.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight text-slate-900 dark:text-white">
              {t('home.newsletter.title')}{' '}
              <span className="text-[#E67E22] underline decoration-[#E67E22]/40 underline-offset-4">{t('home.newsletter.titleHighlight')}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              {t('home.newsletter.description')}
            </p>
          </div>

          {/* Form */}
          <div className="w-full md:w-auto flex-1 max-w-md">
            <div className="w-full relative flex flex-col gap-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  disabled
                  placeholder={t('home.newsletter.emailPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-full py-4 pl-6 pr-6 cursor-not-allowed transition-all text-sm"
                />
              </div>
              <p className="text-center md:text-left text-xs text-slate-500 dark:text-slate-400 pl-2">
                {t('home.newsletter.comingSoonMsg')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import useT from '@/i18n/useT';

export default function CheckoutSuccessPage() {
    const { t, language } = useT();
    const router = useRouter();
    const today = new Date().toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' });
    const orderId = "WPB-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    useEffect(() => {
        const timer = setTimeout(() => router.push('/cart'), 1800);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <main className="min-h-screen bg-[#F3F4F9] dark:bg-black pt-32 pb-20 px-4 flex items-center justify-center font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)] text-center max-w-md w-full"
            >
                <div className="relative size-24 mx-auto mb-10">
                    <div className="absolute inset-0 bg-[#E8EFFF] dark:bg-blue-500/10 rounded-full" />
                    <div className="absolute inset-4 bg-[#768FFF] rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(118,143,255,0.3)]">
                        <CheckCircle2 size={32} strokeWidth={3.5} />
                    </div>
                </div>

                <div className="space-y-4 mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white leading-tight">
                        {t('cartSuccess.title')}
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base px-2 leading-relaxed">
                        {t('cartSuccess.message')}
                    </p>
                </div>

                <div className="bg-[#F8F9FB] dark:bg-white/5 rounded-3xl p-6 md:p-8 space-y-4 mb-10 text-left">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">{t('cartSuccess.orderNumber')}</span>
                        <span className="text-black dark:text-white font-bold">{orderId}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">{t('cartSuccess.date')}</span>
                        <span className="text-black dark:text-white font-bold">{today}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">{t('cartSuccess.status')}</span>
                        <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">{t('cartSuccess.statusTransmitted')}</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 italic leading-relaxed">
                            <span className="font-bold text-[#768FFF]">{t('cartSuccess.note')}</span> {t('cartSuccess.noteText')}
                        </p>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}

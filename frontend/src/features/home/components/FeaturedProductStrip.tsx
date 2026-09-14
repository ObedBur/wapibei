'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/features/products/types';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useT } from '@/i18n/useT';

interface FeaturedProductStripProps {
  title: string;
  subtitle: string;
  products: Product[];
  onQuickView: (product: Product) => void;
}

export const FeaturedProductStrip: React.FC<FeaturedProductStripProps> = ({ title, subtitle, products, onQuickView }) => {
  const { t } = useT();
  return (
    <div className="w-full mb-8 bg-transparent">
      {(title || subtitle) && (
        <div className="flex items-end justify-between mb-4">
          <div className="space-y-0.5">
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-none">
              {title.split(' ')[0]} <span className="text-[#E67E22]">{title.split(' ').slice(1).join(' ')}</span>
            </h3>
            {subtitle && <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 group text-slate-400 hover:text-white transition-all duration-300"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">{t('home.productStrip.viewAll')}</span>
          </Link>
        </div>
      )}

      <div>
        {/* Grille RESPONSIVE adaptée : densité max 5 colonnes pour ne pas écraser les cartes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-3.5 md:gap-5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickView={onQuickView}
              className="w-full transform transition hover:-translate-y-1 hover:shadow-xl rounded-[1.75rem]"
            />
          ))}

          {/* Card "Tout voir" avec la même structure que ProductCard (image + body) */}
          <Link
            href="/products"
            className="w-full flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 cursor-pointer hover:border-[#E67E22]/40 dark:hover:border-[#E67E22]/40 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-500 group lg:hidden"
          >
            <div className="relative aspect-[4/5] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/[0.02] border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                <svg className="size-8 group-hover:text-[#E67E22] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <span className="text-[11px] font-black uppercase tracking-tight text-slate-500 dark:text-slate-400 group-hover:text-[#E67E22] transition-colors px-2 text-center leading-tight">
                  {t('home.productStrip.viewAllMobile')}
                </span>
              </div>
            </div>
            <div className="shrink-0 px-4 pb-4 pt-3 bg-white dark:bg-zinc-900">
              <div className="w-full h-9 md:h-10 rounded-[0.85rem] md:rounded-[1rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:border-[#E67E22]/40 group-hover:text-[#E67E22] transition-all">
                <svg className="size-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                  <path d="m1 10 22-6"/>
                </svg>
                <span className="text-[10.5px] md:text-[11.5px] font-black tracking-wide">Explorer</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

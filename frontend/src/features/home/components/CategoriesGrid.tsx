"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { Category } from '@/features/products/types';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { translateCategoryName } from '@/i18n/categoryNames';

export const CategoriesGrid: React.FC<{ categories: Category[], isLoading?: boolean }> = ({ categories, isLoading }) => {
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'popular'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useT();

  // Filtrage des catégories (Simulé pour 'popular')
  const displayedCategories = React.useMemo(() => {
    if (activeFilter === 'all') return categories;
    return categories
      .filter(c => (c.productCount || 0) > 0)
      .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
      .slice(0, 10);
  }, [categories, activeFilter]);

  // Fonction de défilement pour les contrôles Desktop
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className="py-8 px-4 bg-[#F8F9FA] dark:bg-transparent overflow-hidden">
        <div className="container mx-auto">

          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
            <div className="space-y-2">
              <div className="h-7 w-52 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse" />
              <div className="h-4 w-72 rounded-lg bg-slate-100 dark:bg-white/5 animate-pulse" />
            </div>
            <div className="h-10 w-[200px] rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
          </div>

          {/* Cards skeleton row — show 2.5 cards on mobile, more on desktop */}
          <div className="flex gap-4 overflow-hidden pb-6 pt-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[180px] md:w-[200px] bg-white dark:bg-white/[0.04] rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-white/[0.06] flex items-center justify-between"
                style={{ opacity: 1 - i * 0.1 }}
              >
                <div className="flex flex-col gap-2 flex-1 pr-3">
                  <div className="h-4 w-28 rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse" />
                  <div className="h-3 w-16 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse" />
                </div>
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse shrink-0" />
              </div>
            ))}
          </div>

        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null; // On cache complètement la section si elle est vide
  }

  return (
    <section className="py-8 bg-[#F8F9FA] dark:bg-transparent overflow-hidden">
      <div className="container mx-auto max-w-[1440px] px-6 lg:px-10 relative">

        {/* HEADER : Titre, Boutons et Filtres */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {t('home.categories.exploreBy')} <span className="text-[#E67E22]">{t('home.categories.sector')}</span>
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-medium">
              {t('home.categories.description')}
            </p>
          </div>

          <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 w-full max-w-[280px] md:w-auto h-fit shadow-inner">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md ring-1 ring-slate-100 dark:ring-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              {t('home.categories.all')}
            </button>
            <button
              onClick={() => setActiveFilter('popular')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${activeFilter === 'popular'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md ring-1 ring-slate-100 dark:ring-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              {t('home.categories.popular')}
            </button>
          </div>
        </div>

        {/* CARROUSEL HORIZONTAL FLUIDE */}
        <div className="relative group flex items-center">
          
          {/* Bouton Gauche */}
          <button 
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl items-center justify-center text-slate-500 hover:text-[#E67E22] hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label={t('home.categories.scrollLeft')}
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex flex-nowrap overflow-x-auto scrollbar-hide scroll-smooth gap-4 pb-6 pt-2 snap-x snap-mandatory w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayedCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group shrink-0 w-[180px] md:w-[200px] bg-white dark:bg-slate-900/40 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between snap-start cursor-pointer"
              >
                <div className="flex flex-col min-w-0 pr-3">
                  <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white truncate leading-tight group-hover:text-[#E67E22] transition-colors">
                    {translateCategoryName(cat.name, t)}
                  </h3>
                  <span className="text-xs font-medium text-slate-400 mt-1">
                    {t('home.categories.count').replace('{count}', String(cat.productCount || 0))}
                  </span>
                </div>
                
                <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-[#E67E22] group-hover:translate-x-1 transition-all shrink-0" strokeWidth={2} />
              </Link>
            ))}
          </div>
          
          {/* Bouton Droite */}
          <button 
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl items-center justify-center text-slate-500 hover:text-[#E67E22] hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label={t('home.categories.scrollRight')}
          >
            <ChevronRight size={24} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </section>
  );
};
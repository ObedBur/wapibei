'use client';

import React, { useState } from 'react';
import { Category, ProductFilters } from '../types';
import { useT } from '@/i18n/useT';

interface SidebarProps {
  categories: Category[];
  filters: ProductFilters;
  onUpdate: (updates: Partial<ProductFilters>) => void;
}

export const ProductFilterSidebar: React.FC<SidebarProps> = ({ categories, filters, onUpdate }) => {
  const { t } = useT();
  const [minPrice, setMinPrice] = useState<string>(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState<string>(filters.maxPrice || '');
  const [searchQuery, setSearchQuery] = useState<string>(filters.search || '');

  const handleMinPriceCommit = () => {
    onUpdate({ minPrice });
  };

  const handleMaxPriceCommit = () => {
    onUpdate({ maxPrice });
  };

  const handleCategoryClick = (categoryId: string | null) => {
    if (filters.categoryId === categoryId) {
      onUpdate({ categoryId: null, page: 1 });
    } else {
      onUpdate({ categoryId, page: 1 });
    }
  };

  return (
    <aside className="hidden md:block w-[240px] lg:w-[280px] shrink-0 sticky top-24 self-start">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
        <h2 className="text-[17px] font-extrabold text-slate-800 dark:text-white mb-6">{t('products.sidebar.filters')}</h2>
        
        {/* Recherche */}
        <div className="mb-7">
          <h3 className="text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
            {t('products.sidebar.search')}
          </h3>
          <div className="flex border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden focus-within:border-[#E67E22] focus-within:ring-1 focus-within:ring-[#E67E22] transition-all bg-slate-50 dark:bg-white/5">
              <div className="px-2.5 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400">search</span>
              </div>
              <input
                type="text"
                placeholder={t('products.sidebar.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => onUpdate({ search: searchQuery || null })}
                onKeyDown={(e) => e.key === 'Enter' && onUpdate({ search: searchQuery || null })}
                aria-label={t('products.sidebar.searchPlaceholder')}
                className="w-full pr-2 py-2.5 text-sm outline-none text-slate-700 dark:text-white bg-transparent"
              />
            </div>
        </div>

        {/* Catégories */}
        <div className="mb-7">
          <h3 className="text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
            {t('products.sidebar.categories')}
          </h3>
          <div className="space-y-1.5">
            {/* Option "Toutes" */}
            <button
              onClick={() => handleCategoryClick(null)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                !filters.categoryId
                  ? 'bg-[#E67E22] text-white shadow-md shadow-[#E67E22]/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <span>{t('products.sidebar.allCategories')}</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(String(cat.id))}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filters.categoryId === String(cat.id)
                    ? 'bg-[#E67E22] text-white shadow-md shadow-[#E67E22]/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <span>{t(`category.${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`)}</span>
                {cat.productCount !== undefined && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                      filters.categoryId === String(cat.id)
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {cat.productCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        <div className="h-px bg-slate-100 dark:bg-white/5 mb-7" />

        {/* Budget / Prix */}
        <div>
          <h3 className="text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
            {t('products.sidebar.budget')}
          </h3>
          <div className="flex gap-2 items-center">
            <div className="flex-1 flex border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-[#E67E22] focus-within:ring-1 focus-within:ring-[#E67E22] transition-all bg-slate-50 dark:bg-white/5">
              <div className="px-2.5 flex items-center justify-center">
                <span className="text-slate-400 font-bold text-sm">{t('products.sidebar.min')}</span>
              </div>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={handleMinPriceCommit}
                onKeyDown={(e) => e.key === 'Enter' && handleMinPriceCommit()}
                aria-label={t('products.sidebar.min')}
                className="w-full pr-2 py-2.5 text-sm outline-none text-slate-700 dark:text-white bg-transparent border-l border-slate-200 dark:border-white/10"
                min="0"
              />
            </div>
            <span className="text-slate-300 font-bold">—</span>
            <div className="flex-1 flex border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-[#E67E22] focus-within:ring-1 focus-within:ring-[#E67E22] transition-all bg-slate-50 dark:bg-white/5">
              <div className="px-2.5 flex items-center justify-center">
                <span className="text-slate-400 font-bold text-sm">{t('products.sidebar.max')}</span>
              </div>
              <input
                type="number"
                placeholder="∞"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={handleMaxPriceCommit}
                onKeyDown={(e) => e.key === 'Enter' && handleMaxPriceCommit()}
                aria-label={t('products.sidebar.max')}
                className="w-full pr-2 py-2.5 text-sm outline-none text-slate-700 dark:text-white bg-transparent border-l border-slate-200 dark:border-white/10"
                min="0"
              />
            </div>
          </div>

          {/* Bouton reset si filtre actif */}
          {(filters.minPrice || filters.maxPrice || filters.categoryId || filters.search) && (
            <button
              onClick={() => {
                setMinPrice('');
                setMaxPrice('');
                setSearchQuery('');
                onUpdate({ minPrice: '', maxPrice: '', categoryId: null, search: null, page: 1 });
              }}
              className="mt-4 w-full text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[#E67E22] transition-colors duration-200 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              {t('products.sidebar.reset')}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

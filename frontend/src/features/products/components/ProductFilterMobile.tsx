'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Category, ProductFilters } from '../types';
import { motion } from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  filters: ProductFilters;
  onUpdate: (updates: Partial<ProductFilters>) => void;
}

export const ProductFilterMobile: React.FC<MobileDrawerProps> = ({ isOpen, onClose, categories, filters, onUpdate }) => {
  const [minPrice, setMinPrice] = useState<string>(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState<string>(filters.maxPrice || '');
  const [searchQuery, setSearchQuery] = useState<string>(filters.search || '');

  // Synchronise en cas de changement extérieur
  useEffect(() => {
    setSearchQuery(filters.search || '');
    setMinPrice(filters.minPrice || '');
    setMaxPrice(filters.maxPrice || '');
  }, [filters.search, filters.minPrice, filters.maxPrice]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onUpdate({ search: value || null, page: 1 });
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value); // Filtre instantané pour la recherche
  };

  const handleCategoryClick = (categoryId: string | null) => {
    onUpdate({ categoryId, page: 1, search: searchQuery || null });
    onClose(); // Sur mobile, choisir une catégorie ferme souvent le tiroir
  };

  const handleApply = () => {
    onUpdate({ minPrice, maxPrice, search: searchQuery || null });
    onClose();
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    onUpdate({ minPrice: '', maxPrice: '', categoryId: null, search: null, page: 1 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex justify-end md:hidden">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer content */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-[85vw] max-w-[340px] bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-[19px] font-extrabold text-slate-800 dark:text-white">Filtres</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-slate-50 dark:bg-white/5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 h-9 w-9"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-8">

          {/* Recherche */}
          <div>
            <h3 className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Rechercher
            </h3>
            <div className="flex border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden focus-within:border-[#E67E22] focus-within:ring-1 focus-within:ring-[#E67E22] transition-all bg-slate-50 dark:bg-white/5">
              <div className="px-4 py-3 flex items-center justify-center border-r border-slate-200 dark:border-white/10">
                <span className="material-symbols-outlined text-slate-400">search</span>
              </div>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Rechercher un produit"
                className="flex-1 w-full px-4 py-3 text-[15px] outline-none text-slate-700 dark:text-white bg-transparent"
              />
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Catégories
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                  !filters.categoryId
                    ? 'bg-[#E67E22] text-white shadow-md shadow-[#E67E22]/20'
                    : 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <span>Toutes les catégories</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(String(cat.id))}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                    filters.categoryId === String(cat.id)
                      ? 'bg-[#E67E22] text-white shadow-md shadow-[#E67E22]/20'
                      : 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.productCount !== undefined && (
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                        filters.categoryId === String(cat.id)
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500'
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
          <div className="h-px bg-slate-100 dark:bg-white/5" />

          {/* Budget */}
          <div>
            <h3 className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Budget ($)
            </h3>
            <div className="space-y-3">
              {/* Prix Min */}
              <div className="flex border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-[#E67E22] focus-within:ring-1 focus-within:ring-[#E67E22] transition-all bg-slate-50 dark:bg-white/5">
                <div className="px-4 py-3 flex items-center justify-center border-r border-slate-200 dark:border-white/10">
                  <span className="text-slate-400 font-bold text-sm whitespace-nowrap">Prix Min</span>
                </div>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  aria-label="Prix minimum"
                  className="flex-1 w-full px-4 py-3 text-[15px] outline-none text-slate-700 dark:text-white bg-transparent"
                  min="0"
                />
              </div>

              {/* Prix Max */}
              <div className="flex border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-[#E67E22] focus-within:ring-1 focus-within:ring-[#E67E22] transition-all bg-slate-50 dark:bg-white/5">
                <div className="px-4 py-3 flex items-center justify-center border-r border-slate-200 dark:border-white/10">
                  <span className="text-slate-400 font-bold text-sm whitespace-nowrap">Prix Max</span>
                </div>
                <input
                  type="number"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  aria-label="Prix maximum"
                  className="flex-1 w-full px-4 py-3 text-[15px] outline-none text-slate-700 dark:text-white bg-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-[2] py-3 text-[13px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-xl hover:text-[#E67E22] hover:border-[#E67E22] transition-all duration-200"
          >
            Réinitialiser
          </button>
          <Button
            onClick={handleApply}
            className="flex-[2] py-3 text-[13px] uppercase tracking-widest bg-[#E67E22] hover:bg-[#d6721b] text-white rounded-xl font-black shadow-lg shadow-[#E67E22]/20 transition-transform active:scale-95"
          >
            Appliquer
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

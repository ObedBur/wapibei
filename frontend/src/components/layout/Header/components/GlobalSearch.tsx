'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  X, 
  Store, 
  Clock, 
  TrendingUp, 
  ChevronDown, 
  CheckCircle,
  Package
} from 'lucide-react';
import { useSearch, SearchSector } from '@/hooks/useSearch';
import { useT } from '@/i18n/useT';
import { getCategories } from '@/features/products/services/product.service';
import { Category } from '@/types/category.types';
import { translateCategoryName } from '@/i18n/categoryNames';

export const GlobalSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useT();
  const searchRef = useRef<HTMLDivElement>(null);
  const {
    query,
    setQuery,
    sector,
    setSector,
    results,
    loading,
    isFocused,
    setIsFocused,
    recentSearches,
    addRecentSearch,
    clearRecentSearches
  } = useSearch();

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isSectorOpen, setIsSectorOpen] = React.useState(false);
  const [popularCategories, setPopularCategories] = React.useState<Category[]>([]);

  // Catégories réelles pour le raccourci "Catégories populaires"
  useEffect(() => {
    let mounted = true;
    getCategories().then((res) => {
      if (mounted && res.success) {
        setPopularCategories(res.data.slice(0, 4));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const sectorOptions: Record<SearchSector, string> = {
    ALL: t('search.all'),
    PRODUCTS: t('search.products'),
    SHOPS: t('search.shops')
  };

  // Handle click outside to close dropdown and collapse search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setIsExpanded(false);
        setIsSectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    addRecentSearch(query);
    setIsFocused(false);
    
    if (sector === 'SHOPS') {
      router.push(`/sellers?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/compare?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
    setIsFocused(false);
    setIsExpanded(false);
    
    if (sector === 'SHOPS') {
      router.push(`/sellers?q=${encodeURIComponent(term)}`);
    } else {
      router.push(`/compare?q=${encodeURIComponent(term)}`);
    }
  };

  const showDropdown = isFocused;

  return (
    <div 
      className={`relative z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isExpanded ? 'w-[300px] xl:w-[400px]' : 'w-10'
      }`} 
      ref={searchRef}
    >
      {/* ICÔNE DE RECHERCHE (quand réduit) */}
      <button
        type="button"
        onClick={() => {
          setIsExpanded(true);
          setTimeout(() => document.getElementById('global-search-input')?.focus(), 100);
        }}
        className={`absolute right-0 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-[#E67E22] hover:bg-[#E67E22]/10 dark:hover:bg-[#E67E22]/20 rounded-full transition-all duration-300 z-10 ${
          isExpanded ? 'opacity-0 invisible scale-50' : 'opacity-100 visible scale-100'
        }`}
      >
        <Search className="w-5 h-5" />
      </button>

      {/* BARRE DE RECHERCHE COMPLÈTE (quand étendu) */}
      <div 
        className={`w-full transition-all duration-500 ${
          isExpanded ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <form 
          onSubmit={handleSubmit}
          className={`relative flex items-center bg-white dark:bg-[#1a1a1a] rounded-full border transition-all duration-300 ${
            isFocused 
              ? 'border-[#E67E22] shadow-[0_0_0_4px_rgba(230,126,34,0.1)]' 
              : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
          }`}
        >
          {/* Sélecteur de Secteur (Custom Dropdown) */}
          <div className="relative h-full shrink-0 border-r border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsSectorOpen(!isSectorOpen)}
              className="h-10 sm:h-12 flex items-center justify-between gap-2 bg-transparent pl-4 pr-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#2D5A27] dark:text-emerald-400 outline-none min-w-[90px] sm:min-w-[110px]"
            >
              <span>{sectorOptions[sector as SearchSector]}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isSectorOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isSectorOpen && (
              <>
                {/* Overlay invisible pour fermer au clic dehors */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsSectorOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-36 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  {(Object.entries(sectorOptions) as [SearchSector, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSector(key as SearchSector);
                        setIsSectorOpen(false);
                        // Focus the input right after selection
                        setTimeout(() => document.getElementById('global-search-input')?.focus(), 50);
                      }}
                      className={`w-full text-left px-4 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${
                        sector === key 
                          ? 'bg-[#E67E22]/10 text-[#E67E22]' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Input */}
          <div className="relative flex-1 flex items-center h-10 sm:h-12 min-w-0">
            <Search className="absolute left-3 w-4 h-4 text-gray-400 shrink-0" />
            <input
              id="global-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                setIsSectorOpen(false);
              }}
              placeholder={t('search.placeholder')}
              className="w-full h-full bg-transparent pl-10 pr-10 text-sm font-medium text-gray-800 dark:text-gray-200 outline-none placeholder:text-gray-400 truncate"
            />
            
            {/* Loader ou Bouton Clear */}
            <div className="absolute right-3 flex items-center">
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#E67E22] rounded-full animate-spin" />
              ) : query.length > 0 ? (
                <button 
                  type="button" 
                  onClick={() => setQuery('')}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-white/10 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : null}
            </div>
          </div>

          <button 
            type="submit"
            className="h-8 sm:h-10 px-4 sm:px-6 mr-1 flex items-center justify-center bg-[#E67E22] text-white rounded-full shadow-lg shadow-[#E67E22]/20 hover:scale-105 active:scale-95 transition-all shrink-0"
            aria-label={t('search.placeholder')}
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>

      {/* DROPDOWN PANEL */}
      {showDropdown && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* 1. ÉTAT FOCUS (Input vide ou court) */}
          {query.trim().length < 2 && (
            <div className="p-4 sm:p-6 space-y-6">
              
              {/* Recherches récentes */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> {t('search.recentSearches')}
                    </h3>
                    <button 
                      onClick={clearRecentSearches}
                      className="text-[10px] font-bold text-gray-400 hover:text-[#E67E22] transition-colors"
                    >
                      {t('search.clear')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(term)}
                        className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#E67E22] hover:text-[#E67E22] transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Catégories Populaires */}
              {popularCategories.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-3">
                    <TrendingUp className="w-3.5 h-3.5" /> {t('search.popularCategories')}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {popularCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.id}`}
                        onClick={() => {
                          setIsFocused(false);
                          setIsExpanded(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-colors group"
                      >
                        <Search className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#E67E22]" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                          {translateCategoryName(cat.name, t)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. ÉTAT TYPING (Résultats de recherche) */}
          {query.trim().length >= 2 && (
            <div className="flex flex-col sm:flex-row max-h-[60vh] sm:max-h-[400px]">
              
              {/* Colonne de Gauche : Suggestions & Boutiques */}
              <div className="w-full sm:w-5/12 sm:border-r border-gray-100 dark:border-white/5 p-4 sm:p-5 space-y-6 overflow-y-auto custom-scrollbar relative">
                
                {loading && results.products.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-[#121212]/80 z-10">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-[#E67E22] rounded-full animate-spin" />
                  </div>
                )}
                
                {/* Suggestions */}
                {(sector === 'ALL' || sector === 'PRODUCTS') && results.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                      {t('search.suggestions')}
                    </h3>
                    <div className="space-y-1">
                      {results.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(sug)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-colors group overflow-hidden"
                        >
                          <Search className="w-3.5 h-3.5 shrink-0 text-gray-400 group-hover:text-[#E67E22]" />
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-[#E67E22] truncate block">
                            {sug}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Boutiques Correspondantes */}
                {(sector === 'ALL' || sector === 'SHOPS') && results.shops.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2D5A27] dark:text-emerald-400 mb-3 flex items-center gap-2">
                      <Store className="w-3.5 h-3.5" /> {t('search.shops')}
                    </h3>
                    <div className="space-y-2">
                      {results.shops.map(shop => (
                        <Link
                          key={shop.id}
                          href={`/sellers/${shop.id}`}
                          onClick={() => setIsFocused(false)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                        >
                          <div className="relative w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 group-hover:border-[#E67E22]">
                            <Image
                              src={shop.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.boutiqueName)}`}
                              alt={shop.boutiqueName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                                {shop.boutiqueName}
                              </span>
                              {shop.isVerified && <CheckCircle className="w-3 h-3 text-blue-500 shrink-0" fill="currentColor" />}
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">{t('search.score')} {Math.round(shop.trustScore / 20)}/5</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne de Droite : Produits Phares */}
              {(sector === 'ALL' || sector === 'PRODUCTS') && (
                <div className="w-full sm:w-7/12 bg-gray-50/50 dark:bg-white/[0.02] p-4 sm:p-5 overflow-y-auto custom-scrollbar border-t sm:border-t-0 border-gray-100 dark:border-white/5 relative">
                  {loading && results.products.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-[#1a1a1a]/80 z-10">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-[#E67E22] rounded-full animate-spin" />
                    </div>
                  )}
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#E67E22] mb-4 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" /> {t('search.featuredProducts')}
                  </h3>
                  
                  {results.products.length > 0 ? (
                    <div className="space-y-3">
                      {results.products.map(product => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={() => setIsFocused(false)}
                          className="flex items-center gap-4 bg-white dark:bg-[#1a1a1a] p-2 sm:p-3 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-[#E67E22] hover:shadow-lg transition-all group"
                        >
                          <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                            <Image
                              src={product.images?.[0] || product.image || '/placeholder-product.png'}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug group-hover:text-[#E67E22] transition-colors">
                              {product.name}
                            </h4>
                            <span className="text-sm font-black text-[#2D5A27] dark:text-emerald-400 tracking-tighter mt-0.5">
                              {product.price} $
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-8 opacity-50">
                      <Search className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {t('search.noProducts')}
                      </p>
                    </div>
                  )}
                  
                  {results.products.length > 0 && (
                    <button 
                      onClick={handleSubmit}
                      className="w-full mt-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#E67E22] hover:bg-[#E67E22]/10 rounded-xl transition-colors"
                    >
                      {t('search.viewAllResults')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

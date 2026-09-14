'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Filter,
  Loader2,
  TrendingUp,
  Search,
  Scale,
  MessageCircle,
  X,
  ArrowRight,
  CheckCircle,
  Package,
  ArrowLeft,
} from 'lucide-react';
import { compareProducts, CompareProduct } from '@/features/compare/compare.service';
import { getBestSellers } from '@/features/products/services/product.service';
import { Product } from '@/features/products/types';
import { ProductCard } from '@/features/products/components/ProductCard';
import { ProductQuickView } from '@/features/products/components/ProductQuickView';
import { useCurrency } from '@/hooks/useCurrency';
import useT from '@/i18n/useT';


// ─────────────────────────────────────────────
// EMPTY STATE (ACCUEIL COMPARATEUR)
// ─────────────────────────────────────────────
function EmptyCompareState() {
  const { t } = useT();
  const [trends, setTrends] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrends() {
      try {
        const res = await getBestSellers(6);
        if (res.success && res.data) {
          setTrends(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadTrends();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-white/5 p-8 md:p-12 lg:p-16 text-center relative overflow-hidden mb-8 shadow-sm">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2D5A27 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-3">
            <Scale className="w-10 h-10 text-[#2D5A27] dark:text-emerald-400 -rotate-3" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#2D5A27] dark:text-white tracking-tight mb-4 uppercase">
            {t('compare.heroTitle')} <span className="text-[#E67E22]">{t('compare.heroHighlight')}</span>
          </h1>
          <p className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
            {t('compare.heroDescription')}
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center mb-4 text-[#2D5A27]">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-[#2D5A27] dark:text-emerald-400 mb-2">{t('compare.step1Title')}</h3>
          <p className="text-[10px] font-bold text-gray-500 leading-relaxed">{t('compare.step1Desc')}</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:-translate-y-1 transition-transform delay-75">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4 text-[#2D5A27] dark:text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-[#2D5A27] dark:text-emerald-400 mb-2">{t('compare.step2Title')}</h3>
          <p className="text-[10px] font-bold text-gray-500 leading-relaxed">{t('compare.step2Desc')}</p>
        </div>
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:-translate-y-1 transition-transform delay-150">
          <div className="w-12 h-12 bg-orange-50 dark:bg-[#E67E22]/10 rounded-xl flex items-center justify-center mb-4 text-[#E67E22]">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-[#2D5A27] dark:text-emerald-400 mb-2">{t('compare.step3Title')}</h3>
          <p className="text-[10px] font-bold text-gray-500 leading-relaxed">{t('compare.step3Desc')}</p>
        </div>
      </div>

      {/* Trending / Best Sellers */}
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-[#E67E22]" />
          <h3 className="text-sm font-black uppercase tracking-widest text-[#2D5A27] dark:text-white">{t('compare.trendsTitle')}</h3>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : trends.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {trends.map(product => (
              <Link 
                key={product.id}
                href={`/compare?q=${encodeURIComponent(product.name)}`}
                className="group bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-[#E67E22] hover:shadow-lg transition-all"
              >
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 group-hover:text-[#2D5A27] dark:group-hover:text-emerald-400 transition-colors">
                  {product.name}
                </p>
                <div className="flex justify-end">
                  <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#E67E22] group-hover:text-white text-gray-400 transition-colors">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs font-bold text-gray-400">{t('compare.noTrends')}</p>
        )}
      </div>
    </div>
  );
}

function renderCompareFilterOptions({
  t,
  clearFilters,
  isVerifiedOnly,
  setIsVerifiedOnly,
  availability,
  setAvailability,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  currencySymbol,
  availableCities,
  selectedCities,
  toggleCity,
  availableShops,
  selectedShops,
  toggleShop,
}: {
  t: (key: string) => string;
  clearFilters: () => void;
  isVerifiedOnly: boolean;
  setIsVerifiedOnly: React.Dispatch<React.SetStateAction<boolean>>;
  availability: 'ALL' | 'IN_STOCK';
  setAvailability: React.Dispatch<React.SetStateAction<'ALL' | 'IN_STOCK'>>;
  minPrice: string;
  setMinPrice: React.Dispatch<React.SetStateAction<string>>;
  maxPrice: string;
  setMaxPrice: React.Dispatch<React.SetStateAction<string>>;
  currencySymbol: string;
  availableCities: string[];
  selectedCities: string[];
  toggleCity: (city: string) => void;
  availableShops: string[];
  selectedShops: string[];
  toggleShop: (shop: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#2D5A27] dark:text-emerald-400">{t('compare.filtersTitle')}</h3>
        <button onClick={clearFilters} className="text-[10px] font-bold text-gray-400 hover:text-[#E67E22] transition-colors">
          {t('compare.clearAll')}
        </button>
      </div>

      <div
        className="flex items-center justify-between group cursor-pointer"
        onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
      >
        <div>
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('compare.verifiedSellers')}</h4>
          <p className="text-[9px] font-medium text-gray-400">{t('compare.verifiedOnly')}</p>
        </div>
        <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${isVerifiedOnly ? 'bg-[#E67E22]' : 'bg-gray-200 dark:bg-white/10'}`}>
          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isVerifiedOnly ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t('compare.availability')}</h4>
        <div className="flex flex-col gap-2.5">
          <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setAvailability('ALL')}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${availability === 'ALL' ? 'border-[#E67E22]' : 'border-gray-300 dark:border-white/20'}`}>
              {availability === 'ALL' && <div className="w-2 h-2 rounded-full bg-[#E67E22]" />}
            </div>
            <span className={`text-xs font-bold transition-colors ${availability === 'ALL' ? 'text-gray-900 dark:text-white' : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>{t('compare.allItems')}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setAvailability('IN_STOCK')}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${availability === 'IN_STOCK' ? 'border-[#E67E22]' : 'border-gray-300 dark:border-white/20'}`}>
              {availability === 'IN_STOCK' && <div className="w-2 h-2 rounded-full bg-[#E67E22]" />}
            </div>
            <span className={`text-xs font-bold transition-colors ${availability === 'IN_STOCK' ? 'text-gray-900 dark:text-white' : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>{t('compare.inStockOnly')}</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t('compare.price')}</h4>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-black">{currencySymbol}</span>
            <input
              type="number"
              placeholder={t('compare.minPlaceholder')}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold outline-none focus:bg-white focus:border-[#E67E22] focus:ring-2 focus:ring-[#E67E22]/20 transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="w-2 h-px bg-gray-300 dark:bg-white/10 shrink-0" />
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-black">{currencySymbol}</span>
            <input
              type="number"
              placeholder={t('compare.maxPlaceholder')}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold outline-none focus:bg-white focus:border-[#E67E22] focus:ring-2 focus:ring-[#E67E22]/20 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {availableCities.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t('compare.cities')}</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
            {availableCities.map(city => (
              <label
                key={city}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => toggleCity(city)}
              >
                <div className={`relative flex items-center justify-center w-4 h-4 rounded border ${selectedCities.includes(city) ? 'bg-[#E67E22] border-[#E67E22]' : 'border-gray-300 dark:border-white/20 group-hover:border-[#E67E22]'} transition-colors`}>
                  {selectedCities.includes(city) && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 select-none truncate">{city}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {availableShops.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t('compare.shops')}</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
            {availableShops.map(shop => (
              <label
                key={shop}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => toggleShop(shop)}
              >
                <div className={`relative flex items-center justify-center w-4 h-4 rounded border ${selectedShops.includes(shop) ? 'bg-[#E67E22] border-[#E67E22]' : 'border-gray-300 dark:border-white/20 group-hover:border-[#E67E22]'} transition-colors`}>
                  {selectedShops.includes(shop) && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 select-none truncate">{shop}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────
function CompareContent() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const latestRequestRef = useRef(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filtres & Tri
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'ALL' | 'IN_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState('price_asc');

  useEffect(() => {
    const controller = new AbortController();
    const normalizedQuery = query.trim();
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    const runCompare = async () => {
      // Defer state updates so the effect only schedules work.
      await Promise.resolve();

      if (controller.signal.aborted) {
        return;
      }

      if (normalizedQuery.length < 2) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await compareProducts(normalizedQuery, controller.signal);
        if (res.success && requestId === latestRequestRef.current) {
          setProducts(res.products);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Erreur recherche comparaison:', error);
        }
      } finally {
        if (requestId === latestRequestRef.current) {
          setLoading(false);
        }
      }
    };

    void runCompare();
    return () => controller.abort();
  }, [query]);

  // 2. Extraire les options de filtres depuis les données
  const availableCities = useMemo(() => {
    const cities = products.map(p => p.user.city || p.city).filter(Boolean) as string[];
    return [...new Set(cities)];
  }, [products]);

  const availableShops = useMemo(() => {
    const shops = products.map(p => p.user.boutiqueName || p.user.fullName).filter(Boolean);
    return [...new Set(shops)];
  }, [products]);

  // 3. Convert CompareProduct to Product type
  const convertToProduct = (cp: CompareProduct): Product => ({
    id: cp.id,
    name: cp.name,
    description: cp.description || '',
    location: cp.location || '',
    city: cp.city,
    country: cp.country,
    price: cp.price,
    displayPrice: cp.displayPrice || undefined,
    categoryId: String(cp.category?.id) || '',
    image: cp.images?.[0] || cp.image || '/images/placeholder.png',
    images: cp.images,
    updatedAt: new Date().toISOString(),
    availability: cp.availability as 'IN_STOCK' | 'LIMITED_STOCK' | 'OUT_OF_STOCK',
    stockQuantity: cp.stockQuantity,
    unit: cp.unit || undefined,
    user: {
      id: cp.user.id,
      fullName: cp.user.fullName,
      boutiqueName: cp.user.boutiqueName || undefined,
      isVerified: cp.user.isVerified,
      trustScore: cp.user.trustScore,
      phone: cp.user.phone,
      avatarUrl: cp.user.avatarUrl || undefined,
    },
  });

  // 4. Appliquer Filtres et Tri
  const filteredAndConverted = useMemo(() => {
    let result = [...products];

    if (isVerifiedOnly) {
      result = result.filter(p => p.user.isVerified);
    }

    if (availability === 'IN_STOCK') {
      result = result.filter(p =>
        (p.availability === 'IN_STOCK' || p.availability === 'LIMITED_STOCK') &&
        (p.stockQuantity === undefined || p.stockQuantity > 0)
      );
    }
    
    if (minPrice) {
      result = result.filter(p => p.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      result = result.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    if (selectedCities.length > 0) {
      result = result.filter(p => selectedCities.includes(p.user.city || p.city));
    }
    
    if (selectedShops.length > 0) {
      result = result.filter(p => selectedShops.includes(p.user.boutiqueName || p.user.fullName));
    }

    // Dédup : une seule ligne par vendeur + nom de produit (le moins cher est gardé)
    result = Array.from(
      new Map(
        [...result].sort((a, b) => a.price - b.price).map((p) => [
          `${p.user.id}::${p.name.trim().toLowerCase()}`,
          p,
        ])
      ).values()
    );

    const sorted = result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.user.trustScore - a.user.trustScore;
      return 0;
    });

    return sorted.map(convertToProduct);
  }, [products, isVerifiedOnly, minPrice, maxPrice, selectedCities, selectedShops, sortBy, availability]);

  const filteredPrices = filteredAndConverted.map((p) => p.price);
  const filteredMin = filteredPrices.length > 0 ? Math.min(...filteredPrices) : 0;

  const { formatPrice, formatPriceParts } = useCurrency();

  // Statistiques recalculées côté client sur la liste affichée (filtres + tri appliqués)
  const localStats = useMemo(() => {
    if (filteredAndConverted.length === 0) return null;
    const prices = filteredAndConverted.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return { count: prices.length, minPrice: min, avgPrice: avg, maxPrice: max };
  }, [filteredAndConverted]);

  // Toggle helpers
  const toggleCity = (city: string) => {
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };
  
  const toggleShop = (shop: string) => {
    setSelectedShops(prev => prev.includes(shop) ? prev.filter(s => s !== shop) : [...prev, shop]);
  };

  const clearFilters = () => {
    setIsVerifiedOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSelectedCities([]);
    setSelectedShops([]);
    setAvailability('ALL');
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const normalizedQuery = String(formData.get('compare-query') ?? '').trim();

    if (normalizedQuery.length < 2) {
      router.push('/compare');
      return;
    }

    router.push(`/compare?q=${encodeURIComponent(normalizedQuery)}`);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-black pt-20 sm:pt-24 pb-20 sm:pb-24">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/products"
            className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-[#E67E22] hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-black text-deep-blue dark:text-white tracking-tight">
            {t('compare.heroTitle')}
          </h1>
        </div>
        <form
          onSubmit={handleSearchSubmit}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-white/5 dark:bg-[#1a1a1a]"
        >
          <Search className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            name="compare-query"
            type="text"
            defaultValue={query}
            placeholder={t('compare.searchPlaceholder')}
            className="w-full bg-transparent text-sm font-bold text-[#2D5A27] outline-none placeholder:text-gray-400 dark:text-white"
          />
          <button
            type="submit"
            className="hidden sm:inline-flex rounded-xl bg-[#E67E22] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#d67118]"
          >
            {t('compare.searchButton')}
          </button>
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#2D5A27] lg:hidden dark:border-white/10 dark:text-white"
          >
            <Filter className="h-4 w-4" />
            {t('compare.mobileFilters')}
          </button>
        </form>
        
        {/* En-tête de page simple */}
        {query.trim().length >= 2 && !loading && (
          <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#2D5A27] dark:text-white uppercase tracking-tight">
                {t('compare.comparisonTitle')} <span className="text-[#E67E22]">&ldquo;{query}&rdquo;</span>
              </h1>
              <p className="text-xs font-bold text-gray-400 mt-1">
                {filteredAndConverted.length} {filteredAndConverted.length !== 1 ? t('compare.offersFoundPlural') : t('compare.offersFoundSingular')}
              </p>
            </div>
            
            {localStats && localStats.count > 0 && (
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Prix Min</span>
                  <span className="text-sm font-bold text-emerald-500">{formatPrice(localStats.minPrice)}</span>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-white/10 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Prix Moyen</span>
                  <span className="text-sm font-bold text-blue-500">{formatPrice(localStats.avgPrice)}</span>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-white/10 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Prix Max</span>
                  <span className="text-sm font-bold text-rose-500">{formatPrice(localStats.maxPrice)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LAYOUT PRINCIPAL */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
          
          {/* SIDEBAR DESKTOP */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-28 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
            {renderCompareFilterOptions({
              t,
              clearFilters,
              isVerifiedOnly,
              setIsVerifiedOnly,
              availability,
              setAvailability,
              minPrice,
              setMinPrice,
              maxPrice,
              setMaxPrice,
              currencySymbol: formatPriceParts(0).symbol,
              availableCities,
              selectedCities,
              toggleCity,
              availableShops,
              selectedShops,
              toggleShop,
            })}
          </aside>

          {/* ZONE PRINCIPALE (Tri + Grille) */}
          <div className="flex-1 w-full min-w-0">
            
            {/* Barre de Tri (Desktop + Mobile) */}
            {filteredAndConverted.length > 0 && !loading && (
              <div className="flex items-center justify-between bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-3 shadow-sm mb-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {filteredAndConverted.length} {filteredAndConverted.length !== 1 ? t('compare.resultsPlural') : t('compare.resultsSingular')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('compare.sortBy')}</span>
                  <select
                    className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-[#2D5A27] dark:text-emerald-400 rounded-lg px-3 py-1.5 outline-none cursor-pointer focus:border-[#E67E22]"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="price_asc">{t('compare.sortPriceAsc')}</option>
                    <option value="price_desc">{t('compare.sortPriceDesc')}</option>
                    <option value="rating">{t('compare.sortRating')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* GRILLE PRODUITS */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">{t('compare.analyzing')}</p>
              </div>
            ) : filteredAndConverted.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-6">
                {filteredAndConverted.map((product, idx) => (
                  <div key={product.id} className="relative animate-in fade-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                    {product.price === filteredMin && filteredAndConverted.length > 1 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-emerald-600 text-[8px] font-black uppercase tracking-widest text-white rounded-full shadow-lg whitespace-nowrap">
                        {t('compare.bestPrice')}
                      </div>
                    )}
                    <ProductCard product={product} onQuickView={setSelectedProduct} />
                  </div>
                ))}
              </div>
            ) : query.trim().length >= 2 ? (
              <div className="py-20 text-center bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-gray-300 dark:text-white/20" />
                </div>
                <h2 className="text-xl font-black text-gray-400 dark:text-white/40 uppercase tracking-tight">
                  {t('compare.noResultsTitle')} &ldquo;{query}&rdquo;
                </h2>
                <p className="text-xs font-bold text-gray-400 mt-2">{t('compare.noResultsDesc')}</p>
                {products.length > 0 && (
                  <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-[#E67E22] hover:bg-[#d67118] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                    {t('compare.clearFilters')}
                  </button>
                )}
              </div>
            ) : (
              <EmptyCompareState />
            )}

          </div>
        </div>
      </div>

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <button
            type="button"
            aria-label={t('compare.mobileFilters')}
            onClick={() => setIsMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl dark:bg-[#1a1a1a]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#2D5A27] dark:text-white">
                {t('compare.filtersTitle')}
              </h2>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="rounded-full border border-gray-200 p-2 text-gray-500 dark:border-white/10 dark:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {renderCompareFilterOptions({
              t,
              clearFilters,
              isVerifiedOnly,
              setIsVerifiedOnly,
              availability,
              setAvailability,
              minPrice,
              setMinPrice,
              maxPrice,
              setMaxPrice,
              currencySymbol: formatPriceParts(0).symbol,
              availableCities,
              selectedCities,
              toggleCity,
              availableShops,
              selectedShops,
              toggleShop,
            })}
          </div>
        </div>
      )}

      {selectedProduct && (
        <ProductQuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa] dark:bg-black" />}>
      <CompareContent />
    </Suspense>
  );
}

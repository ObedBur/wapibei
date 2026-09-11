'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/Pagination';
import { getSellerById, toggleFollowVendor } from '@/features/home/services/seller.service';
import { useAuth } from '@/context/AuthContext';
import { ProductCard } from '@/features/products/components/ProductCard';
import { ProductCardSkeleton } from '@/features/products/components/ProductCardSkeleton';
import { ProductQuickView } from '@/features/products/components/ProductQuickView';
import { Product } from '@/features/products/types';
import useT from '@/i18n/useT';

const PAGE_SIZE = 20; // 5 colonnes × 4 rangées

export default function SellerDetailPage() {
  const { t } = useT();
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [isLoading, setIsLoading] = useState(true);
  const [sellerData, setSellerData] = useState<any>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        setIsLoading(true);
        if (id) {
          const data = await getSellerById(id as string);
          setSellerData(data);
          setIsFollowed(Boolean(data?.isFollowed));
        }
      } catch (error) {
        console.error('Error fetching seller detail:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFullData();
  }, [id]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsTogglingFollow(true);
    try {
      const result = await toggleFollowVendor(id as string);
      if (result) setIsFollowed(result.followed);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const toProduct = (product: any): Product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    location: product.location,
    city: product.city || sellerData?.city || '',
    country: product.country || sellerData?.country || '',
    price: Number(product.price) || 0,
    displayPrice: product.displayPrice,
    categoryId: product.categoryId || product.category?.id || '',
    image: product.images?.[0] || product.image || '/images/placeholder.png',
    images: product.images,
    updatedAt: product.updatedAt || new Date().toISOString(),
    availability: product.availability,
    stockQuantity: product.stockQuantity,
    unit: product.unit,
    user: product.user || {
      id: sellerData?.id || (id as string),
      boutiqueName: sellerData?.boutiqueName,
      fullName: sellerData?.fullName,
      isVerified: sellerData?.isVerified,
      trustScore: sellerData?.trustScore,
      phone: sellerData?.phone,
      avatarUrl: sellerData?.avatarUrl,
    },
  });

  const mappedProducts: Product[] = useMemo(() => {
    if (!sellerData) return [];
    return (sellerData.products || []).filter((p: any) => p.isPublic).map(toProduct);
  }, [sellerData]);

  // Pagination
  const totalPages = Math.ceil(mappedProducts.length / PAGE_SIZE);
  const paginatedProducts = mappedProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );


  /* ─────────────────────────── SKELETON STATE ─────────────────────────── */
  if (isLoading) {
    return (
      <main className="flex-1 bg-gray-50/50 dark:bg-background-dark/50 pt-24 pb-20">
        <div className="container mx-auto max-w-7xl px-4">

          {/* HEADER SKELETON */}
          <div className="bg-white dark:bg-[#111827] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 mb-8 sm:mb-12 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
              {/* Avatar skeleton */}
              <div className="size-24 sm:size-32 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
              {/* Info skeleton */}
              <div className="flex-1 w-full space-y-4">
                <div className="w-2/3 h-8 bg-slate-200 dark:bg-white/10 rounded-xl" />
                <div className="flex gap-8">
                  <div className="w-16 h-10 bg-slate-200 dark:bg-white/10 rounded-lg" />
                  <div className="w-16 h-10 bg-slate-200 dark:bg-white/10 rounded-lg" />
                </div>
                <div className="flex gap-3 w-full max-w-sm">
                  <div className="flex-1 h-14 bg-slate-200 dark:bg-white/10 rounded-2xl" />
                  <div className="flex-1 h-14 bg-slate-200 dark:bg-white/10 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH + TABS SKELETON */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 animate-pulse">
            <div className="w-full sm:max-w-md h-14 bg-slate-200 dark:bg-white/10 rounded-2xl" />
            <div className="w-24 h-10 bg-slate-200 dark:bg-white/10 rounded-xl" />
          </div>

          {/* PRODUCTS GRID SKELETON — 5×4 = 20 cartes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-5">
            {Array.from({ length: 20 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>

        </div>
      </main>
    );
  }

  /* ─────────────────────────── NOT FOUND ─────────────────────────── */
  if (!sellerData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 gap-4">
        <h2 className="text-2xl font-black text-deep-blue dark:text-white">{t('sellerDetail.notFound')}</h2>
        <Link href="/sellers" className="text-primary font-bold hover:underline italic">{t('sellerDetail.back')}</Link>
      </div>
    );
  }

  /* ─────────────────────────── MAIN RENDER ─────────────────────────── */
  return (
    <main className="flex-1 bg-gray-50/50 dark:bg-background-dark/50 pt-24 pb-20">
      <div className="container mx-auto max-w-7xl px-4">

        {/* SHOP HEADER */}
        <div className="bg-white dark:bg-[#111827] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
            {/* AVATAR */}
            <div className="relative shrink-0">
              <div className="size-24 sm:size-32 rounded-full p-1 bg-white dark:bg-[#111827] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                <Image
                  src={sellerData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerData.boutiqueName || 'S')}&background=random&size=200`}
                  alt={sellerData.boutiqueName}
                  width={128}
                  height={128}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {sellerData.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#111827] p-1.5 rounded-full shadow-lg">
                  <span className="material-symbols-outlined text-[#E67E22] text-[28px] sm:text-[32px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1 text-center sm:text-left space-y-4 sm:space-y-6 w-full">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-deep-blue dark:text-white uppercase tracking-tight leading-none">
                  {sellerData.boutiqueName}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 sm:gap-10 mt-4">
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-black text-deep-blue dark:text-white">{(sellerData.trustScore / 20).toFixed(1)}</span>
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] leading-none">{t('sellerDetail.score')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-black text-deep-blue dark:text-white">{sellerData.productCount}</span>
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] leading-none">{t('sellerDetail.items')}</span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
                <button
                  onClick={handleToggleFollow}
                  disabled={isTogglingFollow}
                  className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 ${
                    isFollowed
                      ? 'bg-gray-200 dark:bg-gray-800 text-deep-blue dark:text-white border border-gray-300 dark:border-gray-700 shadow-none'
                      : 'bg-[#E67E22] text-white shadow-[#E67E22]/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isFollowed ? "'FILL' 1" : "'FILL' 0" }}>
                    {isFollowed ? 'person_remove' : 'person_add'}
                  </span>
                  {isTogglingFollow ? '...' : (isFollowed ? t('sellerDetail.unfollow') : t('sellerDetail.follow'))}
                </button>

                <Link
                  href={`https://wa.me/${sellerData.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(t('sellerDetail.whatsappMessage').replace('{name}', sellerData.boutiqueName))}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-[#2D5A27] text-white rounded-2xl font-black text-sm shadow-xl shadow-green-900/20 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  WhatsApp
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH + TABS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
          <div className="relative w-full sm:max-w-md group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300 group-focus-within:text-[#E67E22] transition-colors">search</span>
            <input
              type="text"
              placeholder={t('sellerDetail.searchPlaceholder')}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-deep-blue dark:text-white shadow-xl shadow-black/2 focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
            {[t('sellerDetail.all')].map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={`whitespace-nowrap px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? 'bg-[#2D5A27] text-white shadow-xl shadow-green-900/20'
                    : 'bg-white dark:bg-[#111827] text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID — 5 col × 4 rows = 20 per page */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-5">
              {paginatedProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setSelectedProduct}
                />
              ))}
            </div>

            {/* PAGINATION */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setCurrentPage(Math.max(1, Math.min(p, totalPages)));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              totalItems={mappedProducts.length}
              itemsPerPage={PAGE_SIZE}
              itemsOnPage={paginatedProducts.length}
            />
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-[#111827] rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
            <span className="material-symbols-outlined text-5xl text-gray-200 mb-4">inventory_2</span>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t('sellerDetail.noProducts')}</p>
          </div>
        )}

      </div>

      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}

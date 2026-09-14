'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getActiveSellers, Seller } from '@/features/home/services/seller.service';
import { FeaturedStoreCard } from '@/features/home/components/FeaturedStoreCard';
import { FeaturedStoreSkeleton } from '@/features/home/components/FeaturedStoreSkeleton';
import useT from '@/i18n/useT';

const SELLERS_PER_PAGE = 10;

export default function SellersPage() {
    const { t } = useT();
    const searchParams = useSearchParams();
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    useEffect(() => {
        const fetchSellers = async () => {
            try {
                const data = await getActiveSellers();
                setSellers(data);
            } catch (error) {
                console.error('Error fetching sellers:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSellers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredSellers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return sellers;
        return sellers.filter((s) => s.boutiqueName.toLowerCase().includes(q));
    }, [sellers, searchQuery]);

    const totalPages = useMemo(
        () => Math.ceil(filteredSellers.length / SELLERS_PER_PAGE),
        [filteredSellers]
    );

    const paginatedSellers = useMemo(
        () => filteredSellers.slice(
            (currentPage - 1) * SELLERS_PER_PAGE,
            currentPage * SELLERS_PER_PAGE
        ),
        [filteredSellers, currentPage]
    );

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  return (
    <main className="flex-1 pt-20">
      <section className="py-12 container mx-auto max-w-7xl px-4 animate-in fade-in duration-500">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Link
                  href="/"
                  className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-[#E67E22] hover:text-white transition-all"
                >
                  <ArrowLeft size={18} />
                </Link>
                <span className="text-primary font-bold text-[10px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-wider">{t('sellersPage.partners')}</span>
              </div>
              <h2 className="text-2xl sm:text-5xl font-black text-deep-blue dark:text-white mt-2 mb-3 sm:mb-4 tracking-tighter">{t('sellersPage.title')}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-lg">
                  {t('sellersPage.subtitle')}
              </p>

              <div className="relative max-w-md mx-auto mt-6 sm:mt-8">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('sellersPage.searchPlaceholder')}
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm font-bold text-deep-blue dark:text-white outline-none focus:ring-2 focus:ring-[#E67E22]/30 focus:border-[#E67E22] transition-all placeholder:text-gray-400"
                />
              </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
              {Array.from({ length: 10 }).map((_, idx) => (
                <FeaturedStoreSkeleton key={idx} />
              ))}
            </div>
          ) : (
            <>
              {filteredSellers.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-100 dark:border-white/5">
                  <div className="mx-auto w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-gray-300 dark:text-white/20" />
                  </div>
                  <h3 className="text-lg font-black text-gray-500 dark:text-gray-400">{t('sellersPage.noResults')}</h3>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
                  {paginatedSellers.map((seller) => (
                    <FeaturedStoreCard key={seller.id} store={seller} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {/* PREV */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center size-10 rounded-xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 shadow-sm text-gray-400 hover:text-[#E67E22] hover:border-[#E67E22]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="size-5" strokeWidth={2.5} />
                  </button>

                  {/* PAGE NUMBERS */}
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    // Affiche première, dernière, courante ±1, avec points de suspension
                    const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    const showEllipsisBefore = page === currentPage - 2 && page > 2;
                    const showEllipsisAfter = page === currentPage + 2 && page < totalPages - 1;

                    if (!showPage && !showEllipsisBefore && !showEllipsisAfter) return null;
                    if (showEllipsisBefore || showEllipsisAfter) {
                      return <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm font-black px-1">…</span>;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        className={`size-10 rounded-xl text-sm font-black transition-all ${
                          currentPage === page
                            ? 'bg-[#E67E22] text-white shadow-lg shadow-[#E67E22]/25'
                            : 'bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 text-gray-500 hover:border-[#E67E22]/30 hover:text-[#E67E22]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* NEXT */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center size-10 rounded-xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 shadow-sm text-gray-400 hover:text-[#E67E22] hover:border-[#E67E22]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="size-5" strokeWidth={2.5} />
                  </button>
                </div>
              )}

              {totalPages > 1 && (
                <p className="text-center text-xs text-gray-400 font-medium mt-4">
                  {(currentPage - 1) * SELLERS_PER_PAGE + 1}–{Math.min(currentPage * SELLERS_PER_PAGE, filteredSellers.length)} sur {filteredSellers.length} vendeurs
                </p>
              )}
            </>
          )}
      </section>
    </main>
  );
}

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import type { PaginationProps } from './pagination.types';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemsOnPage,
}) => {
  if (totalPages <= 1) return null;

  const showCounter =
    totalItems !== undefined &&
    itemsPerPage !== undefined &&
    itemsOnPage !== undefined;

  const rangeStart = showCounter
    ? (currentPage - 1) * itemsPerPage! + (itemsOnPage! > 0 ? 1 : 0)
    : null;
  const rangeEnd = showCounter
    ? (currentPage - 1) * itemsPerPage! + itemsOnPage!
    : null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex flex-col items-center gap-3 mt-12 w-full px-2"
    >
      {showCounter && (
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
          {rangeStart}–{rangeEnd} / {totalItems}
        </p>
      )}

      <div className="flex justify-center items-center gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto max-w-full pb-2 scrollbar-hide">
        {/* Bouton Précédent */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Page précédente"
          className="size-9 sm:size-11 rounded-xl border border-gray-100 dark:border-white/10 text-[#2D5A27] dark:text-white disabled:opacity-30 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px] sm:text-[18px]">chevron_left</span>
        </Button>

        {/* Numéros de pages avec ellipsis */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap shrink-0">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Afficher toujours la première et la dernière page, et la page courante +/- 1
            const isEdge = page === 1 || page === totalPages;
            const isNearCurrent = Math.abs(page - currentPage) <= 1;
            
            // Si on est à la page 3, afficher la 2 au lieu d'un "..." (car page=1 est Edge et page=3 est current)
            // Idem pour la fin : si total=6 et on est à la page 4, afficher la 5 au lieu de "..."
            const isFillingGap1 = page === 2 && currentPage === 4;
            const isFillingGap2 = page === totalPages - 1 && currentPage === totalPages - 3;
            
            const showPage = isEdge || isNearCurrent || isFillingGap1 || isFillingGap2;

            // Déterminer où placer les "..."
            const showEllipsisBefore = page === 2 && !showPage;
            const showEllipsisAfter = page === totalPages - 1 && !showPage;

            if (!showPage && !showEllipsisBefore && !showEllipsisAfter) return null;

            if (!showPage && (showEllipsisBefore || showEllipsisAfter)) {
              return (
                <span
                  key={`ellipsis-${page}`}
                  className="text-gray-400 text-xs sm:text-sm font-black px-0.5 sm:px-1 select-none flex items-center justify-center h-full"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            return (
              <Button
                key={page}
                variant="ghost"
                size="icon"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`size-9 sm:size-11 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 ${
                  currentPage === page
                    ? 'bg-[#E67E22] hover:bg-[#d6721b] text-white shadow-lg shadow-[#E67E22]/20'
                    : 'bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10'
                }`}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Bouton Suivant */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
          className="size-9 sm:size-11 rounded-xl border border-gray-100 dark:border-white/10 text-[#2D5A27] dark:text-white disabled:opacity-30 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px] sm:text-[18px]">chevron_right</span>
        </Button>
      </div>
    </nav>
  );
};

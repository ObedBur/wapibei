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
    <div className="flex flex-col items-center gap-2 mt-12">
      {showCounter && (
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {rangeStart}–{rangeEnd} / {totalItems}
        </p>
      )}

      <div className="flex justify-center items-center gap-1.5 flex-wrap">
        {/* Bouton Précédent */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="size-8 sm:size-9 rounded-xl border border-gray-100 dark:border-white/10 text-[#2D5A27] dark:text-white"
        >
          <span className="material-symbols-outlined text-[16px] sm:text-[18px]">chevron_left</span>
        </Button>

        {/* Numéros de pages avec ellipsis */}
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const showPage =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1;
            const showEllipsisBefore = page === currentPage - 2 && page > 2;
            const showEllipsisAfter =
              page === currentPage + 2 && page < totalPages - 1;

            if (!showPage && !showEllipsisBefore && !showEllipsisAfter)
              return null;

            if (showEllipsisBefore || showEllipsisAfter) {
              return (
                <span
                  key={`ellipsis-${page}`}
                  className="text-gray-400 text-xs sm:text-sm font-black px-0.5 sm:px-1"
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
                className={`size-8 sm:size-9 rounded-xl text-[10px] font-black ${
                  currentPage === page
                    ? 'bg-[#E67E22] hover:bg-[#d6721b] text-white shadow-lg shadow-[#E67E22]/20'
                    : 'bg-white dark:bg-white/5 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
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
          className="size-8 sm:size-9 rounded-xl border border-gray-100 dark:border-white/10 text-[#2D5A27] dark:text-white"
        >
          <span className="material-symbols-outlined text-[16px] sm:text-[18px]">chevron_right</span>
        </Button>
      </div>
    </div>
  );
};

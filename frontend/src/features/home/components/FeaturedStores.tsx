"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
} from "lucide-react";
import { Seller } from "../services/seller.service";
import { FeaturedStoreSkeleton } from "./FeaturedStoreSkeleton";
import { FeaturedStoreCard } from "./FeaturedStoreCard";
import { useT } from "@/i18n/useT";

interface FeaturedStoresProps {
  stores: Seller[];
}

const safeLabel = (
  rawLabel: string | null | undefined,
  fallback: string
): string => {
  if (!rawLabel) return fallback;

  if (
    rawLabel.includes(".featuredStores.") ||
    rawLabel.includes(".home.")
  ) {
    return fallback;
  }

  return rawLabel;
};

export const FeaturedStores: React.FC<FeaturedStoresProps> = ({ stores }) => {
  const { t } = useT();

  if (!stores || stores.length === 0) {
    // Rend le skeleton pendant le chargement initial ou si on lui a passé un tableau vide exprès
    return (
      <div className="py-12">
        {/* HEADER SKELETON */}
        <div className="flex items-end justify-between mb-10 border-b border-gray-100 dark:border-white/5 pb-6">
          <div className="space-y-3 w-1/2">
            <div className="w-32 h-3 bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
            <div className="w-64 h-8 md:h-10 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="w-24 h-4 bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
        </div>

        {/* GRID SKELETON */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <FeaturedStoreSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      {/* HEADER */}
      <div className="flex items-end justify-between gap-4 mb-10 border-b border-gray-100 dark:border-white/5 pb-6">
        <div className="min-w-0 space-y-2">
          <span className="text-[10px] font-black text-[#E67E22] uppercase tracking-[0.3em]">
            {safeLabel(
              t("home.featuredStores.pretitle"),
              "Meilleures adresses"
            )}
          </span>

          <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {safeLabel(
              t("home.featuredStores.title"),
              "Nos vendeurs vérifiés"
            )}
          </h3>
        </div>

        <Link
          href="/sellers"
          aria-label={safeLabel(t("home.featuredStores.exploreAll"), "Explorer tout")}
          className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-right text-xs font-black leading-tight text-gray-500 transition-colors duration-200 hover:text-[#E67E22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E67E22] dark:text-gray-400 dark:hover:text-[#E67E22]"
        >
          {safeLabel(
            t("home.featuredStores.exploreAll"),
            "Explorer tout"
          )}

          <ChevronRight
            className="size-[18px] group-hover:translate-x-1 transition-transform"
            strokeWidth={2.5}
          />
        </Link>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
        {stores.slice(0, 15).map((store, index) => {
          const isMobileHidden = index >= 8 ? "hidden sm:flex" : "";
          const isTabletHidden = index >= 10 ? "sm:hidden lg:flex" : "";

          return (
            <FeaturedStoreCard
              key={store.id}
              store={store}
              className={`${isMobileHidden} ${isTabletHidden}`}
            />
          );
        })}
      </div>
    </div>
  );
};

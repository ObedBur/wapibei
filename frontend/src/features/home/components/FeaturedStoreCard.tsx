"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  BadgeCheck,
  Package,
  ArrowRight,
} from "lucide-react";
import { Seller } from "../services/seller.service";
import { useT } from "@/i18n/useT";

interface FeaturedStoreCardProps {
  store: Seller;
  className?: string;
}

const isValidImageUrl = (url: unknown): url is string => {
  if (typeof url !== "string") return false;

  const trimmed = url.trim();

  if (trimmed.length < 8) return false;
  if (trimmed === "undefined" || trimmed === "null") return false;

  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/")
  );
};

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

export const FeaturedStoreCard: React.FC<FeaturedStoreCardProps> = ({
  store,
  className = "",
}) => {
  const { t } = useT();

  const scoreDisplay = typeof store.trustScore === "number" && Number.isFinite(store.trustScore)
    ? (store.trustScore / 20).toFixed(1)
    : null;

  const validPreviews = (store.productPreviews || []).filter(
    isValidImageUrl
  );

  const heroImage =
    validPreviews[0] ||
    (isValidImageUrl(store.avatarUrl)
      ? store.avatarUrl
      : null);

  const secondaries = validPreviews.slice(1, 3);

  const safeAvatar =
    store.avatarUrl &&
    store.avatarUrl.length > 8 &&
    store.avatarUrl !== "undefined" &&
    store.avatarUrl !== "null"
      ? store.avatarUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          store.boutiqueName || "V"
        )}&background=E67E22&color=fff&size=128`;

  return (
    <div
      className={`group relative flex-col rounded-[1.75rem] overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 flex ${className}`}
    >
      {/* CARTE CLIQUABLE */}
      <Link
        href={`/sellers/${store.id}`}
        className="relative block"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/[0.02]">

          {/* IMAGE PRINCIPALE */}
          {heroImage ? (
            <Image
              src={heroImage}
              alt={store.boutiqueName || "Boutique"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E67E22]/10 via-[#2D5A27]/5 to-transparent">
              <div className="text-[#2D5A27]/40 text-5xl">
                ◇
              </div>
            </div>
          )}

          {/* GRADIENT BAS — renforcé pour lisibilité sur toute image */}
          <div className="absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-black/95 via-black/70 via-[40%] to-transparent pointer-events-none" />

          {/* =====================================================
              HAUT GAUCHE — PRODUITS
              ===================================================== */}
          {store.productCount !== undefined && store.productCount > 0 && (
            <div className="absolute top-2.5 left-2.5 z-30">
              <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-2 py-1 shadow-lg">
                <Package
                  className="size-3 text-white"
                  strokeWidth={2}
                />
                <span className="text-[9px] md:text-[10px] font-black text-white leading-none">
                  {store.productCount} produits
                </span>
              </div>
            </div>
          )}

          {/* =====================================================
              PROFIL VENDEUR
              ===================================================== */}
          <div className="absolute inset-x-0 bottom-0 z-20">
            <div className="relative p-2.5 md:p-3 flex flex-col gap-2.5">

              {/* PROFIL */}
              <div className="flex items-center gap-2.5">

                {/* AVATAR ROND */}
                <div className="relative shrink-0 size-10 md:size-12 rounded-full p-[2px] bg-gradient-to-br from-[#E67E22] via-[#E67E22] to-white shadow-xl ring-2 ring-white">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={safeAvatar}
                      alt={store.boutiqueName || "Boutique"}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  {/* ONLINE INDICATOR */}
                  {store.isOnline === true && (
                    <div className="absolute -right-0.5 -bottom-0.5 size-4 md:size-[18px] bg-green-500 border-[3px] border-white rounded-full shadow-md z-10">
                      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
                    </div>
                  )}
                </div>

                {/* NOM + INFOS */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <h4 className="text-[13px] md:text-[14px] font-black text-white leading-tight tracking-tight truncate" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                      {store.boutiqueName}
                    </h4>

                    {/* CERTIFICATION */}
                    {store.isVerified && (
                      <BadgeCheck
                        className="size-4 md:size-[18px] shrink-0 text-[#2D5A27] fill-white"
                        strokeWidth={1.8}
                      />
                    )}
                  </div>

                  {/* SCORE + VENTES — dans une pilule pour lisibilité garantie */}
                  <div className="flex items-center gap-1 mt-1">
                    {scoreDisplay && (
                      <div className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                        <Star
                          className="size-2.5 text-[#E67E22] fill-current"
                          strokeWidth={0}
                        />
                        <span className="text-[10px] md:text-[11px] font-black text-white leading-none">
                          {scoreDisplay}
                        </span>
                      </div>
                    )}

                    {store.salesCount !== undefined && store.salesCount > 0 && (
                      <div className="hidden min-[420px]:inline-flex items-center bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                        <span className="text-[10px] md:text-[11px] font-black text-[#7BC96F] leading-none">
                          {store.salesCount} ventes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* APERÇUS : deux produits suffisent ; le total est déjà affiché en haut. */}
              {store.productCount !== undefined && store.productCount >= 2 && (
                <div className="flex items-center gap-2">

                  {secondaries.map((preview, i) => (
                    <div
                      key={i}
                      className="relative size-10 md:size-11 rounded-xl overflow-hidden shadow-xl ring-2 ring-white/90 shrink-0 bg-white/10"
                    >
                      <Image
                        src={preview}
                        alt={`${store.boutiqueName || "Boutique"} produit ${
                          i + 2
                        }`}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  ))}

                </div>
              )}

              {/* =====================================================
                  CTA — SANS ICÔNE STORE
                  ===================================================== */}
              <div className="w-full h-8 md:h-9 rounded-[0.8rem] bg-white text-gray-900 shadow-md shadow-black/15 group-hover:bg-gray-50 group-hover:-translate-y-[1px] transition-all duration-300 flex items-center justify-center gap-1.5 font-black text-[10px] md:text-[11px] tracking-wide">
                <span>
                  {safeLabel(
                    t("home.featuredStores.visit"),
                    "Voir la boutique"
                  )}
                </span>

                <ArrowRight
                  className="size-3.5 text-[#E67E22] group-hover:translate-x-1 transition-transform"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>

    </div>
  );
};

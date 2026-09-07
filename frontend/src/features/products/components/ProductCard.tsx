
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, Heart, Star, MapPin } from 'lucide-react';
import { Product } from '../types';
import { ProductMapper } from '../services/product.mapper';
import { useCart } from '@/features/cart/context/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from 'sonner';
import { useT } from '@/i18n/useT';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  compact?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  compact = false,
  className = '',
}) => {
  const { formatPriceParts } = useCurrency();
  const { amount, symbol } = formatPriceParts(product.price);
  const { addItem } = useCart();
  const { toggleFavorite, isFavorited } = useWishlist();
  const { t } = useT();

  const isFav = isFavorited(product.id);
  const isOutOfStock = product.availability === 'OUT_OF_STOCK' || (product.stockQuantity !== undefined && product.stockQuantity !== null && product.stockQuantity === 0);
  const trustScore = product.user?.trustScore ?? 50;
  const trustDisplay = (trustScore / 20).toFixed(1);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const action = toggleFavorite(product);
    if (action === 'added') {
      toast.success(t('product.addedToFavorites').replace('{name}', product.name), { icon: '⭐️' });
    } else if (action === 'removed') {
      toast.success(t('product.removedFromFavorites').replace('{name}', product.name));
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    toast.success(t('product.addedToCart').replace('{name}', product.name));
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      role="article"
      aria-label={t('product.viewDetails').replace('{name}', product.name)}
      className={[
        'group relative flex flex-col bg-white dark:bg-zinc-900',
        'rounded-[1.75rem] overflow-hidden cursor-pointer',
        'shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1',
        compact ? 'w-[160px] md:w-[190px]' : 'w-full md:w-auto',
        className,
      ].join(' ')}
    >
      {/* ════════════════════════════════════════════
           HAUT DE CARTE : ~70% IMAGE LIBRE
           ════════════════════════════════════════════ */}
      <div className={`relative ${compact ? 'aspect-[4/5]' : 'aspect-[4/5]'} overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/[0.02]`}>
        <Image
          alt={product.name}
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          src={product.image}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          priority={false}
        />

        {/* Badge Épuisé */}
        {isOutOfStock && (
          <div className="absolute top-2.5 left-2.5 z-30">
            <div className="bg-black/85 dark:bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-lg ring-1 ring-[#E67E22]/30">
              <span className="text-[9px] md:text-[10px] font-black text-[#E67E22] uppercase tracking-widest">{t('product.outOfStock')}</span>
            </div>
          </div>
        )}

        {/* ── BOUTONS EYE + HEART : TAILLE REDUITE (size-7 = 28px, PAS size-9 36px) ── */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-40 flex items-start justify-between gap-2">
          {onQuickView && !compact && (
            <button
              type="button"
              onClick={handleQuickView}
              aria-label={t('product.quickView')}
              className="hidden sm:flex shrink-0 size-7 rounded-full items-center justify-center bg-white/92 dark:bg-black/50 backdrop-blur-md shadow-lg ring-1 ring-black/5 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black/70 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Eye className="size-3.5 md:size-4" strokeWidth={2} />
            </button>
          )}
          <div className="ml-auto">
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={isFav ? t('product.removeFromFavorites') : t('product.addToFavorites')}
              className={`shrink-0 size-7 rounded-full flex items-center justify-center shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md
                ${isFav ? 'bg-[#E67E22] text-white' : 'bg-white/92 dark:bg-black/50 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black/70'}`}
            >
              <Heart className={`size-3.5 md:size-4 ${isFav ? 'fill-current' : ''}`} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════
             BAS DE CARTE : ~30% SEULEMENT — 3 LIGNES MAX
             LIGNE 1 : Titre (flex-[1.6] = 62%) + Prix (flex-1 = 38%)  ← EQUILIBRE POUR NE PLUS COUPER
             LIGNE 2 : Pills Ville + ⭐  (max 2 badges)
             LIGNE 3 : CTA Panier
             ════════════════════════════════════════════ */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 via-[25%] to-transparent pointer-events-none" />

          <div className={`relative z-10 ${compact ? 'p-2.5 md:p-3' : 'p-3 md:p-4'} flex flex-col gap-2`}>
            {/* ━━━ LIGNE 1 : TITRE 62% + PRIX 38% (évite "Petit Dou..." coupé) ━━━ */}
            <div className="flex items-end justify-between gap-2">
              <h3 className={`min-w-0 flex-[1.6] ${compact ? 'text-[11.5px] md:text-[12.5px] line-clamp-2' : 'text-[12.5px] md:text-[14.5px] line-clamp-2'} font-black text-white leading-tight tracking-tight drop-shadow-sm`}>
                {product.name}
              </h3>
              {/* PRIX — Pilule sombre pour lisibilité garantie sur toute image */}
              <div className="shrink-0 flex flex-col items-end gap-0">
                <div className="inline-flex items-baseline gap-0.5 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <span className={`${compact ? 'text-[13px] md:text-[14px]' : 'text-[14px] md:text-[17px]'} font-black text-[#E67E22] leading-none tracking-tight`}>
                    {amount}
                  </span>
                  <span className={`${compact ? 'text-[8px] md:text-[9px]' : 'text-[9px] md:text-[10px]'} font-black text-[#E67E22]/90 uppercase leading-none`}>
                    {symbol}
                  </span>
                </div>
                {/* Unité : "/Pièce" ALIGNÉ À DROITE */}
                {product.unit && (() => {
                  const unitKey = `product.units.${product.unit.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                  const translatedUnit = t(unitKey);
                  const displayUnit = translatedUnit !== unitKey ? translatedUnit : product.unit;
                  return (
                    <span className={`${compact ? 'text-[8px]' : 'text-[8.5px] md:text-[9.5px]'} font-medium text-white/65 leading-none mt-0.5 pr-1`}>
                      {t('product.unitPer').replace('{unit}', displayUnit)}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* ━━━ LIGNE 2 : PILLS COMPACTES (hauteur max 20px, Rounded full mais paddings reduits) ━━━ */}
            <div className="flex flex-wrap items-center gap-1.5">
              {product.city && (
                <div className="inline-flex items-center gap-1 bg-white/12 backdrop-blur-[2px] rounded-full px-2 py-[2px] shadow-sm">
                  <MapPin className={`${compact ? 'size-2' : 'size-[10px] md:size-[11px]'} text-[#2D5A27] fill-current/10`} strokeWidth={2.5} />
                  <span className={`${compact ? 'text-[8.5px]' : 'text-[9px] md:text-[10px]'} font-bold text-white/92 leading-none truncate ${compact ? 'max-w-[50px]' : 'max-w-[90px]'}`}>
                    {product.city}
                  </span>
                </div>
              )}
              <div className="inline-flex items-center gap-1 bg-white/12 backdrop-blur-[2px] rounded-full px-2 py-[2px] shadow-sm">
                <Star className={`${compact ? 'size-2' : 'size-[10px] md:size-[11px]'} text-[#E67E22] fill-current drop-shadow-sm`} strokeWidth={0} />
                <span className={`${compact ? 'text-[8.5px]' : 'text-[9px] md:text-[10px]'} font-black text-white leading-none`}>{trustDisplay}</span>
              </div>
            </div>

            {/* ━━━ LIGNE 3 : CTA PANIER — HEIGHT + FONT REDUITS ━━━ */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={[
                `w-full ${compact ? 'h-8 md:h-9' : 'h-9 md:h-10'} rounded-[0.85rem] md:rounded-[1rem] flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 cursor-pointer font-black ${compact ? 'text-[9.5px]' : 'text-[10.5px] md:text-[11.5px]'} tracking-wide active:scale-[0.98]`,
                isOutOfStock
                  ? 'bg-white/25 text-white/60 backdrop-blur-md cursor-not-allowed border border-white/15'
                  : 'bg-white text-gray-900 hover:bg-gray-50 shadow-black/15 hover:shadow-lg hover:shadow-black/18 hover:-translate-y-[2px]'
              ].join(' ')}
            >
              <ShoppingCart className={`${compact ? 'size-3' : 'size-[13.5px] md:size-[14.5px]'} ${isOutOfStock ? 'text-white/60' : 'text-[#E67E22]'}`} strokeWidth={2.2} />
              <span>{isOutOfStock ? t('product.outOfStockShort') : t('product.addToCart')}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

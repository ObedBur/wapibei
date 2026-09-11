'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, Heart, Star, MapPin, ImageOff } from 'lucide-react';
import { Product } from '../types';
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
  const isOutOfStock = product.availability === 'OUT_OF_STOCK' || (
    product.stockQuantity !== undefined &&
    product.stockQuantity !== null &&
    product.stockQuantity === 0
  );
  const trustScore = product.user?.trustScore;
  const trustDisplay = typeof trustScore === 'number' && Number.isFinite(trustScore)
    ? (trustScore / 20).toFixed(1)
    : null;
  const hasProductImage = Boolean(product.image?.trim());

  const handleToggleFavorite = () => {
    const action = toggleFavorite(product);
    if (action === 'added') {
      toast.success(t('product.addedToFavorites').replace('{name}', product.name), { icon: '⭐️' });
    } else if (action === 'removed') {
      toast.success(t('product.removedFromFavorites').replace('{name}', product.name));
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, 1);
    toast.success(t('product.addedToCart').replace('{name}', product.name));
  };

  const unitKey = product.unit
    ? `product.units.${product.unit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    : null;
  const translatedUnit = unitKey ? t(unitKey) : null;
  const displayUnit = product.unit && translatedUnit !== unitKey ? translatedUnit : product.unit;

  return (
    <article
      className={[
        'group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white dark:bg-zinc-900',
        'shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)]',
        compact ? 'w-[160px] md:w-[190px]' : 'w-full md:w-auto',
        className,
      ].join(' ')}
    >
      <Link
        href={`/products/${product.id}`}
        aria-label={t('product.viewDetails').replace('{name}', product.name)}
        className="group block rounded-[1.75rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E67E22]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/[0.02]">
          {hasProductImage ? (
            <Image
              alt={product.name}
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              src={product.image}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div
              role="img"
              aria-label={t('product.imageUnavailable')}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-slate-500"
            >
              <ImageOff className="size-8" strokeWidth={1.7} aria-hidden="true" />
              <span className="text-[10px] font-bold">{t('product.imageUnavailable')}</span>
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute top-2.5 left-2.5 z-20">
              <div className="rounded-full bg-black/85 px-2.5 py-1 shadow-lg ring-1 ring-[#E67E22]/30 backdrop-blur-md dark:bg-black/90">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#E67E22] md:text-[10px]">
                  {t('product.outOfStock')}
                </span>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 pb-12">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 via-[25%] to-transparent" />
            <div className={`relative flex flex-col gap-2 ${compact ? 'px-2.5 pt-2.5 md:px-3 md:pt-3' : 'px-3 pt-3 md:px-4 md:pt-4'}`}>
              <div className="flex items-end justify-between gap-2">
                <h3 className={`min-w-0 flex-[1.6] font-black leading-tight tracking-tight text-white drop-shadow-sm ${compact ? 'text-[11.5px] line-clamp-2 md:text-[12.5px]' : 'text-[12.5px] line-clamp-2 md:text-[14.5px]'}`}>
                  {product.name}
                </h3>
                <div className="shrink-0 flex flex-col items-end gap-0">
                  <div className="inline-flex items-baseline gap-0.5 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm">
                    <span className={`${compact ? 'text-[13px] md:text-[14px]' : 'text-[14px] md:text-[17px]'} font-black leading-none tracking-tight text-[#E67E22]`}>
                      {amount}
                    </span>
                    <span className={`${compact ? 'text-[8px] md:text-[9px]' : 'text-[9px] md:text-[10px]'} font-black uppercase leading-none text-[#E67E22]/90`}>
                      {symbol}
                    </span>
                  </div>
                  {displayUnit && (
                    <span className={`${compact ? 'text-[8px]' : 'text-[8.5px] md:text-[9.5px]'} mt-0.5 pr-1 font-medium leading-none text-white/65`}>
                      {t('product.unitPer').replace('{unit}', displayUnit)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {product.city && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2 py-[2px] shadow-sm backdrop-blur-[2px]">
                    <MapPin className={`${compact ? 'size-2' : 'size-[10px] md:size-[11px]'} fill-current/10 text-[#2D5A27]`} strokeWidth={2.5} />
                    <span className={`${compact ? 'max-w-[50px] text-[8.5px]' : 'max-w-[90px] text-[9px] md:text-[10px]'} truncate font-bold leading-none text-white/92`}>
                      {product.city}
                    </span>
                  </div>
                )}
                {trustDisplay && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2 py-[2px] shadow-sm backdrop-blur-[2px]">
                    <Star className={`${compact ? 'size-2' : 'size-[10px] md:size-[11px]'} fill-current text-[#E67E22] drop-shadow-sm`} strokeWidth={0} />
                    <span className={`${compact ? 'text-[8.5px]' : 'text-[9px] md:text-[10px]'} font-black leading-none text-white`}>
                      {trustDisplay}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-start justify-between gap-2">
        {onQuickView && !compact && (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            aria-label={t('product.quickView')}
            className="hidden size-7 shrink-0 items-center justify-center rounded-full bg-white/92 text-gray-900 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E67E22] dark:bg-black/50 dark:text-white dark:hover:bg-black/70 sm:flex"
          >
            <Eye className="size-3.5 md:size-4" strokeWidth={2} />
          </button>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={isFav ? t('product.removeFromFavorites') : t('product.addToFavorites')}
            className={`size-7 shrink-0 rounded-full shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E67E22] ${isFav ? 'bg-[#E67E22] text-white' : 'bg-white/92 text-gray-900 hover:bg-white dark:bg-black/50 dark:text-white dark:hover:bg-black/70'}`}
          >
            <Heart className={`mx-auto size-3.5 md:size-4 ${isFav ? 'fill-current' : ''}`} strokeWidth={2} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={[
          `absolute inset-x-3 bottom-3 z-30 flex ${compact ? 'h-8 text-[9.5px] md:h-9' : 'h-9 text-[10.5px] md:h-10 md:text-[11.5px]'} items-center justify-center gap-1.5 rounded-[0.85rem] font-black tracking-wide shadow-md transition-all duration-300 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E67E22] md:rounded-[1rem]`,
          isOutOfStock
            ? 'cursor-not-allowed border border-white/15 bg-white/25 text-white/60 backdrop-blur-md'
            : 'cursor-pointer bg-white text-gray-900 shadow-black/15 hover:-translate-y-[2px] hover:bg-gray-50 hover:shadow-lg hover:shadow-black/18',
        ].join(' ')}
      >
        <ShoppingCart className={`${compact ? 'size-3' : 'size-[13.5px] md:size-[14.5px]'} ${isOutOfStock ? 'text-white/60' : 'text-[#E67E22]'}`} strokeWidth={2.2} />
        <span>{isOutOfStock ? t('product.outOfStockShort') : t('product.addToCart')}</span>
      </button>
    </article>
  );
};

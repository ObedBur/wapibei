'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { useCart } from '@/features/cart/context/CartContext';
import { formatDate } from '@/utils/date';
import useT from '@/i18n/useT';
import { ShoppingCart, X, MapPin, Clock, Star } from 'lucide-react';

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
}

import { ProductMapper } from '../services/product.mapper';

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const { t } = useT();
  const [isLoading, setIsLoading] = useState(true);

  const { amount, currency } = ProductMapper.parsePrice(product.displayPrice || product.price);
  const isOutOfStock = product.availability === 'OUT_OF_STOCK' || (product.stockQuantity !== undefined && product.stockQuantity !== null && product.stockQuantity === 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // 600ms de skeleton (plus réactif)
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = () => {
    addItem(product);
    onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
    };
  }, []);

  const sellerName = product.user?.boutiqueName || product.user?.fullName || t('product.vendorDefault');
  const trustScore = typeof product.user?.trustScore === 'number' && Number.isFinite(product.user.trustScore)
    ? product.user.trustScore
    : null;
  const initial = sellerName.charAt(0).toUpperCase();
  const whatsappMessage = t('product.whatsappInterest')
    .replace('{name}', product.name)
    .replace('{price}', String(product.displayPrice || product.price));
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  const productUrl = publicAppUrl
    ? `${publicAppUrl}/products/${product.id}`
    : '';
  const whatsappMessageWithLink = [whatsappMessage, productUrl].filter(Boolean).join('\n');

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden">
      {/* Fond sombre flouté */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Conteneur Principal Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3, y: 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl bg-white dark:bg-[#111] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] border border-white/20"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col md:flex-row h-full overflow-hidden"
            >
              {/* Image Skeleton */}
              <div className="w-full md:w-1/2 h-48 sm:h-64 md:h-auto md:min-h-[400px] bg-slate-50 dark:bg-white/5 relative animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-24 rounded-2xl bg-slate-200 dark:bg-white/10" />
                </div>
              </div>
              
              {/* Content Skeleton */}
              <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 space-y-8 flex flex-col">
                <div className="space-y-4">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
                  <div className="h-10 w-3/4 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                  <div className="h-12 w-1/2 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                </div>
                <div className="h-32 w-full bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                <div className="h-24 w-full bg-slate-50 dark:bg-white/5 rounded-2xl animate-pulse mt-auto" />
                <div className="h-14 w-full bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col md:flex-row h-full overflow-hidden"
            >
              {/* Bouton Fermer Flottant */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 md:top-6 md:right-6 z-50 size-8 md:size-12 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 dark:text-white hover:bg-[#E67E22] hover:text-white transition-all duration-300 group"
              >
                <X className="size-5 md:size-6 group-hover:rotate-90 transition-transform" />
              </button>

              {/* Section Gauche : Image */}
              <div className="w-full md:w-1/2 h-48 sm:h-64 md:h-auto md:min-h-[400px] bg-white relative shrink-0 group flex items-center justify-center">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="object-contain p-4 transition-transform duration-700 md:group-hover:scale-105"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>

              {/* Section Droite : Contenu */}
              <div className="w-full md:w-1/2 flex flex-col flex-1 min-h-0 overflow-hidden bg-white dark:bg-[#111]">
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 sm:p-6 md:p-10 flex flex-col gap-4 md:gap-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <span className="px-2 md:px-3 py-1 bg-[#E67E22]/10 text-[#E67E22] text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
                          {product.categoryId || t('product.wapibeiProduct')}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-[1.1] mb-2 md:mb-4 tracking-tighter">
                        {product.name}
                      </h2>
                      <div className="flex items-baseline gap-1 md:gap-2">
                        <span className="text-2xl sm:text-3xl md:text-5xl font-black text-[#E67E22] tracking-tighter">
                          {amount}
                        </span>
                        <span className="text-lg sm:text-xl md:text-3xl font-black text-[#E67E22] uppercase ml-1">
                          {currency}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 py-3 md:py-6 border-y border-slate-100 dark:border-white/5 text-xs md:text-sm font-medium text-slate-500">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <MapPin className="size-4 md:size-5 text-[#E67E22]" />
                        <span className="text-slate-900 dark:text-gray-300 font-bold">{product.city}</span>
                        <span className="text-[10px] md:text-xs text-slate-400">({product.location})</span>
                      </div>
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Clock className="size-4 md:size-5" />
                        {t('product.updatedOn')}: {formatDate(product.updatedAt)}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] md:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2 md:mb-3">{t('product.aboutThisItem')}</h3>
                      <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-xs md:text-[15px]">
                        {product.description || t('product.availableFallback')}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 p-3 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 dark:border-white/10 mt-auto">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="size-10 md:size-14 rounded-lg md:rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg md:text-xl shrink-0">
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <span className="font-black text-sm md:text-lg text-slate-900 dark:text-white truncate">
                              {sellerName}
                            </span>
                            {product.user?.isVerified && (
                              <Star className="size-4 md:size-5 text-blue-500 fill-current shrink-0" />
                            )}
                          </div>
                          {trustScore !== null && (
                            <div className="mt-0.5 flex items-center gap-2 md:mt-1">
                              <div className="flex items-center text-[10px] font-black text-[#E67E22] md:text-xs">
                                <Star className="mr-1 size-3 fill-current md:size-4" />
                                {trustScore} {t('product.score')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 md:px-10 md:py-6 bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 shrink-0 z-10 w-full">
                  <div className="flex flex-row items-center gap-2 md:gap-3 w-full">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 h-12 md:h-14 w-full rounded-xl font-black text-[9px] md:text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 md:gap-3 shadow-lg transition-all active:scale-95 border-2 ${isOutOfStock
                          ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed border-transparent'
                          : 'bg-[#E67E22] hover:bg-[#d6721b] text-white shadow-[#E67E22]/20 border-[#E67E22]'
                        }`}
                    >
                      <ShoppingCart className="size-5 md:size-6" />
                      {isOutOfStock ? t('product.outOfStockUpper') : t('product.addNow')}
                    </button>

                    <a
                      href={`https://wa.me/${product.user?.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessageWithLink)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-12 md:h-14 w-full border-2 border-[#25D366]/40 text-[#25D366] hover:border-[#25D366] hover:bg-[#25D366]/5 rounded-xl font-black text-[9px] md:text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 md:gap-3 transition-all active:scale-95"
                    >
                      <svg className="shrink-0 text-[#25D366] fill-current" width="16" height="16" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                      </svg>
                      <span>{t('product.exchange')}</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

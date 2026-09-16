'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types/product.types';
import { useCurrency } from '@/hooks/useCurrency';

interface RelatedProductsProps {
  products: Product[];
  isLoading?: boolean;
}

const SkeletonCard = () => (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200 dark:bg-white/10" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
    </div>
  </div>
);

const RelatedCard: React.FC<{ product: Product }> = ({ product }) => {
  const { formatPrice } = useCurrency();
  const isOutOfStock = product.availability === 'OUT_OF_STOCK' ||
    (product.stockQuantity !== undefined && product.stockQuantity === 0);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 hover:shadow-xl hover:border-[#E67E22]/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-white/5">
        <Image
          src={product.image || product.images?.[0] || '/shopping-cart.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-2 py-1 bg-black/85 backdrop-blur-md ring-1 ring-[#E67E22]/30 text-[#E67E22] text-[9px] font-black uppercase tracking-widest rounded-full">
              Épuisé
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] font-black text-[#E67E22] mb-0.5">
          {formatPrice(product.price)}
        </p>
        <h4 className="text-[12px] font-bold text-[#1e293b] dark:text-white line-clamp-2 group-hover:text-[#E67E22] transition-colors leading-tight">
          {product.name}
        </h4>
        <p className="text-[10px] text-gray-400 mt-1 truncate">{product.city}</p>
      </div>
    </Link>
  );
};

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ products, isLoading }) => {
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-16 md:mt-24">
      {/* Section header */}
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <div>
          <p className="text-[10px] font-black text-[#E67E22] uppercase tracking-[0.3em] mb-1">Découvrir</p>
          <h2 className="text-2xl md:text-3xl font-black text-[#1e293b] dark:text-white tracking-tighter">
            Vous aimerez aussi
          </h2>
        </div>
        <Link
          href="/products"
          className="text-[11px] font-black text-gray-400 hover:text-[#E67E22] uppercase tracking-widest transition-colors flex items-center gap-1"
        >
          Voir tout
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map(p => <RelatedCard key={p.id} product={p} />)
        }
      </div>
    </section>
  );
};

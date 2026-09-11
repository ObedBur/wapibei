'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, MapPin, Clock, ShieldCheck, Truck, Headset, CheckCircle, ChevronRight, Store, Package, Ban, ArrowLeft } from 'lucide-react';
import { getProductById, getProducts } from '@/features/products/services/product.service';
import { Product } from '@/types/product.types';
import { useCart } from '@/features/cart/context/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from 'sonner';
import { formatDate } from '@/utils/date';
import { ProductImageGallery } from './components/ProductImageGallery';
import { SellerCard } from './components/SellerCard';
import { RelatedProducts } from './components/RelatedProducts';

const EXCHANGE_RATE = 2800;

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { addItem } = useCart();
  const { toggleFavorite, isFavorited } = useWishlist();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isRelatedLoading, setIsRelatedLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      setShowContent(false);
      
      try {
        // Chargement immédiat du produit sans délai artificiel
        const res = await getProductById(id);

        if (res?.success && res.data) {
          setProduct(res.data);
          setShowContent(true);
          setIsLoading(false); // On arrête le loading dès que le produit est là

          // Charger les produits similaires en arrière-plan (non bloquant)
          setIsRelatedLoading(true);
          getProducts({ categoryId: Number(res.data.categoryId), limit: 10 }).then(relRes => {
            if (relRes?.success) {
              setRelated((relRes.data || []).filter(p => p.id !== id));
            }
            setIsRelatedLoading(false);
          });
        } else {
          console.error("Product load failed", res);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading product", err);
        setIsLoading(false);
      }
    };
    load();
  }, [id, router]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addItem(product, 1);
    toast.success(`${product.name} ajouté au panier !`, { icon: '🛒' });
  };

  const handleFavorite = () => {
    if (!product) return;
    const action = toggleFavorite(product);
    if (action === 'added') toast.success('Ajouté aux favoris !', { icon: '⭐️' });
    else toast.success('Retiré des favoris.');
  };

  const isOutOfStock = product?.availability === 'OUT_OF_STOCK' ||
    (product?.stockQuantity !== undefined && product?.stockQuantity === 0);
  const isFav = product ? isFavorited(product.id) : false;
  const fcPrice = product ? Math.round(product.price * EXCHANGE_RATE) : 0;

  // ── LOADING SKELETON ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f172a] animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-32">
          {/* Breadcrumb */}
          <div className="flex gap-2 mb-8">
            {[80, 60, 120].map((w, i) => (
              <div key={i} className={`h-3 bg-gray-200 dark:bg-white/10 rounded w-${w}`} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="aspect-square bg-gray-200 dark:bg-white/10 rounded-3xl" />
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20" />
                <div className="h-10 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                <div className="h-12 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
              </div>
              <div className="h-px bg-gray-100 dark:bg-white/10" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
              </div>
              <div className="h-px bg-gray-100 dark:bg-white/10" />
              <div className="flex gap-4">
                <div className="h-14 bg-gray-200 dark:bg-white/10 rounded-2xl w-32" />
                <div className="h-14 bg-gray-200 dark:bg-white/10 rounded-2xl flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f172a] flex flex-col items-center justify-center p-4 text-center">
        <span className="material-symbols-outlined text-[64px] text-gray-300 mb-4">error</span>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Produit introuvable</h2>
        <p className="text-slate-500 mb-2 max-w-md">Nous n'avons pas pu charger les détails de ce produit.</p>
        <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl text-left text-xs text-gray-500 mb-6 overflow-x-auto max-w-xl w-full">
          <p><strong>ID recherché :</strong> {id}</p>
        </div>
        <button onClick={() => router.push('/products')} className="px-6 py-3 bg-[#E67E22] text-white rounded-xl font-bold">Retour aux produits</button>
      </div>
    );
  }

  const sellerName = product.user?.boutiqueName || product.user?.fullName || 'Vendeur WapiBei';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading || !showContent ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-32"
          >
            {/* Breadcrumb skeleton */}
            <div className="flex gap-2 mb-8">
              <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              {/* Gallery skeleton */}
              <div className="lg:sticky lg:top-28">
                <div className="aspect-square bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse flex items-center justify-center">
                  <Package className="size-20 text-gray-200 dark:text-white/5" />
                </div>
                {/* Thumbnails skeleton */}
                <div className="flex gap-4 mt-6 overflow-hidden">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="size-20 bg-gray-100 dark:bg-white/5 rounded-xl shrink-0 animate-pulse" />
                  ))}
                </div>
              </div>
              
              {/* Info skeleton */}
              <div className="flex flex-col gap-8">
                <div className="space-y-6">
                  <div className="h-6 w-24 bg-[#E67E22]/10 rounded-full animate-pulse" />
                  <div className="h-14 w-full bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
                  <div className="h-20 w-1/3 bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
                </div>
                
                <div className="h-px bg-gray-100 dark:bg-white/5" />
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                    <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                    <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-white/5" />
                
                <div className="h-40 w-full bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse" />
                
                <div className="hidden lg:flex gap-4 mt-auto">
                  <div className="h-14 w-32 bg-gray-100 dark:bg-white/10 rounded-2xl animate-pulse" />
                  <div className="h-14 flex-1 bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
                </div>
              </div>
            </div>

            {/* Related products skeleton */}
            <div className="mt-20 space-y-8">
              <div className="h-8 w-64 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-square bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : product ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 260, 
              duration: 0.4 
            }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 md:pt-8 pb-40 lg:pb-20"
          >
            {/* ── BREADCRUMB ── */}
            <nav className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 md:mb-10 overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-[#E67E22] transition-colors shrink-0">Accueil</Link>
              <ChevronRight className="size-3 shrink-0" />
              <Link href="/products" className="hover:text-[#E67E22] transition-colors shrink-0">Produits</Link>
              <ChevronRight className="size-3 shrink-0" />
              <span className="text-gray-300 shrink-0">{product.categoryId}</span>
              <ChevronRight className="size-3 shrink-0" />
              <span className="text-[#E67E22] truncate max-w-[160px]">{product.name}</span>
            </nav>

            {/* ── HERO GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12 md:mb-20">

              {/* LEFT — Gallery */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                <ProductImageGallery
                  mainImage={product.image}
                  images={product.images}
                  productName={product.name}
                  availability={product.availability}
                />
              </div>

              {/* RIGHT — Product Info */}
              <div className="flex flex-col gap-6">

                {/* Category */}
                <div>
                  <span className="px-3 py-1.5 bg-[#E67E22]/10 text-[#E67E22] text-[10px] font-black uppercase tracking-widest rounded-full">
                    {product.categoryId}
                  </span>
                </div>

                {/* Name */}
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1e293b] dark:text-white leading-[1.05] tracking-tighter">
                    {product.name}
                  </h1>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black text-[#E67E22] tracking-tighter">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-gray-400">
                    ≈ {fcPrice.toLocaleString()} FC
                  </p>
                  {product.unit && (
                    <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
                      Prix par {product.unit}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 dark:bg-white/10" />

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-[12px] text-gray-500">
                    <MapPin className="size-4 text-[#E67E22]" />
                    <span className="font-bold text-[#1e293b] dark:text-gray-200">{product.city}</span>
                  </div>
                  {product.location && (
                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                      <Store className="size-4" />
                      <span className="font-medium truncate">{product.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[12px] text-gray-500">
                    <Clock className="size-4" />
                    <span className="font-medium">Mis à jour {formatDate(product.updatedAt)}</span>
                  </div>
                  {product.stockQuantity !== undefined && product.stockQuantity > 0 && (
                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                      <Package className="size-4 text-emerald-500" />
                      <span className="font-bold text-emerald-600">{product.stockQuantity} unités</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 dark:bg-white/10" />

                {/* Quantity and Actions — Desktop */}
                <div className="hidden lg:flex flex-col gap-4">
                  <div className="flex gap-4">
                    {/* Quantity selector */}
                    {!isOutOfStock && (
                      <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-2xl p-1.5 border border-gray-100 dark:border-white/10 w-32 shrink-0">
                        <button
                          onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="size-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/10 text-[#1e293b] dark:text-white font-black transition-all shadow-sm"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center font-black text-[#1e293b] dark:text-white text-lg">{qty}</span>
                        <button
                          onClick={() => setQty(q => q + 1)}
                          className="size-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/10 text-[#1e293b] dark:text-white font-black transition-all shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 h-14 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98] ${
                        isOutOfStock
                          ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                          : 'bg-[#E67E22] hover:bg-[#d6721b] text-white shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5'
                      }`}
                    >
                      {isOutOfStock ? <Ban className="size-5" /> : <ShoppingCart className="size-5" />}
                      {isOutOfStock ? 'Épuisé' : `Ajouter au panier`}
                    </button>
                  </div>

                  {/* Wishlist Link */}
                  <button
                    onClick={handleFavorite}
                    className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest self-start transition-colors px-2 py-1 ${
                      isFav ? 'text-[#E67E22]' : 'text-gray-400 hover:text-[#1e293b] dark:hover:text-white'
                    }`}
                  >
                    <Heart className={`size-4 ${isFav ? 'fill-current' : ''}`} />
                    {isFav ? 'Retirer des favoris' : 'Ajouter à la liste d\'envies'}
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                  <div className="flex flex-col gap-1 items-start text-left p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <ShieldCheck className="size-5 text-slate-800 dark:text-white" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Paiement Sécurisé</span>
                  </div>
                  <div className="flex flex-col gap-1 items-start text-left p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <Truck className="size-5 text-slate-800 dark:text-white" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Livraison Rapide</span>
                  </div>
                  <div className="flex flex-col gap-1 items-start text-left p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <Headset className="size-5 text-slate-800 dark:text-white" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Support en ligne</span>
                  </div>
                  <div className="flex flex-col gap-1 items-start text-left p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <CheckCircle className="size-5 text-slate-800 dark:text-white" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Qualité Garantie</span>
                  </div>
                </div>

                {/* Seller Card */}
                <SellerCard
                  boutiqueName={product.user?.boutiqueName}
                  fullName={product.user?.fullName}
                  isVerified={product.user?.isVerified}
                  trustScore={product.user?.trustScore}
                  phone={product.user?.phone}
                  avatarUrl={product.user?.avatarUrl}
                  productName={product.name}
                  productPrice={`${product.price}$`}
                  productId={product.id}
                  sellerId={product.user?.id}
                />
              </div>
            </div>

            {/* ── DESCRIPTION ── */}
            {product.description && (
              <section className="max-w-3xl border-t border-gray-100 dark:border-white/10 pt-10 md:pt-16">
                <h2 className="text-[10px] font-black text-[#E67E22] uppercase tracking-[0.3em] mb-3">Description</h2>
                <h3 className="text-xl md:text-2xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
                  À propos de ce produit
                </h3>
                <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {product.description}
                </p>
              </section>
            )}

            {/* ── RELATED PRODUCTS ── */}
            <RelatedProducts products={related} isLoading={isRelatedLoading} />

          </motion.div>
        ) : (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-white dark:bg-[#0f172a] flex flex-col items-center justify-center p-4 text-center"
          >
            <Ban className="size-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Produit introuvable</h2>
            <p className="text-slate-500 mb-6 max-w-md">Nous n'avons pas pu charger les détails de ce produit.</p>
            <button onClick={() => router.push('/products')} className="px-6 py-3 bg-[#E67E22] text-white rounded-xl font-bold flex items-center gap-2">
              <ArrowLeft className="size-5" />
              Retour aux produits
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE FIXED BOTTOM BAR ── */}
      {product && showContent && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 px-4 py-3 safe-area-inset-bottom"
        >
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest truncate">{product.name}</p>
              <p className="text-lg font-black text-[#E67E22]">{formatPrice(product.price)}</p>
            </div>
            <button
              onClick={handleFavorite}
              className={`size-12 shrink-0 rounded-xl flex items-center justify-center border-2 transition-all ${
                isFav
                  ? 'bg-[#E67E22] border-[#E67E22] text-white'
                  : 'border-gray-200 dark:border-white/10 text-gray-400'
              }`}
            >
              <Heart className={`size-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#E67E22] text-white shadow-lg shadow-orange-500/30'
              }`}
            >
              {isOutOfStock ? <Ban className="size-5" /> : <ShoppingCart className="size-5" />}
              {isOutOfStock ? 'Épuisé' : 'Ajouter'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

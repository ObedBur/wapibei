'use client';

import React from 'react';
import { X, Edit2, Trash2, Package, ImageOff, TrendingUp, Tag, Calendar } from 'lucide-react';
import { useT } from '@/i18n/useT';

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    oldPrice?: number | null;
    stock: number;
    maxStock: number;
    status: string;
    categoryName: string;
    unit: string;
    isPublic: boolean;
    image?: string | null;
    updatedAt: string;
}

interface ProductDetailModalProps {
    product: Product | null;
    onClose: () => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    product,
    onClose,
    onEdit,
    onDelete,
}) => {
    const { t } = useT();

    if (!product) return null;

    const stockPercent = product.maxStock > 0
        ? Math.min(100, (product.stock / product.maxStock) * 100)
        : 0;

    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg bg-white dark:bg-[#151b2c] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 size-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Image */}
                <div className="relative w-full aspect-video bg-slate-100 dark:bg-white/5 overflow-hidden">
                    {product.image || product.images?.[0] ? (
                        <img
                            src={product.image || product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300 dark:text-slate-600">
                            <ImageOff size={40} strokeWidth={1.5} />
                            <span className="text-xs font-bold">Aucune image</span>
                        </div>
                    )}

                    {/* Status badge */}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${
                        isOutOfStock
                            ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-300'
                            : isLowStock
                                ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-400/30 dark:bg-orange-500/20 dark:text-orange-300'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300'
                    }`}>
                        {product.status}
                    </span>

                    {/* Visibility badge */}
                    <span className={`absolute top-3 right-12 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${
                        product.isPublic
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                    }`}>
                        {product.isPublic ? t('vendor.products.visibility.public') : t('vendor.products.visibility.draft')}
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Name + category */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Tag size={12} className="text-[#E67E22]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{product.categoryName}</span>
                        </div>
                        <h2 className="text-xl font-black text-[#1e293b] dark:text-white leading-tight">{product.name}</h2>
                        {product.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed line-clamp-2">{product.description}</p>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-black text-[#E67E22]">{product.price}$</span>
                        {product.oldPrice && (
                            <span className="text-sm font-bold text-gray-400 line-through">{product.oldPrice}$</span>
                        )}
                        <span className="text-xs font-bold text-gray-400">≈ {(product.price * 2850).toLocaleString()} FC</span>
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package size={14} className="text-gray-400" />
                                <span className="text-xs font-bold text-gray-500">{t('vendor.products.stock')}</span>
                            </div>
                            <span className={`text-sm font-black ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-[#1e293b] dark:text-white'}`}>
                                {product.stock} {t('vendor.products.pcs')}
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                    isOutOfStock ? 'w-0' : isLowStock ? 'bg-orange-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${stockPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <Calendar size={12} />
                        <span>Mis à jour le {product.updatedAt}</span>
                        <span className="mx-1">·</span>
                        <span>{product.unit}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => { onEdit(product); onClose(); }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1e293b] dark:bg-white text-white dark:text-[#1e293b] rounded-2xl text-sm font-black hover:bg-[#E67E22] dark:hover:bg-[#E67E22] dark:hover:text-white transition-colors"
                        >
                            <Edit2 size={16} />
                            {t('vendor.products.editBtn')}
                        </button>
                        <button
                            onClick={() => { onDelete(product); onClose(); }}
                            className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-red-100 dark:border-red-400/20 text-red-500 rounded-2xl text-sm font-black hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getMyProducts, deleteProduct, restockProduct } from '@/features/products/services/product.service';
import { toast } from 'sonner';
import { useT } from '@/i18n/useT';
import {
    Search, Plus, Edit2,
    Share2, Trash2,
    Globe, ImageOff, ArrowLeft, Package
} from 'lucide-react';

import { AddProductModal } from './components/AddProductModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { RestockModal } from './components/RestockModal';
import PublishDraftsModal from './components/PublishDraftsModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { Pagination } from '@/components/ui/Pagination/Pagination';

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
    const { user } = useAuth();
    const { t } = useT();

    // ── Data ──────────────────────────────────────────────────────────────
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ── Filters ───────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // ── Pagination ────────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Modals ────────────────────────────────────────────────────────────
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [defaultPublicStatus, setDefaultPublicStatus] = useState(true);
    const [detailProduct, setDetailProduct] = useState<any>(null);
    const [restockProductData, setRestockProductData] = useState<any>(null);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [isRestocking, setIsRestocking] = useState(false);

    // ── Fetch ─────────────────────────────────────────────────────────────
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getMyProducts();
            if (response?.success) {
                const data = response.data || [];
                const mappedProducts = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    price: p.price,
                    oldPrice: p.originalPrice || null,
                    originalPrice: p.originalPrice || null,
                    stock: p.stockQuantity || 0,
                    stockQuantity: p.stockQuantity || 0,
                    maxStock: Math.max(p.stockQuantity || 0, 50),
                    updatedAt: new Date(p.updatedAt).toLocaleDateString(),
                    status: p.availability === 'IN_STOCK'
                        ? t('vendor.products.status.inStock')
                        : p.availability === 'LIMITED_STOCK'
                            ? t('vendor.products.status.lowStock')
                            : t('vendor.products.status.outOfStock'),
                    categoryName: p.category?.name || t('vendor.products.categoryDefault'),
                    categoryId: p.categoryId,
                    unit: p.unit || 'Pièce',
                    isPublic: p.isPublic ?? false,
                    image: p.image || null,
                    images: p.images || [],
                }));
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // ── Keyboard Shortcuts ────────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape: clear selection
            if (e.key === 'Escape' && selectedItems.length > 0) {
                setSelectedItems([]);
                return;
            }
            // Ctrl+E: edit selected (if exactly 1)
            if (e.ctrlKey && e.key === 'e' && selectedItems.length === 1) {
                e.preventDefault();
                const product = products.find(p => p.id === selectedItems[0]);
                if (product) handleEdit(product);
            }
            // Delete: delete selected
            if (e.key === 'Delete' && selectedItems.length > 0) {
                // Only if not in an input
                if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
                    // Could trigger bulk delete - for now just clear
                    setSelectedItems([]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItems, products]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const toggleSelect = (id: number) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setIsAddModalOpen(true);
    };

    const handleDelete = (product: any) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            const response = await deleteProduct(productToDelete.id);
            if (response?.success) {
                toast.success(t('vendor.products.deleted'), {
                    style: { background: '#1e293b', color: 'white', border: 'none' },
                });
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error(t('vendor.products.deleteError'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRestock = (product: any) => {
        setRestockProductData(product);
        setIsRestockModalOpen(true);
    };

    const confirmRestock = async (quantity: number) => {
        if (!restockProductData) return;
        setIsRestocking(true);
        try {
            const response = await restockProduct(restockProductData.id, quantity);
            if (response?.success) {
                toast.success(t('vendor.products.restock.success') || 'Stock réapprovisionné avec succès', {
                    style: { background: '#1e293b', color: 'white', border: 'none' },
                });
                setIsRestockModalOpen(false);
                setRestockProductData(null);
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Erreur lors du réapprovisionnement:', error);
            toast.error(t('vendor.products.restock.error') || 'Erreur lors du réapprovisionnement');
        } finally {
            setIsRestocking(false);
        }
    };

    // ── Computed ──────────────────────────────────────────────────────────
    const filterAll = t('vendor.products.filterAll');
    const uniqueCategories = useMemo(() => [filterAll, ...Array.from(new Set(products.map(p => p.categoryName)))], [products, filterAll]);

    // Reset to page 1 when filters change
    const handleSearchChange = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
    const handleCategoryChange = (v: string) => { setSelectedCategory(v); setCurrentPage(1); };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || selectedCategory === filterAll || p.categoryName === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory, filterAll]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    ), [filteredProducts, currentPage]);

    // ── Skeleton ──────────────────────────────────────────────────────────
    const SkeletonRow = () => (
        <div className="flex items-center gap-4 bg-white dark:bg-[#151b2c] rounded-2xl px-4 py-3 animate-pulse">
            <div className="size-12 shrink-0 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="flex-1 space-y-2 min-w-0">
                <div className="h-2 w-1/5 rounded-full bg-slate-200 dark:bg-white/10" />
                <div className="h-4 w-2/5 rounded-lg bg-slate-200 dark:bg-white/10" />
            </div>
            <div className="hidden sm:flex items-center gap-6">
                <div className="h-4 w-14 rounded-lg bg-slate-200 dark:bg-white/10" />
                <div className="h-4 w-10 rounded-lg bg-slate-200 dark:bg-white/10" />
            </div>
            <div className="flex items-center gap-2">
                <div className="h-9 w-20 rounded-lg bg-slate-200 dark:bg-white/10" />
                <div className="size-9 rounded-lg bg-slate-200 dark:bg-white/10" />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-32 px-4">

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pt-2">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-[#E67E22] hover:text-white transition-all"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="space-y-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-[#1e293b] dark:text-white tracking-tighter">
                            {t('vendor.products.title')}
                        </h2>
                        <p className="text-[10px] sm:text-xs font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-widest">
                            {t('vendor.products.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full sm:max-w-[350px] group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 size-4 group-focus-within:text-[#E67E22] transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={t('vendor.products.search')}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 text-xs font-bold focus:outline-none focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-1 focus:ring-[#E67E22]/20 transition-all"
                    />
                </div>
            </div>

            {/* ── FILTER BAR ─────────────────────────────────────────────── */}
            <div className="relative">
                <div className="flex flex-row items-center gap-3 bg-white dark:bg-[#151b2c] p-2 sm:p-3 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 overflow-hidden">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 flex-1 scrollbar-hide">
                        {uniqueCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat as string)}
                                className={`shrink-0 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                                    (selectedCategory === cat) || (cat === filterAll && !selectedCategory)
                                        ? 'bg-[#E67E22] text-white shadow-md shadow-orange-500/10'
                                        : 'bg-transparent text-[#64748b] hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                            >
                                {cat as string}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Fade indicators for scroll */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-[#151b2c] to-transparent pointer-events-none sm:hidden" />
            </div>

            {/* ── CTA BUTTONS ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-3">
                <button
                    onClick={() => { setEditingProduct(null); setDefaultPublicStatus(false); setIsAddModalOpen(true); }}
                    className="flex items-center justify-center gap-2 sm:gap-3 bg-[#E67E22] text-white px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-sm shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span className="truncate">{t('vendor.products.newProduct')}</span>
                </button>

                <button
                    onClick={() => setIsPublishModalOpen(true)}
                    className="flex items-center justify-center gap-2 sm:gap-3 bg-[#1e293b] dark:bg-white text-white dark:text-[#1e293b] px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-sm shadow-xl hover:-translate-y-1 transition-all active:scale-95 border border-white/10"
                >
                    <Globe size={18} />
                    <span className="truncate">{t('vendor.products.publishDrafts')}</span>
                </button>
            </div>

            {/* ── PRODUCTS LIST ───────────────────────────────────────────── */}
            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="size-20 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                        <Search size={32} />
                    </div>
                    <h3 className="text-xl font-black text-[#1e293b] dark:text-white tracking-tight mb-2">
                        {t('vendor.products.empty')}
                    </h3>
                    <p className="text-sm font-bold text-gray-400 mb-6">{t('vendor.products.emptyDesc')}</p>
                    <button
                        onClick={() => { setEditingProduct(null); setDefaultPublicStatus(false); setIsAddModalOpen(true); }}
                        className="flex items-center gap-2 bg-[#E67E22] text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-[#d35400] hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        {t('vendor.products.newProduct')}
                    </button>
                </div>
            ) : (
                <>
                    {/* Table header (desktop only) */}
                    <div className="hidden sm:grid grid-cols-[auto_1fr_120px_80px_80px_auto] items-center gap-4 px-4 py-2">
                        <div className="w-12" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Produit</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Prix</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Statut</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</span>
                    </div>

                    <ul className="flex flex-col gap-2">
                        {paginatedProducts.map((product) => (
                            <li
                                key={product.id}
                                onClick={() => setDetailProduct(product)}
                                className="group cursor-pointer bg-white dark:bg-[#151b2c] rounded-2xl border-2 border-transparent hover:border-[#E67E22]/20 hover:shadow-lg transition-all duration-200"
                            >
                                {/* Desktop row */}
                                <div className="hidden sm:grid grid-cols-[auto_1fr_120px_80px_80px_auto] items-center gap-4 px-4 py-3">
                                    {/* Image */}
                                    <div className="size-12 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5">
                                        {product.image || product.images?.[0]
                                            ? <img src={product.image || product.images?.[0]} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                                            : <div className="flex h-full w-full items-center justify-center text-slate-300"><ImageOff size={18} strokeWidth={1.5} /></div>
                                        }
                                    </div>

                                    {/* Name + category */}
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                                            {product.categoryName}
                                        </p>
                                        <h3 className="text-sm font-black text-[#1e293b] dark:text-white truncate group-hover:text-[#E67E22] transition-colors">
                                            {product.name}
                                        </h3>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <p className="text-sm font-black text-[#E67E22]">{product.price}$</p>
                                        {product.oldPrice && (
                                            <p className="text-[10px] font-bold text-gray-400 line-through">{product.oldPrice}$</p>
                                        )}
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            {product.stock <= 0 ? (
                                                <span className="text-red-500 text-[9px] font-black">✕</span>
                                            ) : product.stock <= 5 ? (
                                                <span className="text-orange-500 text-[9px] font-black">⚠</span>
                                            ) : (
                                                <span className="text-green-500 text-[9px] font-black">●</span>
                                            )}
                                            <p className={`text-sm font-black ${product.stock <= 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-500' : 'text-[#1e293b] dark:text-white'}`}>
                                                {product.stock}
                                            </p>
                                        </div>
                                        <p className="text-[9px] font-bold text-gray-400">{t('vendor.products.pcs')}</p>
                                    </div>

                                    {/* Status / visibility */}
                                    <div className="flex flex-col gap-1">
                                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wide ${
                                            product.isPublic
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                                                : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                                        }`}>
                                            {product.isPublic ? t('vendor.products.visibility.public') : t('vendor.products.visibility.draft')}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        {product.stock <= 0 && (
                                            <button
                                                onClick={() => handleRestock(product)}
                                                aria-label={`Réapprovisionner ${product.name}`}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-[#E67E22] text-white rounded-lg text-[11px] font-black hover:bg-[#d35400] transition-colors"
                                            >
                                                <Package size={13} />
                                                {t('vendor.products.restock.btn') || 'Stock'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(product)}
                                            aria-label={`Modifier ${product.name}`}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-[#1e293b] dark:bg-white text-white dark:text-[#1e293b] rounded-lg text-[11px] font-black hover:bg-[#E67E22] dark:hover:bg-[#E67E22] dark:hover:text-white transition-colors"
                                        >
                                            <Edit2 size={13} />
                                            {t('vendor.products.editBtn')}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            aria-label={`Supprimer ${product.name}`}
                                            className="size-9 flex items-center justify-center rounded-lg border border-red-100 dark:border-red-400/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile row */}
                                <div className="sm:hidden flex items-center gap-3 px-4 py-3">
                                    {/* Image */}
                                    <div className="size-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5">
                                        {product.image || product.images?.[0]
                                            ? <img src={product.image || product.images?.[0]} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                                            : <div className="flex h-full w-full items-center justify-center text-slate-300"><ImageOff size={16} strokeWidth={1.5} /></div>
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">{product.categoryName}</p>
                                        <h3 className="text-sm font-black text-[#1e293b] dark:text-white truncate group-hover:text-[#E67E22] transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-sm font-black text-[#E67E22]">{product.price}$</span>
                                            <span className="text-[9px] font-bold text-gray-400">{product.stock} {t('vendor.products.pcs')}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        {product.stock <= 0 && (
                                            <button
                                                onClick={() => handleRestock(product)}
                                                aria-label={`Réapprovisionner ${product.name}`}
                                                title="Réapprovisionner"
                                                className="flex items-center gap-1.5 px-2 py-1.5 bg-[#E67E22] text-white rounded-lg text-[10px] font-black hover:bg-[#d35400] transition-colors"
                                            >
                                                <Package size={12} />
                                                Stock
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(product)}
                                            aria-label={`Modifier ${product.name}`}
                                            title="Modifier"
                                            className="flex items-center gap-1.5 px-2 py-1.5 bg-[#1e293b] dark:bg-white text-white dark:text-[#1e293b] rounded-lg text-[10px] font-black hover:bg-[#E67E22] dark:hover:bg-[#E67E22] dark:hover:text-white transition-colors"
                                        >
                                            <Edit2 size={12} />
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            aria-label={`Supprimer ${product.name}`}
                                            title="Supprimer"
                                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-red-100 dark:border-red-400/20 text-red-500 text-[10px] font-black hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <Trash2 size={12} />
                                            Suppr.
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredProducts.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        itemsOnPage={paginatedProducts.length}
                    />
                </>
            )}

            {/* ── BULK ACTIONS (FLOATING) ─────────────────────────────────── */}
            {selectedItems.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-20 duration-500">
                    <div 
                        role="toolbar" 
                        aria-label="Actions sur la sélection"
                        className="bg-[#1e293b] dark:bg-white text-white dark:text-[#1e293b] px-10 py-6 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] flex items-center gap-10 backdrop-blur-xl border border-white/10"
                    >
                        <div className="flex items-center gap-5 pr-10 border-r border-white/20">
                            <div className="size-10 bg-[#E67E22] rounded-2xl flex items-center justify-center font-black">
                                {selectedItems.length}
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">{t('vendor.products.selected')}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <button 
                                tabIndex={0}
                                title="Modifier la sélection (Ctrl+E)"
                                className="flex items-center gap-3 hover:text-[#E67E22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E67E22]/50 rounded-lg px-2 py-1"
                            >
                                <Edit2 size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{t('vendor.products.edit')}</span>
                            </button>
                            <button 
                                tabIndex={0}
                                title="Supprimer la sélection (Suppr)"
                                className="flex items-center gap-3 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded-lg px-2 py-1"
                            >
                                <Trash2 size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{t('vendor.products.delete')}</span>
                            </button>
                            <button 
                                tabIndex={0}
                                title="Exporter la sélection"
                                className="flex items-center gap-3 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-lg px-2 py-1"
                            >
                                <Share2 size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{t('vendor.products.export')}</span>
                            </button>
                            <button
                                onClick={() => setSelectedItems([])}
                                tabIndex={0}
                                title="Annuler la sélection (Échap)"
                                className="ml-4 px-6 py-3 bg-white/10 dark:bg-black/5 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-white/30"
                            >
                                {t('vendor.products.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODALS ──────────────────────────────────────────────────── */}
            <ProductDetailModal
                product={detailProduct}
                onClose={() => setDetailProduct(null)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                onProductAdded={fetchDashboardData}
                product={editingProduct}
                defaultPublic={defaultPublicStatus}
            />

            <PublishDraftsModal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                onPublished={fetchDashboardData}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setProductToDelete(null); }}
                onConfirm={confirmDelete}
                itemName={productToDelete?.name || ''}
                isDeleting={isDeleting}
            />

            <RestockModal
                isOpen={isRestockModalOpen}
                onClose={() => { setIsRestockModalOpen(false); setRestockProductData(null); }}
                onConfirm={confirmRestock}
                productName={restockProductData?.name || ''}
                currentStock={restockProductData?.stock || 0}
                isRestocking={isRestocking}
            />
        </div>
    );
}

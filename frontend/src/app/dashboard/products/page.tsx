'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMyProducts, deleteProduct } from '@/features/products/services/product.service';
import { toast } from 'sonner';
import { useT } from '@/i18n/useT';
import {
    Search, MapPin, MessageCircle, UserPlus, Heart,
    ChevronDown, GitCompare, Plus, Package, Eye,
    TrendingUp, MoreVertical, Edit2, Clock,
    AlertCircle, CheckCircle2, LayoutGrid, List,
    Share2, Trash2, Copy, ExternalLink, Filter,
    ArrowUpRight, Download, X, Globe, ImageOff
} from 'lucide-react';

import { AddProductModal } from './components/AddProductModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import PublishDraftsModal from './components/PublishDraftsModal';

export default function ProductsPage() {
    const { user } = useAuth();
    const { t } = useT();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(t('vendor.products.filterAll'));
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [defaultPublicStatus, setDefaultPublicStatus] = useState(true);
    const [stats, setStats] = useState([
        { label: t('vendor.products.stats.revenue'), value: '0$', trend: '0%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: t('vendor.products.stats.activeProducts'), value: '0', trend: t('vendor.products.trend.shop'), icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: t('vendor.products.stats.totalStock'), value: '0', trend: t('vendor.products.trend.units'), icon: ArrowUpRight, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    ]);

    const fetchDashboardData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Appeler spécifiquement l'endpoint des produits du vendeur (basé sur son Token)
            const response = await getMyProducts();

            if (response?.success) {
                const data = response.data || [];
                // Map API data to our UI format
                const mappedProducts = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    price: p.price,
                    oldPrice: p.originalPrice || null,
                    originalPrice: p.originalPrice || null,
                    stock: p.stockQuantity || 0,
                    stockQuantity: p.stockQuantity || 0,
                    maxStock: 500,
                    updatedAt: new Date(p.updatedAt).toLocaleDateString(),
                    status: p.availability === 'IN_STOCK' ? t('vendor.products.status.inStock') : (p.availability === 'LIMITED_STOCK' ? t('vendor.products.status.lowStock') : t('vendor.products.status.outOfStock')),
                    categoryName: p.category?.name || t('vendor.products.categoryDefault'),
                    categoryId: p.categoryId,
                    unit: p.unit || 'Pièce',
                    isPublic: p.isPublic ?? false,
                    image: p.image || null,
                    images: p.images || [],
                }));
                setProducts(mappedProducts);

                setStats([
                    { label: t('vendor.products.stats.revenue'), value: '0$', trend: '0%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: t('vendor.products.stats.activeProducts'), value: mappedProducts.length.toString(), trend: t('vendor.products.trend.yours'), icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: t('vendor.products.stats.totalStock'), value: mappedProducts.reduce((acc: number, curr: any) => acc + curr.stock, 0).toString(), trend: t('vendor.products.trend.yours'), icon: ArrowUpRight, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                ]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des produits du vendeur:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

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

    // --- COMPUTED FILTERS ---
    const uniqueCategories = [t('vendor.products.filterAll'), ...Array.from(new Set(products.map(p => p.categoryName)))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === t('vendor.products.filterAll') || p.categoryName === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-7xl mx-auto pb-32 px-4">

            {/* --- TOP NAV ACTIONS --- */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#1e293b] dark:text-white tracking-tighter">{t('vendor.products.title')}</h2>
                    <p className="text-[10px] sm:text-xs font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-widest">{t('vendor.products.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* search bar */}
                    <div className="relative w-full sm:max-w-[350px] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 size-4 group-focus-within:text-[#E67E22] transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('vendor.products.search')}
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 text-xs font-bold focus:outline-none focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-1 focus:ring-[#E67E22]/20 transition-all sm:rounded-xl"
                        />
                    </div>
                </div>
            </div>



            {/* --- FILTER BAR - Refined --- */}
            <div className="flex flex-row items-center gap-3 bg-white dark:bg-[#151b2c] p-2 sm:p-3 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 overflow-hidden">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 flex-1 scrollbar-hide">
                    {uniqueCategories.map((cat, i) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat as string)}
                            className={`shrink-0 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-[#E67E22] text-white shadow-md shadow-orange-500/10' : 'bg-transparent text-[#64748b] hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}>
                            {cat as string}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button className="flex items-center gap-2 px-3 sm:px-6 py-3 bg-gray-50 dark:bg-white/5 text-[#1e293b] dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all">
                        <Filter size={14} className="text-[#E67E22]" />
                        <span className="hidden sm:inline">{t('vendor.products.filter')}</span>
                    </button>
                    <div className="h-6 sm:h-8 w-px bg-gray-100 dark:bg-white/10" />
                    <div className="flex gap-1">
                        <button className="p-2 sm:p-3 rounded-lg text-gray-400 hover:text-[#1e293b] dark:hover:text-white transition-all"><LayoutGrid size={18} /></button>
                        <button className="hidden sm:block p-3 rounded-lg text-gray-400 hover:text-[#1e293b] dark:hover:text-white transition-all"><List size={18} /></button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-3">
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setDefaultPublicStatus(false);
                        setIsAddModalOpen(true);
                    }}
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
            {/* --- PRODUCTS GRID --- */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 relative ${filteredProducts.length === 0 ? 'min-h-[300px]' : ''}`}>
                {filteredProducts.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div className="size-20 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-gray-400 mb-6">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-black text-[#1e293b] dark:text-white tracking-tight mb-2">{t('vendor.products.empty')}</h3>
                        <p className="text-sm font-bold text-gray-500">{t('vendor.products.emptyDesc')}</p>
                    </div>
                )}

                {filteredProducts.map((product) => (
                    <article
                        key={product.id}
                        className={`group relative bg-white dark:bg-[#151b2c] rounded-2xl p-3 sm:p-4 border-2 transition-all duration-300 ${selectedItems.includes(product.id) ? 'border-[#E67E22] ring-2 ring-[#E67E22]/10' : 'border-transparent hover:shadow-xl'
                            }`}
                    >
                        <button
                            type="button"
                            onClick={() => toggleSelect(product.id)}
                            aria-label={`Sélectionner ${product.name}`}
                            title={`Sélectionner ${product.name}`}
                            className={`absolute right-3 top-3 z-20 size-7 rounded-lg flex items-center justify-center transition-all border-2 ${selectedItems.includes(product.id) ? 'bg-[#E67E22] border-[#E67E22] text-white shadow-lg shadow-orange-500/30' : 'bg-white/90 dark:bg-[#151b2c]/90 border-gray-200 dark:border-white/15 text-[#1e293b] dark:text-white hover:border-[#E67E22]'
                                }`}
                        >
                            <CheckCircle2 size={selectedItems.includes(product.id) ? 15 : 0} />
                            {!selectedItems.includes(product.id) && <span className="size-2 rounded-sm border border-current" aria-hidden="true" />}
                        </button>

                        <div className="flex gap-3 sm:block">
                            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-[#f1f5f9] dark:bg-white/5 sm:mb-4 sm:w-full sm:aspect-square sm:h-auto">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 text-center text-slate-400 dark:text-slate-500">
                                        <ImageOff className="size-6" strokeWidth={1.7} aria-hidden="true" />
                                        <span className="text-[9px] font-bold leading-tight">Image indisponible</span>
                                    </div>
                                )}

                                <span className={`absolute bottom-1.5 left-1.5 max-w-[calc(100%-12px)] truncate rounded-md border px-1.5 py-1 text-[8px] font-black uppercase tracking-wide ${product.status === t('vendor.products.status.outOfStock') ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-100' :
                                    product.status === t('vendor.products.status.lowStock') ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-400/30 dark:bg-orange-500/20 dark:text-orange-100' :
                                        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-100'
                                    }`}>
                                    {product.status}
                                </span>
                            </div>

                            <div className="min-w-0 flex-1 sm:flex sm:min-h-[148px] sm:flex-col">
                                <div className="mb-2 min-w-0 pr-8 sm:pr-0">
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <span className="size-1.5 rounded-full bg-[#E67E22]" aria-hidden="true" />
                                        <p className="text-[9px] font-black uppercase tracking-wide text-[#64748b]">
                                            {product.isPublic ? t('vendor.products.visibility.public') : t('vendor.products.visibility.draft')}
                                        </p>
                                    </div>
                                    <h3 className="line-clamp-2 text-[15px] font-black leading-tight text-[#1e293b] transition-colors group-hover:text-[#E67E22] dark:text-white">
                                        {product.name}
                                    </h3>
                                </div>

                                <div className="mb-3">
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                        <span className="text-lg font-black leading-none text-[#E67E22]">{product.price}$</span>
                                        {product.oldPrice && (
                                            <span className="text-xs font-bold text-gray-400 line-through decoration-orange-500/40">{product.oldPrice}$</span>
                                        )}
                                    </div>
                                    <span className="mt-1 block text-[10px] font-bold text-[#64748b]">
                                        ≈ {(product.price * 2850).toLocaleString()} FC
                                    </span>
                                </div>

                                <div className="mt-auto space-y-1.5 border-t border-gray-100 pt-2.5 dark:border-white/5">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-[#64748b]">
                                        <span>{t('vendor.products.stock')}</span>
                                        <span className={product.stock <= 5 ? 'font-black text-red-500' : 'font-black text-[#1e293b] dark:text-white'}>
                                            {product.stock} {t('vendor.products.pcs')}
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${product.stock === 0 ? 'w-0' : product.stock <= 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${product.maxStock > 0 ? Math.min(100, (product.stock / product.maxStock) * 100) : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 border-t border-gray-100 pt-3 dark:border-white/5">
                            <button
                                type="button"
                                onClick={() => handleEdit(product)}
                                className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#1e293b] px-3 text-[11px] font-black text-white transition-colors hover:bg-[#E67E22] dark:bg-white dark:text-[#1e293b]"
                            >
                                <Edit2 size={14} aria-hidden="true" />
                                <span>{t('vendor.products.editBtn')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(product)}
                                aria-label={`${t('vendor.products.delete')} ${product.name}`}
                                title={`${t('vendor.products.delete')} ${product.name}`}
                                className="flex size-10 items-center justify-center rounded-lg border border-red-100 text-red-600 transition-colors hover:bg-red-500 hover:text-white dark:border-red-400/25 dark:text-red-300"
                            >
                                <Trash2 size={15} aria-hidden="true" />
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {/* --- BULK ACTIONS (FLOATING) --- */}
            {selectedItems.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-20 duration-500">
                    <div className="bg-[#1e293b] dark:bg-white text-white dark:text-[#1e293b] px-10 py-6 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] flex items-center gap-10 backdrop-blur-xl border border-white/10">
                        <div className="flex items-center gap-5 pr-10 border-r border-white/20">
                            <div className="size-10 bg-[#E67E22] rounded-2xl flex items-center justify-center font-black">
                                {selectedItems.length}
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">{t('vendor.products.selected')}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-3 hover:text-[#E67E22] transition-colors"><Edit2 size={18} /><span className="text-[11px] font-black uppercase tracking-widest">{t('vendor.products.edit')}</span></button>
                            <button className="flex items-center gap-3 hover:text-red-500 transition-colors"><Trash2 size={18} /><span className="text-[11px] font-black uppercase tracking-widest">{t('vendor.products.delete')}</span></button>
                            <button className="flex items-center gap-3 hover:text-blue-400 transition-colors"><Share2 size={18} /><span className="text-[11px] font-black uppercase tracking-widest">{t('vendor.products.export')}</span></button>
                            <button
                                onClick={() => setSelectedItems([])}
                                className="ml-4 px-6 py-3 bg-white/10 dark:bg-black/5 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                {t('vendor.products.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PAGINATION --- */}
            <div className="mt-10 flex flex-col items-center gap-6 pb-20">
                <button className="px-20 py-7 bg-white dark:bg-[#151b2c] text-[#1e293b] dark:text-white border-4 border-gray-50 dark:border-white/5 font-black text-sm uppercase tracking-[0.3em] rounded-full hover:shadow-2xl hover:scale-105 transition-all active:scale-95">
                    {t('vendor.products.loadHistory')}
                </button>
            </div>
            {/* --- ADD PRODUCT MODAL --- */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                }}
                onProductAdded={fetchDashboardData}
                product={editingProduct}
                defaultPublic={defaultPublicStatus}
            />

            {/* --- PUBLISH DRAFTS MODAL --- */}
            <PublishDraftsModal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                onPublished={fetchDashboardData}
            />

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setProductToDelete(null);
                }}
                onConfirm={confirmDelete}
                itemName={productToDelete?.name || ''}
                isDeleting={isDeleting}
            />
        </div>
    );
}

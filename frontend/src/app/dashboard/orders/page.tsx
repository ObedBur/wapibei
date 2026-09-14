'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getVendorOrders, updateOrderStatus } from '@/features/vendors/services/orders.service';
import { Search, Filter, Package, ArrowLeft } from 'lucide-react';
import { OrderCard } from './components/OrderCard';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/i18n/useT';
import { Pagination } from '@/components/ui/Pagination/Pagination';

// --- PAGE PRINCIPALE ---
const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
    const { showToast } = useToast();
    const { t } = useT();
    const [activeTab, setActiveTab] = useState<string>(t('vendor.orders.tabs.all'));
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const statusLabels: Record<string, string> = {
        PENDING: t('vendor.orders.tabs.pending'),
        CONFIRMED: t('vendor.orders.tabs.confirmed'),
        SHIPPED: t('vendor.orders.tabs.shipped'),
        DELIVERED: t('vendor.orders.tabs.delivered'),
        CANCELLED: t('vendor.orders.tabs.cancelled')
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getVendorOrders();
                if (response?.success) {
                    setOrders(response.data || []);
                }
            } catch (error) {
                console.error("Erreur de récupération des commandes:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesTab = activeTab === t('vendor.orders.tabs.all') || (statusLabels[order.status] || order.status) === activeTab;
        const searchStr = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || 
                              order.id.toLowerCase().includes(searchStr) || 
                              (order.customerName || '').toLowerCase().includes(searchStr) ||
                              (order.product?.name || '').toLowerCase().includes(searchStr);
        return matchesTab && matchesSearch;
    });

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const tabs = [t('vendor.orders.tabs.all'), t('vendor.orders.tabs.pending'), t('vendor.orders.tabs.confirmed'), t('vendor.orders.tabs.shipped'), t('vendor.orders.tabs.delivered'), t('vendor.orders.tabs.cancelled')];
    const getTabCount = (tab: string) => {
        if (tab === t('vendor.orders.tabs.all')) return orders.length;
        return orders.filter(o => statusLabels[o.status] === tab).length;
    };

    const handleTabChange = (tab: string) => { setActiveTab(tab); setCurrentPage(1); };
    const handleSearchChange = (v: string) => { setSearchQuery(v); setCurrentPage(1); };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20 px-4 sm:px-10 pt-4 sm:pt-8 space-y-6 sm:space-y-12">

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={async (newStatus) => {
                        try {
                            const res = await updateOrderStatus(selectedOrder.id, newStatus);
                            if (res?.success) {
                                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
                                showToast(t('vendor.orders.statusUpdated'), "success");
                            }
                        } catch (error) {
                            console.error("Erreur", error);
                            showToast(t('vendor.orders.updateError'), "error");
                        }
                    }}
                />
            )}

            {/* HEADER COMPACT */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-[#E67E22] hover:text-white transition-all"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-black text-deep-blue dark:text-white uppercase tracking-tighter leading-none">
                            {t('vendor.orders.title')} <span className="text-[#E67E22]">{t('vendor.orders.titleHighlight')}</span>
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">
                            {t('vendor.orders.subtitle')}
                        </p>
                    </div>
                </div>

                <div className="relative w-full sm:w-80 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={14} className="text-[#E67E22] group-focus-within:scale-110 transition-transform" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('vendor.orders.search')}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 rounded-2xl px-10 py-3.5 text-[10px] font-black uppercase tracking-widest text-[#E67E22] placeholder-gray-300 dark:placeholder-gray-500 shadow-sm focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] outline-none transition-all"
                    />
                </div>
            </div>

            {/* FILTERS COMPACT WITH FADE */}
            <div className="relative z-30 bg-white/95 dark:bg-[#0f172a]/95 p-1.5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 flex items-center justify-between gap-1 overflow-hidden">
                <div className="relative flex-1 flex items-center overflow-hidden">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-1 no-scrollbar flex-1 scroll-smooth">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`shrink-0 px-5 py-2.5 sm:py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${activeTab === tab
                                    ? 'bg-[#E67E22] text-white shadow-xl shadow-orange-500/30'
                                    : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <span>{tab}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                                    {getTabCount(tab)}
                                </span>
                            </button>
                        ))}
                        {/* PADDING AT END FOR SCROLL */}
                        <div className="shrink-0 w-10 h-1" />
                    </div>
                    {/* FADE EFFECT */}
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-[#0f172a] via-transparent to-transparent pointer-events-none z-10" />
                </div>

                <button className="relative z-20 size-11 sm:size-12 shrink-0 flex items-center justify-center bg-[#E67E22]/10 text-[#E67E22] rounded-full hover:bg-[#E67E22] hover:text-white transition-all border border-[#E67E22]/20 mr-1 shadow-sm">
                    <Filter size={16} />
                </button>
            </div>

            {/* LIST SECTION */}
            <div className="w-full">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm animate-pulse space-y-4">
                                {/* Header: image + customer */}
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-2/3 rounded-lg bg-slate-200 dark:bg-white/10" />
                                        <div className="h-2 w-1/3 rounded-full bg-slate-100 dark:bg-white/5" />
                                    </div>
                                    <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-white/10" />
                                </div>
                                {/* Product line */}
                                <div className="h-2 w-3/4 rounded-full bg-slate-100 dark:bg-white/5" />
                                {/* Price + date */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
                                    <div className="h-5 w-16 rounded-lg bg-slate-200 dark:bg-white/10" />
                                    <div className="h-3 w-20 rounded-full bg-slate-100 dark:bg-white/5" />
                                </div>
                                {/* Button */}
                                <div className="h-10 w-full rounded-2xl bg-slate-100 dark:bg-white/5" />
                            </div>
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-16 text-center border border-gray-100 dark:border-white/5 shadow-sm mt-12">
                            <Package className="mx-auto size-16 text-gray-200 dark:text-white/5 mb-6" />
                            <h3 className="text-xl font-black text-deep-blue dark:text-white mb-2">{t('vendor.orders.noOrders')}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('vendor.orders.noOrdersFilter')}</p>
                        </div>
                    ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
                                {paginatedOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        id={order.id.substring(0, 8).toUpperCase()}
                                        originalId={order.id}
                                        customer={order.customerName || t('vendor.orders.anonymousClient')}
                                        customerPhone={order.customerPhone}
                                        status={order.status}
                                        total={order.totalPrice}
                                        date={new Date(order.createdAt).toLocaleDateString()}
                                        productName={order.product?.name || t('vendor.orders.unknownProduct')}
                                        productImage={order.product?.image || order.product?.images?.[0]}
                                        count={Math.max(1, Math.round(order.totalPrice / (order.product?.price || order.totalPrice || 1)))}
                                        onViewDetails={() => setSelectedOrder(order)}
                                        onStatusChange={async (newStatus) => {
                                            try {
                                                const res = await updateOrderStatus(order.id, newStatus);
                                                if (res?.success) {
                                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                                                    showToast(t('vendor.orders.statusUpdated'), "success");
                                                }
                                            } catch (error) {
                                                console.error("Erreur lors de la mise à jour du statut", error);
                                                showToast(t('vendor.orders.updateError'), "error");
                                            }
                                        }}
                                    />
                                ))}
                    </div>
                )}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredOrders.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemsOnPage={paginatedOrders.length}
                />
            </div>
        </div>
    );
}
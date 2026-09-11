import React from 'react';
import { Package, CheckCircle, Truck, ChevronRight, MessageCircle, AlertCircle, FileText } from 'lucide-react';
import { useT } from '@/i18n/useT';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;

export interface OrderCardProps {
    id: string;
    originalId: string;
    status: OrderStatus;
    total: number;
    date: string;
    count: number;
    customer: string;
    customerPhone?: string;
    productName: string;
    productImage?: string;
    onStatusChange?: (newStatus: string) => void;
    onViewDetails?: () => void;
}

export function OrderCard({ id, originalId, status, total, date, count, customer, customerPhone, productName, productImage, onStatusChange, onViewDetails }: OrderCardProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const { t } = useT();

    const isPending = status === 'PENDING';
    const isConfirmed = status === 'CONFIRMED';
    const isShipped = status === 'SHIPPED';
    const isDelivered = status === 'DELIVERED';
    const isCancelled = status === 'CANCELLED';
    const whatsappMessage = encodeURIComponent(
        `Bonjour ${customer}, je vous contacte au sujet de votre commande WapiBei #${id} pour « ${productName} » (${total} $).`,
    );
    const whatsappUrl = customerPhone
        ? `https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${whatsappMessage}`
        : undefined;

    const statusLabels: Record<string, string> = {
        PENDING: t('vendor.orderCard.status.pending'),
        CONFIRMED: t('vendor.orderCard.status.confirmed'),
        SHIPPED: t('vendor.orderCard.status.shipped'),
        DELIVERED: t('vendor.orderCard.status.delivered'),
        CANCELLED: t('vendor.orderCard.status.cancelled')
    };

    const statusStyles: Record<string, string> = {
        PENDING: 'bg-orange-50 text-[#E67E22] border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
        CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
        SHIPPED: 'bg-[#F0FDF4] text-[#2D5A27] border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
        DELIVERED: 'bg-[#F0FDF4] text-[#2D5A27] border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/40',
        CANCELLED: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    };

    const handleAction = async (newStatus: string) => {
        if (!onStatusChange) return;
        setIsLoading(true);
        try {
            await onStatusChange(newStatus);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="group relative bg-white dark:bg-[#0f172a] rounded-3xl p-4 lg:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900/30 transition-all duration-300 flex flex-col">
            {/* Glow décoratif discret au hover */}
            <div className="absolute -inset-px bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity pointer-events-none" />

            {/* HEADER */}
            <div className="flex items-start justify-between gap-2 mb-4 w-full">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 flex items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10 text-[#E67E22] dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 shrink-0">
                        <Package size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                            <span className="text-[11px] sm:text-xs font-black text-deep-blue dark:text-white uppercase tracking-tight">{t('vendor.orders.order')}</span>
                            <span className="text-[11px] sm:text-xs font-black text-[#E67E22] truncate">#{id}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{date}</p>
                    </div>
                </div>

                <div className={`px-2.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${statusStyles[status] || statusStyles['PENDING']}`}>
                    {isPending && (
                        <span className="flex size-1.5 relative shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full size-1.5 bg-orange-500"></span>
                        </span>
                    )}
                    {isConfirmed && <CheckCircle size={12} className="shrink-0" />}
                    {isShipped && <Truck size={12} className="shrink-0" />}
                    {isDelivered && <CheckCircle size={12} className="shrink-0" />}
                    {isCancelled && <AlertCircle size={12} className="shrink-0" />}
                    <span className="hidden sm:inline-block truncate max-w-[80px]">{statusLabels[status] || status}</span>
                </div>
            </div>

            {/* PRODUIT & CLIENT (Simplified) */}
            <div className="flex items-center gap-3 mb-5 mt-2 min-w-0">
                <div className="size-12 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {productImage ? (
                        <img src={productImage} alt={productName} className="size-full object-cover" />
                    ) : (
                        <Package size={18} className="text-gray-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-deep-blue dark:text-white truncate text-sm leading-tight">
                        {productName}
                    </h5>
                    <div className="mt-1 flex items-center gap-2 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <span>{count}x</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[#E67E22]">${total}</span>
                    </div>
                </div>
            </div>

            {/* INFO CLIENT COMPACT */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-white/5 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[9px] font-black shrink-0">
                        {customer.charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">{customer}</p>
                </div>
                <button
                    onClick={onViewDetails}
                    className="text-[10px] font-bold text-[#E67E22] hover:text-orange-600 uppercase tracking-wider shrink-0 flex items-center gap-0.5"
                >
                    {t('vendor.orderCard.details')} <ChevronRight size={14} />
                </button>
            </div>

            {/* ACTIONS */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {isPending ? (
                    <>
                        <button
                            onClick={() => handleAction('CONFIRMED')}
                            disabled={isLoading}
                            className="col-span-1 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-t border-b border-white"></div> : <CheckCircle size={16} /> }
                            <span>{t('vendor.orderCard.confirm')}</span>
                        </button>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="col-span-1 py-3 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                        >
                            <MessageCircle size={16} className="text-green-500" />
                            <span>{t('vendor.orderCard.whatsapp')}</span>
                        </a>
                    </>
                ) : isConfirmed ? (
                    <>
                        <button
                            onClick={() => handleAction('SHIPPED')}
                            disabled={isLoading}
                            className="col-span-1 py-3 bg-[#E67E22] dark:bg-[#E67E22] text-white rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-t border-b border-white"></div> : <Truck size={16} /> }
                            <span>{t('vendor.orderCard.ship')}</span>
                        </button>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="col-span-1 py-3 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                        >
                            <MessageCircle size={16} className="text-green-500" />
                            <span>{t('vendor.orderCard.whatsapp')}</span>
                        </a>
                    </>
                ) : isShipped ? (
                    <button
                        onClick={() => handleAction('DELIVERED')}
                        disabled={isLoading}
                        className="col-span-2 py-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                        {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-t border-b border-current"></div> : <CheckCircle size={16} /> }
                        <span>{t('vendor.orderCard.confirmDelivery')}</span>
                    </button>
                ) : (
                    <button
                        onClick={onViewDetails}
                        className="col-span-2 py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                    >
                        <FileText size={16} />
                        <span>{t('vendor.orderCard.detailsOrder')}</span>
                    </button>
                )}
            </div>
        </div>
    );
}

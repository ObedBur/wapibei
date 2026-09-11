import React from 'react';
import { X, MapPin, Phone, ChevronRight, MessageCircle } from 'lucide-react';
import { useT } from '@/i18n/useT';

export interface OrderDetailsModalProps {
    order: any;
    onClose: () => void;
    onStatusChange?: (newStatus: string) => Promise<void>;
}

export function OrderDetailsModal({ order, onClose, onStatusChange }: OrderDetailsModalProps) {
  const { t } = useT();
  if (!order) return null;
  const orderReference = order.id.substring(0, 12).toUpperCase();
  const productName = order.product?.name || t('vendor.orders.unknownProduct');
  const whatsappMessage = encodeURIComponent(
    `Bonjour ${order.customerName || ''}, je vous contacte au sujet de votre commande WapiBei #${orderReference} pour « ${productName} » (${order.totalPrice} $).`,
  );
  const whatsappUrl = order.customerPhone
    ? `https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${whatsappMessage}`
    : undefined;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* OVERLAY */}
            <div
                className="absolute inset-0 bg-deep-blue/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* MODAL CONTAINER */}
            <div className="relative w-full max-w-xl bg-white dark:bg-[#0f172a] rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-400">
                
                {/* Grab handle mobile */}
                <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 dark:bg-white/20 rounded-full z-50 pointer-events-none" />

                {/* Header (Clean) */}
                <div className="px-5 pt-8 pb-4 sm:p-8 sm:pb-6 bg-white dark:bg-[#0f172a] border-b border-gray-100 dark:border-white/5 flex items-start justify-between shrink-0 relative z-10">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-deep-blue dark:text-white tracking-tight leading-none mb-1.5">
                            {t('vendor.orderDetails.title')}
                        </h3>
                        <p className="text-[#E67E22] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
                            #{orderReference}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-9 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-deep-blue dark:hover:text-white flex items-center justify-center transition-all shrink-0 -mt-1 -mr-1"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-5 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0f172a]">
                    
                    {/* Infos Client */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <ChevronRight size={14} className="text-[#E67E22]" />
                            {t('vendor.orderDetails.buyerInfo')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <MapPin size={10} className="text-[#E67E22]" />
                                    {t('vendor.orderDetails.delivery')}
                                </p>
                                <p className="text-sm font-black text-deep-blue dark:text-white leading-relaxed whitespace-normal break-words">
                                    {order.deliveryAddress || t('vendor.orderDetails.addressNotSpecified')}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Phone size={10} className="text-green-500" />
                                    {t('vendor.orderDetails.phone')}
                                </p>
                                <p className="text-sm font-black text-deep-blue dark:text-white leading-relaxed">
                                    {order.customerPhone || "N/A"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Produit */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <ChevronRight size={14} className="text-[#E67E22]" />
                            {t('vendor.orderDetails.summary')}
                        </h4>
                        <div className="flex items-center gap-4 p-2">
                            <div className="size-16 sm:size-20 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                                <img src={order.product?.image || order.product?.images?.[0]} alt="" className="size-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className="text-sm sm:text-base font-black text-deep-blue dark:text-white mb-2 truncate">
                                    {productName}
                                </h5>
                                <div className="flex items-center gap-3">
                                    <div className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[9px] font-black uppercase text-gray-500">
                                        {t('vendor.orderDetails.qty')} {Math.max(1, Math.round(order.totalPrice / (order.product?.price || order.totalPrice || 1)))}
                                    </div>
                                    <div className="text-base sm:text-lg font-black text-[#E67E22]">
                                        ${order.totalPrice}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-5 sm:p-8 pb-8 sm:pb-8 bg-white dark:bg-[#0f172a] flex gap-3 sm:gap-4 border-t border-gray-100 dark:border-white/5 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none">
                    <a
                        href={whatsappUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 py-3.5 sm:py-4 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest text-[#2D5A27] dark:text-green-400 text-center flex items-center justify-center gap-2 transition-colors"
                    >
                        <MessageCircle size={16} />
                        {t('vendor.orderCard.whatsapp')}
                    </a>
                    {order.status === 'PENDING' && onStatusChange && (
                        <button
                            onClick={async () => {
                                await onStatusChange('CONFIRMED');
                                onClose();
                            }}
                            className="flex-1 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-colors"
                        >
                            {t('vendor.orderCard.confirm')}
                        </button>
                    )}
                    {order.status === 'CONFIRMED' && onStatusChange && (
                        <button
                            onClick={async () => {
                                await onStatusChange('SHIPPED');
                                onClose();
                            }}
                            className="flex-1 py-3.5 sm:py-4 bg-[#E67E22] hover:bg-orange-600 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-colors"
                        >
                            {t('vendor.orderCard.ship')}
                        </button>
                    )}
                    {order.status === 'SHIPPED' && onStatusChange && (
                        <button
                            onClick={async () => {
                                await onStatusChange('DELIVERED');
                                onClose();
                            }}
                            className="flex-1 py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-colors"
                        >
                            {t('vendor.orderDetails.delivery')}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 sm:py-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-colors"
                    >
                        {t('vendor.orderDetails.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, Loader2, Plus } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useModal } from '@/hooks/useModal';

interface RestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (quantity: number) => void;
    productName: string;
    currentStock: number;
    isRestocking: boolean;
}

export const RestockModal: React.FC<RestockModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    productName,
    currentStock,
    isRestocking
}) => {
    const { t } = useT();
    const [quantity, setQuantity] = useState('50');
    const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
    const [quantityError, setQuantityError] = useState('');
    const modalRef = useModal(isOpen, onClose);

    // Reset local state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setIsLocalSubmitting(false);
            setQuantity('50');
            setQuantityError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleQuantityChange = (value: string) => {
        setQuantity(value);
        const num = parseInt(value, 10);
        if (value === '' || isNaN(num)) {
            setQuantityError('');
        } else if (num < 1) {
            setQuantityError('Minimum 1 unité');
        } else if (num > 9999) {
            setQuantityError('Maximum 9999 unités');
        } else {
            setQuantityError('');
        }
    };

    const handleSubmit = () => {
        const num = parseInt(quantity, 10);
        if (num >= 1 && num <= 9999 && !isLocalSubmitting) {
            setIsLocalSubmitting(true);
            onConfirm(num);
        }
    };

    const isDisabled = isRestocking || isLocalSubmitting || !quantity || parseInt(quantity, 10) < 1 || parseInt(quantity, 10) > 9999;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Réapprovisionner le produit" className="relative bg-white dark:bg-[#0f172a] rounded-[1.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-md animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="p-6 sm:p-8 pb-4 flex flex-col items-center text-center">
                    <div className="size-14 sm:size-20 bg-[#E67E22]/10 rounded-2xl sm:rounded-3xl flex items-center justify-center text-[#E67E22] mb-4 sm:mb-6">
                        <Package size={28} className="sm:hidden" />
                        <Package size={40} className="hidden sm:block" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2 uppercase italic">
                        {t('vendor.products.restock.title') || 'Réapprovisionner'}
                    </h3>
                    <p className="text-[11px] sm:text-sm font-bold text-slate-500 mb-2 sm:mb-4">
                        <span className="text-[#E67E22]">"{productName}"</span>
                        <br />
                        Stock actuel : <span className="text-red-500 font-black">{currentStock}</span>
                    </p>
                </div>

                {/* Input */}
                <div className="px-6 sm:px-8 pb-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        {t('vendor.products.restock.quantity') || 'Nouvelle quantité'}
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={9999}
                        step={1}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className={`w-full px-4 py-3.5 bg-slate-100 dark:bg-white/5 rounded-xl sm:rounded-2xl text-sm font-black text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67E22]/50 border ${quantityError ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-200 dark:border-white/10'}`}
                        placeholder="50"
                        autoFocus
                    />
                    {quantityError && (
                        <p className="mt-2 text-[11px] font-bold text-red-500">{quantityError}</p>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 sm:p-8 pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        disabled={isRestocking}
                        className="flex-1 px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 font-black text-[10px] sm:text-[12px] uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {t('vendor.deleteProduct.cancel') || 'Annuler'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isDisabled}
                        className="flex-1 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#E67E22] text-white font-black text-[10px] sm:text-[12px] uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-xl shadow-[#E67E22]/20 hover:bg-[#d35400] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-80 flex items-center justify-center gap-2 sm:gap-3"
                    >
                        {isRestocking || isLocalSubmitting ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <Plus size={16} />
                                {t('vendor.products.restock.confirm') || 'Réapprovisionner'}
                            </>
                        )}
                    </button>
                </div>

                {/* Close Button UI */}
                <button
                    onClick={onClose}
                    aria-label="Fermer"
                    className="absolute top-4 right-4 size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

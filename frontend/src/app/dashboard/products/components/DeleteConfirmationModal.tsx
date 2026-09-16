'use client';

import React from 'react';
import { X, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useModal } from '@/hooks/useModal';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    isDeleting: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    isDeleting
}) => {
    const { t } = useT();
    const modalRef = useModal(isOpen, onClose);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Confirmer la suppression" className="relative bg-white dark:bg-[#0f172a] rounded-[1.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-md animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="p-6 sm:p-8 pb-4 flex flex-col items-center text-center">
                    <div className="size-14 sm:size-20 bg-red-500/10 rounded-2xl sm:rounded-3xl flex items-center justify-center text-red-500 mb-4 sm:mb-6">
                        <AlertTriangle size={28} className="sm:hidden" />
                        <AlertTriangle size={40} className="hidden sm:block" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2 uppercase italic">{t('vendor.deleteProduct.title')}</h3>
                    <p className="text-[11px] sm:text-sm font-bold text-slate-500 mb-2 sm:mb-4">
                        {t('vendor.deleteProduct.confirm')} <span className="text-red-500">"{itemName}"</span> ? {t('vendor.deleteProduct.irreversible')}
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="p-6 sm:p-8 pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 font-black text-[10px] sm:text-[12px] uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {t('vendor.deleteProduct.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-6 sm:px-8 py-3.5 sm:py-4 bg-red-600 text-white font-black text-[10px] sm:text-[12px] uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-80 flex items-center justify-center gap-2 sm:gap-3"
                    >
                        {isDeleting ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <Trash2 size={16} />
                                {t('vendor.deleteProduct.delete')}
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

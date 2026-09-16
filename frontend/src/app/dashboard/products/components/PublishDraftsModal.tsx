'use client';

import React, { useState, useEffect } from 'react';
import { X, Globe, Loader2, CheckCircle2, Package, Search } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { useModal } from '@/hooks/useModal';

interface PublishDraftsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPublished: () => void;
}

export default function PublishDraftsModal({ isOpen, onClose, onPublished }: PublishDraftsModalProps) {
    const { t } = useT();
    const [drafts, setDrafts] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const modalRef = useModal(isOpen, onClose);

    const fetchDrafts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/products/my-products', {
                params: { limit: 100 }
            });
            // Filter products that are NOT public
            const pending = res.data.data.filter((p: any) => !p.isPublic);
            setDrafts(pending);
            setSelectedIds(pending.map((p: any) => p.id)); // Select all by default
        } catch (error) {
            toast.error(t('vendor.publishDrafts.fetchError'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchDrafts();
        }
    }, [isOpen]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handlePublish = async () => {
        if (selectedIds.length === 0) return;
        
        setIsPublishing(true);
        try {
            await api.patch('/products/bulk-publish', { ids: selectedIds });
            toast.success(`${selectedIds.length} ${t('vendor.publishDrafts.published')}`);
            onPublished();
            onClose();
        } catch (error) {
            toast.error(t('vendor.publishDrafts.publishError'));
        } finally {
            setIsPublishing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#1e293b]/60 backdrop-blur-sm" onClick={onClose} />
            
            <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Publier les brouillons" className="relative bg-white dark:bg-[#151b2c] w-full max-w-2xl rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#1e293b] dark:text-white tracking-tight uppercase italic">{t('vendor.publishDrafts.title')}</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('vendor.publishDrafts.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Fermer" className="size-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 max-h-[60vh]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-[#E67E22]" size={32} />
                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('vendor.publishDrafts.loading')}</p>
                        </div>
                    ) : drafts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="size-20 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                                <Package size={40} />
                            </div>
                            <h3 className="text-xl font-black text-[#1e293b] dark:text-white mb-2">{t('vendor.publishDrafts.synced')}</h3>
                            <p className="text-sm font-bold text-gray-400">{t('vendor.publishDrafts.noPending')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {drafts.map((product) => (
                                <div 
                                    key={product.id}
                                    onClick={() => toggleSelect(product.id)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                        selectedIds.includes(product.id) 
                                            ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10' 
                                            : 'border-transparent bg-gray-50 dark:bg-white/5'
                                    }`}
                                >
                                    <div className="size-16 rounded-xl overflow-hidden bg-white shrink-0">
                                        <img src={product.image || product.images?.[0] || '/shopping-cart.png'} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-extrabold text-[#1e293b] dark:text-white truncate">{product.name}</h4>
                                        <p className="text-xs font-bold text-[#E67E22]">{product.price}$</p>
                                    </div>
                                    <div className={`size-6 rounded-lg flex items-center justify-center transition-all ${
                                        selectedIds.includes(product.id) ? 'bg-emerald-500 text-white' : 'border-2 border-gray-200 dark:border-white/10'
                                    }`}>
                                        {selectedIds.includes(product.id) && <CheckCircle2 size={16} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
                    <button
                        onClick={handlePublish}
                        disabled={selectedIds.length === 0 || isPublishing}
                        className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
                    >
                        {isPublishing ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Globe size={20} />
                                <span>{t('vendor.publishDrafts.publish').replace('{count}', selectedIds.length.toString())}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

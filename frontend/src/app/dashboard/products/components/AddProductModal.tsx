'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Package, DollarSign, Database, Tag, Image as ImageIcon, Loader2, AlignLeft, CheckCircle2, Edit2, Globe, Save, ChevronDown, Banknote } from 'lucide-react';
import { useT } from '@/i18n/useT';

import { getCategories, addProduct, updateProduct } from '@/features/products/services/product.service';
import {
    MAX_PRODUCT_IMAGES,
    uploadProductImage,
    validateProductImage,
} from '@/features/products/services/media.service';
import { toast } from 'sonner';
import { Category } from '@/types/category.types';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductAdded: () => void;
    product?: any;
    defaultPublic?: boolean;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onProductAdded, product, defaultPublic }) => {
    const { t } = useT();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [nameSw, setNameSw] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');
    const [descriptionSw, setDescriptionSw] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extraImages, setExtraImages] = useState<File[]>([]);
    const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
    const [savedExtraImages, setSavedExtraImages] = useState<string[]>([]);
    const [originalPrice, setOriginalPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('Pièce');
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(true);
    const [currency, setCurrency] = useState<'USD' | 'FC'>('USD');
    const EXCHANGE_RATE = 2800; // Taux de change
    const UNITS = [t('vendor.addProduct.units.piece'), t('vendor.addProduct.units.kg'), t('vendor.addProduct.units.liter'), t('vendor.addProduct.units.bag'), t('vendor.addProduct.units.box'), t('vendor.addProduct.units.dozen'), t('vendor.addProduct.units.meter'), t('vendor.addProduct.units.gram')];
    const maxExtraImages = imagePreview ? MAX_PRODUCT_IMAGES - 1 : MAX_PRODUCT_IMAGES;


    // Populate form if editing
    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setDescription(product.description || '');
            setNameEn(product.nameEn || '');
            setNameSw(product.nameSw || '');
            setDescriptionEn(product.descriptionEn || '');
            setDescriptionSw(product.descriptionSw || '');
            setPrice(product.price?.toString() || '');
            setCategoryId(product.categoryId?.toString() || '');
            setQuantity(product.stockQuantity?.toString() || '');
            setUnit(product.unit || t('vendor.addProduct.units.piece'));
            setImage(null);
            setImagePreview(product.image || null);
            setExtraImages([]);
            setExtraPreviews([]);
            setSavedExtraImages(Array.isArray(product.images) ? product.images : []);
            setIsPublic(product.isPublic !== undefined ? product.isPublic : true);
        } else {
            // Reset for "Add" mode
            setName('');
            setDescription('');
            setNameEn('');
            setNameSw('');
            setDescriptionEn('');
            setDescriptionSw('');
            setCategoryId('');
            setQuantity('');
            setOriginalPrice('');
            setUnit(t('vendor.addProduct.units.piece'));
            setImagePreview(null);
            setExtraImages([]);
            setExtraPreviews([]);
            setSavedExtraImages([]);
            setIsPublic(defaultPublic !== undefined ? defaultPublic : true);
        }
    }, [product, isOpen, defaultPublic]);

    // Fetch real categories from backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                if (response?.success) {
                    setCategories(response.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        if (isOpen) fetchCategories();
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const uploadedMainImage = image ? await uploadProductImage(image) : null;
            const uploadedExtraImages: string[] = [];
            for (const extraFile of extraImages) {
                const uploadedImage = await uploadProductImage(extraFile);
                uploadedExtraImages.push(uploadedImage.url);
            }

            const payload: any = {
                name,
                description,
                nameEn: nameEn || undefined,
                nameSw: nameSw || undefined,
                descriptionEn: descriptionEn || undefined,
                descriptionSw: descriptionSw || undefined,
                price: currency === 'USD' ? Number(price) : Number(price) / EXCHANGE_RATE,
                originalPrice: originalPrice ? (currency === 'USD' ? Number(originalPrice) : Number(originalPrice) / EXCHANGE_RATE) : undefined,
                categoryId: Number(categoryId),
                stockQuantity: Number(quantity) || 0,
                unit: unit,
                isPublic,
            };

            if (uploadedMainImage) {
                payload.image = uploadedMainImage.url;
            }
            if (product || uploadedExtraImages.length > 0) {
                payload.images = [...savedExtraImages, ...uploadedExtraImages];
            }

            const response = product
                ? await updateProduct(product.id, payload)
                : await addProduct(payload);

            if (response?.success) {
                toast.success(product ? t('vendor.addProduct.toastUpdated') : t('vendor.addProduct.toastPublished'), {
                    description: product ? t('vendor.addProduct.toastDraftSaved') : t('vendor.addProduct.toastVisible'),
                    style: { background: '#2D5A27', color: 'white', border: '1px solid #E67E22' },
                });
                setIsSuccess(true);
                setTimeout(() => {
                    onProductAdded();
                    onClose();
                    if (!product) {
                        // Reset form only on "Add"
                        setName('');
                        setDescription('');
                        setPrice('');
                        setOriginalPrice('');
                        setCategoryId('');
                        setQuantity('');
                        setUnit(t('vendor.addProduct.units.piece'));
                        setImage(null);
                        setImagePreview(null);
                        setExtraImages([]);
                        setExtraPreviews([]);
                        setSavedExtraImages([]);
                    }
                    setIsSuccess(false);
                }, 1500);
            } else {
                const errorMsg = response?.message || t('vendor.addProduct.errorAdd');
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err: any) {
            console.error('Error adding product:', err);
            const errorMsg = err.response?.data?.message || t('vendor.addProduct.errorUnexpected');
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative bg-white dark:bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] border border-black/10 dark:border-white/10 w-full max-w-5xl animate-in zoom-in-95 duration-500">

                <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto scrollbar-hide">

                    {/* --- LEFT SIDE: IMAGE PREVIEW --- */}
                    <div className="w-full md:w-5/12 bg-white/50 dark:bg-white/5 p-8 flex flex-col border-b md:border-b-0 md:border-r border-black/10 dark:border-white/5">
                        <div className="space-y-4 mb-6">
                            <h3 className="text-2xl font-black text-black dark:text-white tracking-tight">{t('vendor.addProduct.visualTitle')}</h3>
                            <p className="text-xs font-medium text-black/50 uppercase tracking-widest">{t('vendor.addProduct.visualSubtitle')}</p>
                        </div>

                        {/* Main image */}
                        <div className="relative group aspect-[4/3] md:aspect-square mb-3">
                            <input type="file" id="image" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => {
                                const selectedFile = e.target.files?.[0];
                                if (!selectedFile) return;
                                const validationError = validateProductImage(selectedFile);
                                if (validationError) {
                                    setError(validationError);
                                    e.target.value = '';
                                    return;
                                }
                                setError(null);
                                setImage(selectedFile);
                                setImagePreview(URL.createObjectURL(selectedFile));
                            }} className="hidden" />

                            <label htmlFor="image" className="relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-black/20 dark:border-white/10 rounded-2xl sm:rounded-[2rem] cursor-pointer group-hover:border-[#E67E22] group-hover:bg-[#E67E22]/5 transition-all overflow-hidden bg-white dark:bg-black/50">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <ImageIcon className="text-white" size={32} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4 sm:p-6">
                                        <div className="size-10 sm:size-16 bg-black/5 dark:bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4 text-black/40 group-hover:text-[#E67E22] transition-colors">
                                            <Plus size={24} />
                                        </div>
                                        <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-black/40">{t('vendor.addProduct.addPhoto')}</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Extra photos (max 4 extra = 5 total) */}
                        <div className="mb-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-2">
                                Photos supplémentaires <span className="text-[#E67E22]">{savedExtraImages.length + extraImages.length}/{maxExtraImages}</span> (max {MAX_PRODUCT_IMAGES} en tout)
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                                {savedExtraImages.map((src, i) => (
                                    <div key={src} className="relative aspect-square rounded-xl overflow-hidden border border-black/10">
                                        <img src={src} alt={`Extra enregistrée ${i + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setSavedExtraImages(prev => prev.filter((_, j) => j !== i))}
                                            className="absolute top-0.5 right-0.5 size-5 bg-red-500 rounded-full flex items-center justify-center text-white"
                                            aria-label="Supprimer cette photo"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                                {extraPreviews.map((src, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-black/10">
                                        <img src={src} alt={`Extra ${i+1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setExtraImages(prev => prev.filter((_, j) => j !== i));
                                                setExtraPreviews(prev => prev.filter((_, j) => j !== i));
                                            }}
                                            className="absolute top-0.5 right-0.5 size-5 bg-red-500 rounded-full flex items-center justify-center text-white"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                                {savedExtraImages.length + extraImages.length < maxExtraImages && (
                                    <label className="aspect-square rounded-xl border-2 border-dashed border-black/15 flex flex-col items-center justify-center cursor-pointer hover:border-[#E67E22] hover:bg-[#E67E22]/5 transition-all">
                                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => {
                                            const selectedFile = e.target.files?.[0];
                                            if (!selectedFile) return;
                                            const validationError = validateProductImage(selectedFile);
                                            if (validationError) {
                                                setError(validationError);
                                                e.target.value = '';
                                                return;
                                            }
                                            setError(null);
                                            setExtraImages(prev => [...prev, selectedFile]);
                                            setExtraPreviews(prev => [...prev, URL.createObjectURL(selectedFile)]);
                                        }} />
                                        <Plus size={16} className="text-black/30" />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-[#E67E22]/5 rounded-3xl border border-[#E67E22]/10 mt-auto">
                            <p className="text-[10px] font-bold text-[#E67E22] leading-relaxed">
                                <span className="block font-black mb-1 italic uppercase">{t('vendor.addProduct.tipTitle')}</span>
                                {t('vendor.addProduct.tipText')}
                            </p>
                        </div>
                    </div>

                    {/* --- RIGHT SIDE: FORM FIELDS --- */}
                    <div className="w-full md:w-7/12 p-8 md:p-12 relative flex flex-col">
                        <button onClick={onClose} className="absolute top-6 right-6 size-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/50 hover:bg-red-500 hover:text-white transition-all z-20">
                            <X size={20} />
                        </button>

                        <div className="mb-6 md:mb-8">
                            <h3 className="text-2xl md:text-3xl font-black text-black dark:text-white tracking-tighter italic mb-1 uppercase">
                                {product ? t('vendor.addProduct.titleEdit') : defaultPublic ? t('vendor.addProduct.titlePublish') : t('vendor.addProduct.titleDraft')}
                            </h3>
                            <div className="h-1 w-12 bg-[#E67E22] rounded-full" />
                            <p className="text-[10px] font-bold text-black/40 mt-2 uppercase tracking-[0.2em]">
                                {product ? t('vendor.addProduct.subtitleEdit') : defaultPublic ? t('vendor.addProduct.subtitlePublish') : t('vendor.addProduct.subtitleDraft')}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 dark:text-white/50 uppercase tracking-widest ml-1">{t('vendor.addProduct.titleLabel')}</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                                    <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="ex: Basket Nike Air Max..." className="w-full sm:pl-12 pl-12 pr-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#E67E22]/50 focus:ring-4 focus:ring-[#E67E22]/5 outline-none transition-all text-sm font-bold text-black dark:text-white" required />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 dark:text-white/50 uppercase tracking-widest ml-1">{t('vendor.addProduct.descLabel')}</label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-4 top-4 text-black/40" size={16} />
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('vendor.addProduct.descPlaceholder')} className="w-full sm:pl-12 pl-12 pr-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#E67E22]/50 outline-none transition-all text-sm font-bold min-h-[80px] sm:min-h-[100px] resize-none text-black dark:text-white" />
                                </div>
                            </div>

                            {/* Traductions optionnelles */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent">
                                <div className="flex items-center gap-2 mb-4">
                                    <Globe size={16} className="text-[#E67E22]" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/50">{t('vendor.addProduct.translationsTitle')}</p>
                                        <p className="text-[10px] font-bold text-black/40 dark:text-white/40">{t('vendor.addProduct.translationsDesc')}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} type="text" placeholder={t('vendor.addProduct.nameEnLabel')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-transparent focus:border-[#E67E22]/50 outline-none transition-all text-sm font-bold text-black dark:text-white" />
                                        <input value={nameSw} onChange={(e) => setNameSw(e.target.value)} type="text" placeholder={t('vendor.addProduct.nameSwLabel')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-transparent focus:border-[#E67E22]/50 outline-none transition-all text-sm font-bold text-black dark:text-white" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder={t('vendor.addProduct.descEnLabel')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-transparent focus:border-[#E67E22]/50 outline-none transition-all text-sm font-bold min-h-[60px] resize-none text-black dark:text-white" />
                                        <textarea value={descriptionSw} onChange={(e) => setDescriptionSw(e.target.value)} placeholder={t('vendor.addProduct.descSwLabel')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-transparent focus:border-[#E67E22]/50 outline-none transition-all text-sm font-bold min-h-[60px] resize-none text-black dark:text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Original Price (barré) */}
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-black/40 dark:text-white/50 uppercase tracking-widest ml-1">Prix barré (optionnel)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                                        <input
                                            value={originalPrice}
                                            onChange={(e) => setOriginalPrice(e.target.value)}
                                            type="number"
                                            placeholder={`ex: 50 ${currency} — affiché barré comme ancien prix`}
                                            className="w-full pl-12 pr-6 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 focus:border-[#E67E22]/50 outline-none transition-all text-sm font-bold text-black dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    {originalPrice && price && Number(originalPrice) > Number(price) && (
                                        <p className="text-[10px] text-emerald-600 font-bold ml-1">
                                            Réduction : {Math.round((1 - Number(price)/Number(originalPrice)) * 100)}% de rabais affiché sur le produit
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Price */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-black/40 dark:text-white/50 uppercase tracking-widest">{t('vendor.addProduct.priceLabel').replace('{currency}', currency)}</label>
                                        <div className="flex gap-1">
                                            {(['USD', 'FC'] as const).map((curr) => (
                                                <button
                                                    key={curr}
                                                    type="button"
                                                    onClick={() => {
                                                        if (price) {
                                                            const val = Number(price);
                                                            if (curr === 'FC' && currency === 'USD') setPrice((val * EXCHANGE_RATE).toFixed(0));
                                                            if (curr === 'USD' && currency === 'FC') setPrice((val / EXCHANGE_RATE).toFixed(2));
                                                        }
                                                        setCurrency(curr);
                                                    }}
                                                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${currency === curr ? 'bg-[#E67E22] text-white shadow-sm' : 'bg-black/5 dark:bg-white/5 text-black/40 hover:text-black hover:bg-black/10'}`}
                                                >
                                                    {curr}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative group/price">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 transition-colors group-focus-within/price:text-[#E67E22]">
                                            {currency === 'USD' ? <DollarSign size={16} /> : <Banknote size={16} />}
                                        </div>
                                        <input
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full sm:pl-12 pl-12 pr-28 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#E67E22]/50 outline-none transition-all text-sm font-bold text-black dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            required
                                        />
                                        {price && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in slide-in-from-right-2">
                                                <span className="text-[9px] font-black text-[#E67E22] uppercase tracking-tighter bg-[#E67E22]/5 px-2 py-1 rounded-lg border border-[#E67E22]/10">
                                                    ≈ {currency === 'USD'
                                                        ? `${(Number(price) * EXCHANGE_RATE).toLocaleString()} FC`
                                                        : `${(Number(price) / EXCHANGE_RATE).toFixed(2)} $`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black/40 dark:text-white/50 uppercase tracking-widest ml-1">{t('vendor.addProduct.categoryLabel')}</label>
                                    <div className="relative">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full sm:pl-12 pl-12 pr-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#E67E22]/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer text-black dark:text-white" required>
                                            <option value="" className="bg-white dark:bg-black">...</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id} className="bg-white dark:bg-black">
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Quantity */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black/40 dark:text-white/50 uppercase tracking-widest ml-1">{t('vendor.addProduct.quantityLabel')}</label>
                                    <div className="relative">
                                        <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                                        <input
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            type="number"
                                            placeholder="ex: 100"
                                            className="w-full sm:pl-12 pl-12 pr-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#E67E22]/50 outline-none transition-all text-sm font-bold text-black dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                {/* Unit */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black/40 dark:text-white/50 uppercase tracking-widest ml-1">{t('vendor.addProduct.unitLabel')}</label>
                                    <div className="relative">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                                        <select
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="w-full sm:pl-12 pl-12 pr-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#E67E22]/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer text-black dark:text-white"
                                            required
                                        >
                                            {UNITS.map((u) => (
                                                <option key={u} value={u} className="bg-white dark:bg-black">
                                                    {u}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Visibility Toggle */}
                            <div className="flex items-center justify-between p-4 sm:p-5 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent hover:border-[#E67E22]/20 transition-all cursor-pointer group/toggle" onClick={() => setIsPublic(!isPublic)}>
                                <div className="space-y-0.5 sm:space-y-1">
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#E67E22]">{t('vendor.addProduct.visibilityToggle')}</p>
                                    <p className="text-[10px] sm:text-[11px] font-bold text-black/40">{t('vendor.addProduct.visibilityDesc')}</p>
                                </div>
                                <div className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full relative transition-all duration-300 ${isPublic ? 'bg-[#E67E22]' : 'bg-black/20 dark:bg-white/10'}`}>
                                    <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full transition-all duration-300 ${isPublic ? 'right-0.5 sm:right-1' : 'left-0.5 sm:left-1'}`} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || isSuccess}
                                className={`w-full text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-[12px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-80 flex items-center justify-center gap-3 mt-2 ${isSuccess
                                    ? 'bg-emerald-500 shadow-emerald-500/20'
                                    : 'bg-[#E67E22] shadow-orange-500/20'
                                    }`}
                            >
                                {isSuccess ? (
                                    <>
                                        <CheckCircle2 size={20} className="animate-in zoom-in" />
                                        {product ? t('vendor.addProduct.successUpdated') : defaultPublic ? t('vendor.addProduct.successPublished') : t('vendor.addProduct.successSaved')}
                                    </>
                                ) : isSubmitting ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>{product ? t('vendor.addProduct.loadingUpdating') : defaultPublic ? t('vendor.addProduct.loadingPublishing') : t('vendor.addProduct.loadingSaving')}</span>
                                    </div>
                                ) : (
                                    <>
                                        {product ? <Edit2 size={18} /> : defaultPublic ? <Globe size={18} /> : <Save size={18} />}
                                        {product ? t('vendor.addProduct.btnSave') : defaultPublic ? t('vendor.addProduct.btnPublish') : t('vendor.addProduct.btnDraft')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

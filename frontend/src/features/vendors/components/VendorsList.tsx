import React, { useState } from 'react';
import { User, KycStatus } from '@/types';
import { VendorCard } from './VendorCard';
import { VendorDetailModal } from './VendorDetailModal';
import { VendorFilters } from './VendorFilters';
import { Pagination } from '@/components/ui/Pagination';

interface VendorsListProps {
    vendors: User[];
    isLoading: boolean;
    filters: {
        status: 'Tous' | KycStatus;
    };
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    onFilterChange: (status: 'Tous' | KycStatus) => void;
    onPageChange?: (page: number) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export const VendorsList: React.FC<VendorsListProps> = ({ 
    vendors, 
    isLoading, 
    filters,
    pagination,
    onFilterChange,
    onPageChange,
    onApprove,
    onReject
}) => {
    const [selectedVendor, setSelectedVendor] = useState<User | null>(null);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-11 w-28 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[72px] bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 relative">
            {/* Filters bar */}
            <VendorFilters 
                activeFilter={filters.status} 
                onFilterChange={onFilterChange} 
                totalCount={pagination?.total ?? vendors.length} 
            />

            {/* Vendor List */}
            {vendors.length > 0 ? (
                <div className="space-y-2.5">
                    {vendors.map((vendor) => (
                        <VendorCard
                            key={vendor.id}
                            vendor={vendor}
                            onViewDetails={setSelectedVendor}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <svg className="size-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-500">Aucun vendeur trouvé</p>
                    <p className="text-xs text-slate-400 mt-1">Essayez de changer les filtres ou la recherche.</p>
                </div>
            )}

            {/* Pagination */}
            {pagination && onPageChange && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={onPageChange}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    itemsOnPage={vendors.length}
                />
            )}

            {/* Modal */}
            {selectedVendor && (
                <VendorDetailModal
                    vendor={selectedVendor}
                    onClose={() => setSelectedVendor(null)}
                    onApprove={onApprove}
                    onReject={onReject}
                />
            )}
        </div>
    );
};

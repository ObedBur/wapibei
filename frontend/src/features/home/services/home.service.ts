import { api } from '@/lib/axios';
import { Category } from '@/features/products/types';
import { Product } from '@/features/products/types';
import { HomeSeller } from '@/features/home/services/seller.service';

export interface HomeSectionsResponse {
  categories: Category[];
  sellers: HomeSeller[];
  content: {
    heroSlides: Array<{ id: number; title: string; imageUrl: string; label: string }>;
    howItWorksSteps: Array<{ id: number; icon: string; title: string; description: string }>;
  };
  deals: Product[];
  newArrivals: Product[];
  bestSellers: Product[];
}

export async function getHomeSections(limit = 12): Promise<HomeSectionsResponse> {
  try {
    const response = await api.get<{ success: boolean; data: HomeSectionsResponse }>('/home/sections', {
      params: { limit },
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch home sections');
  } catch (error) {
    console.error('Error fetching home sections:', error);
    return {
      categories: [],
      sellers: [],
      content: { heroSlides: [], howItWorksSteps: [] },
      deals: [],
      newArrivals: [],
      bestSellers: [],
    };
  }
}
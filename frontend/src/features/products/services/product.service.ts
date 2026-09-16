import { api } from '@/lib/axios';
import { Product, Category } from '../types';
import { ApiResponse } from '@/types/api';

export async function getProducts(params?: {
  categoryId?: number;
  search?: string;
  market?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Product[]>> {
  try {
    const response = await api.get<ApiResponse<Product[]>>('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      data: [],
      message: "Erreur lors de la récupération des produits",
    };
  }
}

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      data: [],
      message: "Erreur lors de la récupération des catégories",
    };
  }
}

export async function getProductById(id: string): Promise<ApiResponse<Product>> {
  try {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
}

// ====== GALERIES INTELLIGENTES ======

export async function getDeals(limit = 6): Promise<ApiResponse<Product[]>> {
  try {
    const response = await api.get<ApiResponse<Product[]>>('/products/deals', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching deals:', error);
    return { success: false, data: [], message: 'Erreur' };
  }
}

export async function getNewArrivals(limit = 6): Promise<ApiResponse<Product[]>> {
  try {
    const response = await api.get<ApiResponse<Product[]>>('/products/new-arrivals', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return { success: false, data: [], message: 'Erreur' };
  }
}

export async function getRecommendations(userId?: string, limit = 6): Promise<ApiResponse<Product[]>> {
  try {
    const response = await api.get<ApiResponse<Product[]>>('/products/recommendations', { params: { userId, limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { success: false, data: [], message: 'Erreur' };
  }
}

export async function getBestSellers(limit = 6): Promise<ApiResponse<Product[]>> {
  try {
    const response = await api.get<ApiResponse<Product[]>>('/products/best-sellers', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    return { success: false, data: [], message: 'Erreur' };
  }
}

// ====== ACTIONS VENDEUR ======

export async function getMyProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const response = await api.get<ApiResponse<Product[]>>('/products/my-products');
    return response.data;
  } catch (error) {
    console.error('Error fetching my products:', error);
    return { success: false, data: [], message: 'Erreur' };
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse<unknown>> {
  try {
    const response = await api.delete<ApiResponse<unknown>>(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
}

export async function addProduct(payload: any): Promise<ApiResponse<unknown>> {
  try {
    const response = await api.post<ApiResponse<unknown>>('/products', payload);
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, payload: any): Promise<ApiResponse<unknown>> {
  try {
    const response = await api.patch<ApiResponse<unknown>>(`/products/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
}

export async function restockProduct(id: string, stockQuantity: number): Promise<ApiResponse<unknown>> {
  try {
    const response = await api.patch<ApiResponse<unknown>>(`/products/${id}/restock`, { stockQuantity });
    return response.data;
  } catch (error) {
    console.error(`Error restocking product ${id}:`, error);
    throw error;
  }
}

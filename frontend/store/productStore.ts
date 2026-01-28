import { create } from 'zustand';
import { ProductState, Product, ProductDetail, CategoryInfo } from '@/types';
import { productApi } from '@/lib/api';
import { useAuthStore } from './authStore';

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  popularProducts: [],
  personalizedRecommendations: [],
  viewHistory: [],
  categories: [],
  searchResults: [],
  currentProduct: null,
  isLoading: false,
  error: null,

  searchProducts: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      const response = await productApi.search({
        query,
        email: user?.email,
        limit: 20
      });
      
      if (response.status === 'success') {
        set({ 
          searchResults: response.products,
          isLoading: false 
        });
      } else {
        throw new Error(response.message || 'Tìm kiếm thất bại');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi tìm kiếm';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },

  getPersonalizedRecommendations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('Vui lòng đăng nhập');
      
      const response = await productApi.getPersonalized({
        email: user.email,
        limit: 10
      });
      
      if (response.status === 'success') {
        set({ 
          personalizedRecommendations: response.recommendations,
          isLoading: false 
        });
      } else {
        throw new Error(response.message || 'Lấy gợi ý thất bại');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi gợi ý';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },

  getLandingPageData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.getLandingPage();
      
      if (response.status === 'success') {
        set({ 
          categories: response.categories,
          popularProducts: response.popular_products,
          personalizedRecommendations: response.general_recommendations,
          isLoading: false 
        });
      } else {
        throw new Error(response.message || 'Lấy dữ liệu thất bại');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi lấy dữ liệu';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },

  getProductDetail: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      // Lấy chi tiết sản phẩm
      const detailResponse = await productApi.getProductDetail(id);
      
      if (detailResponse.status === 'success') {
        // Lấy sản phẩm tương tự
        const similarResponse = await productApi.getSimilarProducts(id);
        
        // Lưu lịch sử xem
        if (user?.email) {
          await productApi.trackView({
            email: user.email,
            product_id: id
          });
          
          // Cập nhật view history
          await get().getViewHistory();
        }
        
        set({ 
          currentProduct: {
            ...detailResponse.product,
            similar_products: similarResponse.status === 'success' 
              ? similarResponse.similar_products 
              : []
          },
          isLoading: false 
        });
      } else {
        throw new Error(detailResponse.message || 'Lấy chi tiết thất bại');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi lấy chi tiết';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },

  trackProductView: async (productId: number) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.email) return;
      
      await productApi.trackView({
        email: user.email,
        product_id: productId
      });
    } catch (error) {
      console.error('Lỗi lưu lịch sử xem:', error);
    }
  },

  getViewHistory: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.email) return;
      
      const response = await productApi.getViewHistory(user.email);
      
      if (response.status === 'success') {
        set({ viewHistory: response.products });
      }
    } catch (error) {
      console.error('Lỗi lấy lịch sử xem:', error);
    }
  },

  clearSearchResults: () => set({ searchResults: [] }),
  
  clearError: () => set({ error: null }),
}));
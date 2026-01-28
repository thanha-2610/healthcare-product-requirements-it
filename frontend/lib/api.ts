import api from './axios';
import {
  AuthResponse,
  ProfileResponse,
  SearchResponse,
  PersonalizedResponse,
  LandingPageResponse,
  ProductDetailResponse,
  ViewHistoryResponse,
  SimilarProductsResponse,
  CategoriesResponse,
  SearchParams,
  PersonalizedParams,
  TrackViewParams,
  UserProfile
} from '@/types';

export const authApi = {
  // Đăng ký
  signup: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', { email, password, name });
    return response.data;
  },

  // Đăng nhập
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Lưu profile
  saveProfile: async (email: string, profileData: Partial<UserProfile>): Promise<ProfileResponse> => {
    const response = await api.post('/user/profile', { 
      email, 
      ...profileData 
    });
    return response.data;
  },
};

export const productApi = {
  // Tìm kiếm sản phẩm
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const response = await api.post('/api/products/search', params);
    return response.data;
  },

  // Gợi ý cá nhân hóa
  getPersonalized: async (params: PersonalizedParams): Promise<PersonalizedResponse> => {
    const response = await api.post('/api/products/personalized', params);
    return response.data;
  },

  // Dữ liệu trang chủ
  getLandingPage: async (): Promise<LandingPageResponse> => {
    const response = await api.get('/api/products/landing');
    return response.data;
  },

  // Chi tiết sản phẩm
  getProductDetail: async (productId: number): Promise<ProductDetailResponse> => {
    const response = await api.get(`/api/products/${productId}`);
    return response.data;
  },

  // Sản phẩm tương tự
  getSimilarProducts: async (productId: number): Promise<SimilarProductsResponse> => {
    const response = await api.get(`/api/products/similar/${productId}`);
    return response.data;
  },

  // Lưu lịch sử xem
  trackView: async (params: TrackViewParams): Promise<any> => {
    const response = await api.post('/api/products/view', params);
    return response.data;
  },

  // Lấy lịch sử đã xem
  getViewHistory: async (email: string): Promise<ViewHistoryResponse> => {
    const response = await api.post('/api/products/view-history', { email });
    return response.data;
  },

  // Tất cả danh mục
  getAllCategories: async (): Promise<CategoriesResponse> => {
    const response = await api.get('/api/products/categories');
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Utility function để kiểm tra network
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await productApi.healthCheck();
    return true;
  } catch (error) {
    console.error('API Health check failed:', error);
    return false;
  }
};
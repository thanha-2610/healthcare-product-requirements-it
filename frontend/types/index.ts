// USER TYPES
export interface UserProfile {
  age?: number;
  weight?: number;
  health_concerns: string;
  diseases?: string;
  updated_at?: string;
}

export interface User {
  email: string;
  name: string;
  profile: UserProfile | null;
  created_at?: string;
}

export interface AuthResponse {
  status: "success" | "error";
  user?: User;
  message?: string;
}

export interface ProfileResponse {
  status: "success" | "error";
  profile?: UserProfile;
  message?: string;
}

// PRODUCT TYPES 
export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  target_gender: string;
  health_goal: string;
  age_range?: string;
  weight_range?: string;
  features?: string;
  search_keywords?: string;
  match_score?: number;
  relevance?: number;
  has_age_range?: boolean;
  has_weight_range?: boolean;
  [key: string]: any;
}

export interface ProductDetail extends Product {
  similar_products?: Product[];
  viewed_count?: number;
}

export interface CategoryInfo {
  category: string;
  count: number;
  featured_product: Product;
}

export interface SearchParams {
  query: string;
  email?: string;
  limit?: number;
}

export interface PersonalizedParams {
  email: string;
  limit?: number;
}

export interface TrackViewParams {
  email: string;
  product_id: number;
}

// RESPONSE TYPES
export interface SearchResponse {
  status: "success" | "error";
  query: string;
  count: number;
  products: Product[];
  message?: string;
}

export interface PersonalizedResponse {
  status: "success" | "error";
  count: number;
  recommendations: Product[];
  based_on: {
    has_profile: boolean;
    view_history_count: number;
    search_history_count: number;
  };
  message?: string;
}

export interface LandingPageResponse {
  status: "success" | "error";
  categories: CategoryInfo[];
  popular_products: Product[];
  general_recommendations: Product[];
  total_products: number;
  message?: string;
}

export interface ProductDetailResponse {
  status: "success" | "error";
  product: ProductDetail;
  message?: string;
}

export interface ViewHistoryResponse {
  status: "success" | "error";
  count: number;
  products: Product[];
  message?: string;
}

export interface SimilarProductsResponse {
  status: "success" | "error";
  count: number;
  similar_products: Product[];
  message?: string;
}

export interface CategoriesResponse {
  status: "success" | "error";
  count: number;
  categories: string[];
  message?: string;
}

// STORE TYPES
export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
  clearError: () => void;
}

export interface ProductState {
  products: Product[];
  popularProducts: Product[];
  personalizedRecommendations: Product[];
  viewHistory: Product[];
  categories: CategoryInfo[];
  searchResults: Product[];
  currentProduct: ProductDetail | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  searchProducts: (query: string) => Promise<void>;
  getPersonalizedRecommendations: () => Promise<void>;
  getLandingPageData: () => Promise<void>;
  getProductDetail: (id: number) => Promise<void>;
  trackProductView: (productId: number) => Promise<void>;
  getViewHistory: () => Promise<void>;
  clearSearchResults: () => void;
  clearError: () => void;
}
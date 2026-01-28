// API CONSTANTS
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const API_ENDPOINTS = {
  // Auth
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  PROFILE: '/user/profile',
  
  // Products
  SEARCH: '/api/products/search',
  PERSONALIZED: '/api/products/personalized',
  LANDING: '/api/products/landing',
  PRODUCT_DETAIL: (id: number) => `/api/products/${id}`,
  SIMILAR_PRODUCTS: (id: number) => `/api/products/similar/${id}`,
  TRACK_VIEW: '/api/products/view',
  VIEW_HISTORY: '/api/products/view-history',
  CATEGORIES: '/api/products/categories',
  
  // Health
  HEALTH: '/health',
};

// APP CONSTANTS
export const APP_CONFIG = {
  APP_NAME: 'Healthcare Recommendation',
  DEFAULT_PAGE_SIZE: 20,
  MAX_SEARCH_HISTORY: 10,
  MAX_VIEW_HISTORY: 50,
  RECOMMENDATION_LIMIT: 10,
};

// UI CONSTANTS
export const UI_CONFIG = {
  // Breakpoints
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
  },
  
  // Colors
  COLORS: {
    primary: '#10B981', // Emerald
    secondary: '#3B82F6', // Blue
    accent: '#F59E0B', // Amber
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    }
  },
  
  // Spacing
  SPACING: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
};

// PRODUCT CONSTANTS
export const PRODUCT_CATEGORIES = [
  'Vitamin',
  'Khoáng chất',
  'Thảo dược',
  'Probiotic',
  'Amino acid',
  'Omega-3',
  'Collagen',
  'Chống oxy hóa',
  'Chống viêm',
  'Hormone giấc ngủ',
];

export const HEALTH_GOALS = [
  'Tăng đề kháng',
  'Làm đẹp',
  'Tim mạch',
  'Trí não',
  'Kháng viêm',
  'Thư giãn',
  'Ngủ ngon',
  'Tiêu hóa',
  'Miễn dịch',
  'Xương chắc',
  'Tăng năng lượng',
  'Giảm stress',
  'Bổ máu',
  'Trí nhớ',
  'Tuần hoàn',
  'Tâm trạng',
  'Kháng dị ứng',
];

// STORAGE KEYS
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  USER_PROFILE: 'user_profile',
  VIEW_HISTORY: 'view_history',
  SEARCH_HISTORY: 'search_history',
  THEME: 'theme',
};
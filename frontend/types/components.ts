import { ReactNode } from 'react';

// COMMON PROPS
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

export interface ClickableProps extends BaseProps {
  onClick?: () => void;
  disabled?: boolean;
}

// CARD PROPS
export interface ProductCardProps {
  product: {
    id: number;
    name: string;
    category: string;
    description: string;
    match_score?: number;
    health_goal?: string;
  };
  showCategory?: boolean;
  showScore?: boolean;
  onView?: (id: number) => void;
  className?: string;
}

export interface CategoryCardProps {
  category: {
    category: string;
    count: number;
    featured_product: any;
  };
  className?: string;
}

// LAYOUT PROPS
export interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export interface HeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  showAuth?: boolean;
}

// PAGE PROPS
export interface HomePageProps {
  featuredCategories?: any[];
  popularProducts?: any[];
  personalizedRecommendations?: any[];
}

export interface SearchPageProps {
  query?: string;
  results?: any[];
  isLoading?: boolean;
}

export interface ProductDetailPageProps {
  productId: number;
}

export interface ProfilePageProps {
  showSurvey?: boolean;
}

// FORM PROPS
export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export interface SurveyFormProps {
  onComplete?: (data: any) => void;
  defaultValues?: any;
}

export interface SearchFormProps {
  onSubmit: (query: string) => void;
  defaultValue?: string;
  placeholder?: string;
  isLoading?: boolean;
}

// MODAL PROPS
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup' | 'survey';
}

// SECTION PROPS
export interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export interface ProductGridProps {
  products: any[];
  title?: string;
  emptyMessage?: string;
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

export interface CategoryGridProps {
  categories: any[];
  title?: string;
  columns?: 2 | 3 | 4;
}
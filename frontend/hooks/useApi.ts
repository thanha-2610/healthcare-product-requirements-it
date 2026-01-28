import { useState, useCallback } from 'react'; 
import { productApi, checkApiHealth } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';

export const useApiHealth = () => {
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const healthy = await checkApiHealth();
      setIsHealthy(healthy);
      return healthy;
    } catch (error) {
      setIsHealthy(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { isHealthy, isChecking, checkHealth };
};

export const useProductActions = () => {
  const { user } = useAuthStore();
  const { trackProductView, getViewHistory } = useProductStore();

  const handleProductView = useCallback(async (productId: number) => {
    // Track view
    await trackProductView(productId);
    
    // Refresh view history
    if (user?.email) {
      await getViewHistory();
    }
  }, [trackProductView, getViewHistory, user?.email]);

  return { handleProductView };
};

export const useSearch = () => {
  const { searchProducts, clearSearchResults, isLoading } = useProductStore();
  
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      clearSearchResults();
      return;
    }
    
    await searchProducts(query);
  }, [searchProducts, clearSearchResults]);

  return {
    handleSearch,
    isLoading,
  };
};

export const usePersonalizedData = () => {
  const { getPersonalizedRecommendations, getLandingPageData } = useProductStore();
  const { user, isLoggedIn } = useAuthStore();
  
  const loadPersonalizedData = useCallback(async () => {
    if (isLoggedIn && user?.profile) {
      await getPersonalizedRecommendations();
    } else {
      await getLandingPageData();
    }
  }, [isLoggedIn, user?.profile, getPersonalizedRecommendations, getLandingPageData]);

  return { loadPersonalizedData };
};
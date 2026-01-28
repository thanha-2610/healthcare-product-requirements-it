import { useState, useCallback } from 'react';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';

export const useSearch = () => {
  const { searchProducts, clearSearchResults, isLoading } = useProductStore();
  const { user } = useAuthStore();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history từ localStorage
  const loadSearchHistory = useCallback(() => {
    const saved = localStorage.getItem('search_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing search history:', e);
      }
    }
  }, []);

  // Save search history
  const saveSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('search_history', JSON.stringify(updated));
  }, [searchHistory]);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      clearSearchResults();
      return;
    }
    
    await searchProducts(query);
    saveSearchHistory(query);
  }, [searchProducts, clearSearchResults, saveSearchHistory]);

  return {
    handleSearch,
    isLoading,
    searchHistory,
    loadSearchHistory,
    clearSearchHistory,
  };
};
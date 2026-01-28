"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Filter, Clock, TrendingUp, Star, CircleChevronLeft, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card"; 
import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/authStore";
import { useSearch } from "@/hooks/useApi";
import { formatProductDescription, capitalizeFirst, timeAgo } from "@/utils";
import { Product } from "@/types";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

export default function SearchComp() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "match" | "name">("relevance");

  const { 
    searchResults, 
    isLoading, 
    error, 
    categories,
    clearSearchResults 
  } = useProductStore();
  
  const { user } = useAuthStore();
  const { handleSearch } = useSearch();

  // Load search history từ localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("search_history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing search history:", e);
      }
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Thực hiện search khi debouncedQuery thay đổi
  useEffect(() => {
    if (debouncedQuery) {
      handleSearch(debouncedQuery);
      saveToSearchHistory(debouncedQuery);
    }
  }, [debouncedQuery, handleSearch]);

  // Lấy categories khi component mount
  useEffect(() => {
    // Categories đã được load từ store
  }, []);

  // Lưu search history
  const saveToSearchHistory = useCallback((query: string) => {
    if (!query.trim() || searchHistory.includes(query)) return;
    
    const updatedHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem("search_history", JSON.stringify(updatedHistory));
  }, [searchHistory]);

  // Xóa search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem("search_history");
  }, []);

  // Xóa một item khỏi history
  const removeFromHistory = useCallback((query: string) => {
    const updatedHistory = searchHistory.filter(q => q !== query);
    setSearchHistory(updatedHistory);
    localStorage.setItem("search_history", JSON.stringify(updatedHistory));
  }, [searchHistory]);

  // Xử lý search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery.trim());
      saveToSearchHistory(searchQuery.trim());
    }
  };

  // Xử lý click vào history item
  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  // Xử lý click vào sản phẩm
  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  // Filter và sort products
  const getFilteredProducts = useCallback(() => {
    if (!searchResults.length) return [];

    let filtered = [...searchResults];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "match":
          return (b.match_score || 0) - (a.match_score || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "relevance":
        default:
          return (b.relevance || 0) - (a.relevance || 0);
      }
    });

    return filtered;
  }, [searchResults, selectedCategory, sortBy]);

  // Lấy unique categories từ search results
  const getResultCategories = useCallback(() => {
    const categories = new Set(searchResults.map(p => p.category));
    return Array.from(categories).sort();
  }, [searchResults]);

  const filteredProducts = getFilteredProducts();
  const resultCategories = getResultCategories();

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    clearSearchResults();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-cyan-700 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
            <CircleChevronLeft size={20} />
            </Button>

            {/* Search Input */}
            <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, triệu chứng, mục tiêu sức khỏe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 py-1 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </Button>
                )}
              </div>
            </form>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? "default" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-xl ${showFilters ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Category Filter */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Danh mục</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        className={`cursor-pointer ${selectedCategory === "all" ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        onClick={() => setSelectedCategory("all")}
                      >
                        Tất cả
                      </Badge>
                      {resultCategories.map((category) => (
                        <Badge
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          className={`cursor-pointer ${selectedCategory === category ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Sắp xếp</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "relevance", label: "Độ liên quan", icon: TrendingUp },
                        { id: "match", label: "Độ phù hợp", icon: Star },
                        { id: "name", label: "Tên A-Z", icon: null }
                      ].map((option) => {
                        const Icon = option.icon as any;
                        return (
                          <Badge
                            key={option.id}
                            variant={sortBy === option.id ? "default" : "outline"}
                            className={`cursor-pointer gap-1 ${sortBy === option.id ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                            onClick={() => setSortBy(option.id as any)}
                          >
                            {Icon && <Icon className="w-3 h-3" />}
                            {option.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoading && !searchResults.length ? (
          // Loading State
          <div className="space-y-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : error ? (
          // Error State
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => handleSearch(debouncedQuery || searchQuery)}>
              Thử lại
            </Button>
          </div>
        ) : debouncedQuery ? (
          // Search Results
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Kết quả tìm kiếm cho - {debouncedQuery}
              </h1>
              <p className="text-gray-600">
                Tìm thấy <span className="font-semibold text-blue-600">{filteredProducts.length}</span> sản phẩm phù hợp
                {selectedCategory !== "all" && ` trong danh mục "${selectedCategory}"`}
              </p>
            </div>

            {/* Results Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleProductClick(product.id)}
                  />
                ))}
              </div>
            ) : (
              // No Results
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-6">
                  Không có sản phẩm nào phù hợp với {debouncedQuery}
                  {selectedCategory !== "all" && ` trong danh mục "${selectedCategory}"`}
                </p>
                <Button variant="outline" onClick={handleClearSearch}>
                  Xóa tìm kiếm
                </Button>
              </div>
            )}
          </>
        ) : (
          // Empty State - Show Search History & Suggestions
          <div className="max-w-4xl mx-auto">
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Lịch sử tìm kiếm
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearchHistory}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Xóa tất cả
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 10).map((query, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer group hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                      onClick={() => handleHistoryClick(query)}
                    >
                      {query}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(query);
                        }}
                      >
                        <X className="w-3 h-3 text-gray-400 group-hover:text-blue-400" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tìm kiếm phổ biến
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  "Vitamin C",
                  "Mất ngủ",
                  "Căng thẳng",
                  "Tiêu hóa",
                  "Tăng đề kháng",
                  "Đau đầu",
                  "Dạ dày",
                  "Xương khớp"
                ].map((query) => (
                  <Button
                    key={query}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border-sky-200"
                    onClick={() => handleHistoryClick(query)}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Suggestions */}
            {categories.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  🏷️ Danh mục nổi bật
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.slice(0, 8).map((category) => (
                    <Card
                      key={category.category}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200"
                      onClick={() => {
                        setSearchQuery(category.category);
                        handleSearch(category.category);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <h3 className="font-medium text-gray-900">{category.category}</h3>
                        <p className="text-sm text-gray-500 mt-1">{category.count} sản phẩm</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Search Tips */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-blue-50 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Lightbulb size={20} color="orange"/> <span>Mẹo tìm kiếm hiệu quả</span>
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Nhập triệu chứng như .mất ngủ., .căng thẳng., .đau đầu.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Tìm theo mục tiêu sức khỏe: .tăng đề kháng., .làm đẹp., .tim mạch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Sử dụng tên sản phẩm hoặc thành phần: .Vitamin C., .Omega-3., .Collagen.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Kết hợp nhiều từ khóa để tìm chính xác hơn</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="group cursor-pointer overflow-hidden h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200"
        onClick={onClick}
      >
        <div className="relative">
          {/* Product Image Placeholder */}
          <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-100 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/80 text-blue-600 mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-blue-700">{product.category}</span>
            </div>
          </div>

          {/* Match Score Badge */}
          {product.match_score && product.match_score > 0 && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-600 hover:bg-blue-700">
                <Star className="w-3 h-3 mr-1" />
                {product.match_score}% phù hợp
              </Badge>
            </div>)}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 line-clamp-2">
              {product.name}
            </h3>
          </div>

          <div className="space-y-3">
            {/* Category */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
              {product.target_gender && product.target_gender !== "All" && (
                <Badge variant="outline" className="text-xs">
                  {product.target_gender}
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-3">
              {formatProductDescription(product.description, 120)}
            </p>

            {/* Health Goals */}
            {product.health_goal && (
              <div>

                <p className="text-xs font-medium text-gray-700 mb-1">Mục tiêu:</p>
                <p className="text-sm text-blue-600 font-medium">
                  {product.health_goal}
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            variant="ghost"
            className="w-full group-hover:bg-blue-600 group-hover:text-white"
          >
            Xem chi tiết
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
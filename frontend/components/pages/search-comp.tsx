"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Filter,
  Clock,
  TrendingUp,
  Star,
  CircleChevronLeft,
  Lightbulb,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/authStore";
import { useSearch } from "@/hooks/useApi";
import { Product } from "@/types";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { ProductCard } from "../ui/product-card";
import { RecommendedProductsComp } from "../recommended-products";

export default function SearchComp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    // Run on client-side only
    if (typeof window === "undefined") return [];

    const savedHistory = localStorage.getItem("search_history");
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch (e) {
        console.error("Error parsing search history:", e);
        return [];
      }
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "match" | "name">(
    "relevance",
  );

  const { searchResults, isLoading, error, categories, clearSearchResults } =
    useProductStore();

  const { user } = useAuthStore();
  const { handleSearch } = useSearch();

  // Age range options
  const ageRanges = [
    { id: "all", label: "All Ages" },
    { id: "18-25", label: "18-25" },
    { id: "26-40", label: "26-40" },
    { id: "41-60", label: "41-60" },
    { id: "61+", label: "60+" },
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get categories when component mounts
  useEffect(() => {
    // Categories already loaded from store
  }, []);

  // Save search history
  const saveToSearchHistory = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearchHistory((prev) => {
      // If already in history, move to top, otherwise add new
      const filtered = prev.filter((q) => q !== trimmedQuery);
      const updated = [trimmedQuery, ...filtered].slice(0, 10);

      // Save to localStorage directly here
      localStorage.setItem("search_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Sync search input with query param in URL reactively
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      setDebouncedQuery(queryParam);
    }
  }, [queryParam]);

  useEffect(() => {
    if (debouncedQuery) {
      handleSearch(debouncedQuery);
      // Sync query parameter reactively into the browser URL
      if (typeof window !== "undefined") {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get("q") !== debouncedQuery) {
          router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`);
        }
      }
    }
  }, [debouncedQuery, handleSearch, router]);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem("search_history");
  }, []);

  // Remove an item from history
  const removeFromHistory = useCallback(
    (query: string) => {
      const updatedHistory = searchHistory.filter((q) => q !== query);
      setSearchHistory(updatedHistory);
      localStorage.setItem("search_history", JSON.stringify(updatedHistory));
    },
    [searchHistory],
  );

  // When user presses Enter or Search button
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      handleSearch(query);
      saveToSearchHistory(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
    saveToSearchHistory(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // Handle product click
  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  // Check product compatibility with age group
  const checkAgeCompatibility = (
    product: Product,
    ageRange: string,
  ): boolean => {
    if (ageRange === "all" || !product.age_range) return true;

    const productAgeRange = product.age_range.toString();

    if (ageRange === "18-25") {
      return (
        productAgeRange.includes("18") ||
        productAgeRange.includes("25") ||
        productAgeRange === "all" ||
        productAgeRange.includes("young")
      );
    }

    if (ageRange === "26-40") {
      return (
        productAgeRange.includes("26") ||
        productAgeRange.includes("30") ||
        productAgeRange.includes("40") ||
        productAgeRange === "all" ||
        productAgeRange.includes("adult")
      );
    }

    if (ageRange === "41-60") {
      return (
        productAgeRange.includes("41") ||
        productAgeRange.includes("50") ||
        productAgeRange.includes("60") ||
        productAgeRange === "all" ||
        productAgeRange.includes("middle")
      );
    }

    if (ageRange === "61+") {
      return (
        productAgeRange.includes("61") ||
        productAgeRange.includes("70") ||
        productAgeRange.includes("80") ||
        productAgeRange === "all" ||
        productAgeRange.includes("senior") ||
        productAgeRange.includes("elder")
      );
    }

    return true;
  };

  // Filter and sort products
  const getFilteredProducts = useCallback(() => {
    if (!searchResults.length) return [];

    let filtered = [...searchResults];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Filter by age range
    if (selectedAgeRange !== "all") {
      filtered = filtered.filter((product) =>
        checkAgeCompatibility(product, selectedAgeRange),
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
  }, [searchResults, selectedCategory, selectedAgeRange, sortBy]);

  // Get unique categories from search results
  const getResultCategories = useCallback(() => {
    const categories = new Set(searchResults.map((p) => p.category));
    return Array.from(categories).sort();
  }, [searchResults]);

  const filteredProducts = getFilteredProducts();
  const resultCategories = getResultCategories();

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedAgeRange("all");
    clearSearchResults();
    router.replace("/search");
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedAgeRange("all");
    setSortBy("relevance");
  };

  // Calculate active filters count
  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedAgeRange !== "all",
    sortBy !== "relevance",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 md:pt-28 pb-12">
      {/* Search Header Wrapper inside Page Flow */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="bg-gradient-to-br from-cyan-800 to-sky-700 text-white rounded-lg p-2 mb-8 shadow-lg border border-cyan-600/30">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              {/* <Button
                variant="outline"
                size="icon"
                className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white h-11 w-11"
                onClick={() => router.back()}
              >
                <CircleChevronLeft size={22} />
              </Button> */}
              <div>
                <h2 className="text-xl font-bold md:text-2xl">Search Products</h2>
                <p className="text-xs text-cyan-200">Find wellness solutions tailored to you</p>
              </div>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search products, symptoms, health goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 py-6 rounded-lg border-0 bg-white/40 text-white focus:ring-2 focus:ring-cyan-500 shadow-sm placeholder:text-gray-300"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-white h-6 w-6 text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </form>

            {/* Filter Toggle */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              {activeFiltersCount > 0 && (
                <Badge className="bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-lg px-4 py-6 flex items-center gap-2 font-semibold h-11 transition-all ${showFilters
                  ? "bg-amber-500 hover:bg-amber-600 border-0 text-white"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                  }`}
              >
                <Filter size={18} />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== "all" || selectedAgeRange !== "all") && (
            <div className="mt-5 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-cyan-200">Active Filters:</span>
                  {selectedCategory !== "all" && (
                    <Badge className="bg-blue-600 text-white gap-1 px-3 py-1 rounded-lg">
                      Category: {selectedCategory}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 p-0 hover:bg-transparent text-white"
                        onClick={() => setSelectedCategory("all")}
                      >
                        <X className="w-2.5 h-2.5" />
                      </Button>
                    </Badge>
                  )}
                  {selectedAgeRange !== "all" && (
                    <Badge className="bg-green-600 text-white gap-1 px-3 py-1 rounded-lg">
                      Age: {ageRanges.find((r) => r.id === selectedAgeRange)?.label}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 p-0 hover:bg-transparent text-white"
                        onClick={() => setSelectedAgeRange("all")}
                      >
                        <X className="w-2.5 h-2.5" />
                      </Button>
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-cyan-200 hover:text-white hover:bg-white/10 rounded-lg px-3"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5 border-t border-white/10 space-y-5">
                  {/* Category Filter */}
                  <div>
                    <h4 className="font-semibold text-cyan-100 text-sm mb-2.5 uppercase tracking-wider">Category</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1 text-xs transition-all ${selectedCategory === "all"
                          ? "bg-amber-500 hover:bg-amber-600 border-0 text-white"
                          : "bg-white/10 border-white/20 text-cyan-100 hover:bg-white/20"
                          }`}
                        onClick={() => setSelectedCategory("all")}
                      >
                        All Categories
                      </Badge>
                      {resultCategories.map((category) => (
                        <Badge
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          className={`cursor-pointer px-3 py-1 text-xs transition-all ${selectedCategory === category
                            ? "bg-amber-500 hover:bg-amber-600 border-0 text-white"
                            : "bg-white/10 border-white/20 text-cyan-100 hover:bg-white/20"
                            }`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Age Range Filter */}
                  <div>
                    <h4 className="font-semibold text-cyan-100 text-sm mb-2.5 uppercase tracking-wider">Age Group</h4>
                    <div className="flex flex-wrap gap-2">
                      {ageRanges.map((range) => (
                        <Badge
                          key={range.id}
                          variant={selectedAgeRange === range.id ? "default" : "outline"}
                          className={`cursor-pointer px-3 py-1 text-xs transition-all ${selectedAgeRange === range.id
                            ? "bg-green-600 hover:bg-green-700 border-0 text-white"
                            : "bg-white/10 border-white/20 text-cyan-100 hover:bg-white/20"
                            }`}
                          onClick={() => setSelectedAgeRange(range.id)}
                        >
                          {range.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <h4 className="font-semibold text-cyan-100 text-sm mb-2.5 uppercase tracking-wider">Sort Results</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "relevance", label: "Relevance", icon: TrendingUp },
                        { id: "match", label: "Health Match", icon: Star },
                        { id: "name", label: "Name A-Z", icon: null },
                      ].map((option) => {
                        const Icon = option.icon as any;
                        return (
                          <Badge
                            key={option.id}
                            variant={sortBy === option.id ? "default" : "outline"}
                            className={`cursor-pointer gap-1 px-3 py-1 text-xs transition-all ${sortBy === option.id
                              ? "bg-purple-600 hover:bg-purple-700 border-0 text-white"
                              : "bg-white/10 border-white/20 text-cyan-100 hover:bg-white/20"
                              }`}
                            onClick={() => setSortBy(option.id as any)}
                          >
                            {Icon && <Icon className="w-3.5 h-3.5" />}
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
      <div className="container mx-auto max-w-7xl px-4 py-6 ">
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              An error occurred
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => handleSearch(debouncedQuery || searchQuery)}>
              Try Again
            </Button>
          </div>
        ) : debouncedQuery ? (
          // Search Results
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Search results for &quot;{debouncedQuery}&quot;
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-gray-600">
                <span>Found</span>
                <span className="font-semibold text-blue-600">
                  {filteredProducts.length}
                </span>
                <span>matching products</span>

                {(selectedCategory !== "all" || selectedAgeRange !== "all") && (
                  <>
                    <span className="mx-1">•</span>
                    <div className="flex items-center gap-2">
                      {selectedCategory !== "all" && (
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-200"
                        >
                          {selectedCategory}
                        </Badge>
                      )}
                      {selectedAgeRange !== "all" && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          {
                            ageRanges.find((r) => r.id === selectedAgeRange)
                              ?.label
                          }
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
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
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  No products match &quot;{debouncedQuery}&quot;.
                  {(selectedCategory !== "all" ||
                    selectedAgeRange !== "all") && (
                      <span> in the current filters</span>
                    )}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button onClick={handleClearSearch}>New Search</Button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty State - Show Search History & Suggestions
          <div >
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Search History
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearchHistory}
                    className="text-gray-500 hover:text-gray-200"
                  >
                    Clear All
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
                Popular Searches
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  "Vitamin C",
                  "Insomnia",
                  "Stress",
                  "Digestion",
                  "Immune Support",
                  "Headache",
                  "Stomach Pain",
                  "Joint Pain",
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

            {/* Search Tips */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-blue-50 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Lightbulb size={20} color="orange" />{" "}
                <span>Effective Search Tips</span>
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>
                    Enter symptoms like &quot;insomnia&quot;, &quot;stress&quot;, &quot;headache&quot;
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>
                    Search by health goal: &quot;immune support&quot;, &quot;beauty&quot;, &quot;heart health&quot;
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>
                    Use product names or ingredients: &quot;Vitamin C&quot;, &quot;Omega-3&quot;, &quot;Collagen&quot;
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Combine multiple keywords for more accurate results</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <RecommendedProductsComp />

    </div>
  );
}

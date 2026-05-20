"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "./ui/product-card";
import { useProductStore } from "@/store/productStore";

export function RecommendedProductsComp() {
  const {
    personalizedRecommendations,
    popularProducts,
    isLoading,
    error,
    getLandingPageData,
  } = useProductStore();

  useEffect(() => {
    getLandingPageData();
  }, [getLandingPageData]);

  const products =
    personalizedRecommendations && personalizedRecommendations.length > 0
      ? personalizedRecommendations
      : popularProducts || [];

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 2. Sản phẩm gợi ý ngẫu nhiên */}
      <section className="pt-8 md:pt-16 lg:pt-24" id="recommended-products">
        <div className="mb-8 px-4 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Recommended for You
            </h2>
            <p className="text-slate-500">
              Health care products you may be interested in
            </p>
          </div>

          {!isLoading && products.length > 0 && (
            <Badge variant="outline" className="border-blue-200 text-blue-600">
              {products.length} products
            </Badge>
          )}
        </div>

        <div className="px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl p-6 min-h-[300px]"
                >
                  <Skeleton className="h-48 w-full rounded-xl mb-4" />
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

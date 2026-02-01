// components/ui/product-card.tsx
"use client";

import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    category: string;
    price?: number;
    image_url?: string;
    rating?: number;
    relevance?: number;
    age_range?: string;
    target_gender?: string;
    health_goal?: string;
    image?: string; // Thêm image cho compatibility
  };
  onClick: () => void;
  className?: string;
}

export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const formatPrice = (price?: number) => {
    if (!price || price === 0) return "Liên hệ";

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Lấy URL hình ảnh (ưu tiên image_url, sau đó image, sau đó placeholder)
  const getImageUrl = () => {
    if (product.image_url) return product.image_url;
    if (product.image) return product.image;
    return "/placeholder-product.jpg";
  };

  // Lấy rating với giá trị mặc định
  const getRating = () => {
    if (product.rating) return product.rating;
    if (product.relevance && product.relevance > 0) {
      // Chuyển đổi relevance (0-1) sang rating (1-5)
      return (product.relevance * 4 + 1).toFixed(1);
    }
    return "4.5";
  };

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg",
        className,
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
        <img
          src={getImageUrl()}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback khi ảnh lỗi
            (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80"
          onClick={(e) => {
            e.stopPropagation();
            // Add to wishlist logic here
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>
        {product.relevance && product.relevance > 0.7 && (
          <Badge className="absolute left-2 top-2 bg-green-500 hover:bg-green-600">
            Phù hợp {Math.round(product.relevance * 100)}%
          </Badge>
        )}
        {product.age_range && (
          <Badge
            variant="outline"
            className="absolute left-2 bottom-2 bg-white/80 backdrop-blur-sm"
          >
            {product.age_range}
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between">
          <Badge variant="outline" className="text-xs">
            {product.category || "Y tế"}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{getRating()}</span>
          </div>
        </div>

        <h3
          className="mb-2 line-clamp-2 text-lg font-semibold leading-tight hover:text-primary cursor-pointer"
          onClick={onClick}
        >
          {product.name}
        </h3>

        <p className="mb-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {product.description || "Sản phẩm chăm sóc sức khỏe chất lượng"}
        </p>

        {/* Additional Info */}
        <div className="mb-3 space-y-1 text-xs">
          {product.target_gender && product.target_gender !== "All" && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Giới tính:</span>
              <span className="font-medium">
                {product.target_gender === "Male"
                  ? "Nam"
                  : product.target_gender === "Female"
                    ? "Nữ"
                    : product.target_gender}
              </span>
            </div>
          )}
          {product.health_goal && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Mục tiêu:</span>
              <span className="font-medium line-clamp-1">
                {product.health_goal}
              </span>
            </div>
          )}
        </div>

        {/* Price and Action */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>
            {product.relevance && product.relevance > 0 && (
              <div className="text-xs text-muted-foreground">
                Độ phù hợp: {Math.round(product.relevance * 100)}%
              </div>
            )}
          </div>
          <Button size="sm" onClick={onClick}>
            Xem chi tiết
          </Button>
        </div>
      </div>
    </div>
  );
}

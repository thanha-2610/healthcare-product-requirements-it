"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Interface cho category từ API
interface Category {
  category: string;
  count: number;
  image?: string; // Thêm trường image nếu API có
}

const defaultCategories = [
  {
    title: "Thực phẩm Chức năng",
    image: "/featured-categories-0.png",
    href: "/search?q=Thực phẩm chức năng",
    category: "Thực phẩm chức năng",
  },
  {
    title: "Thiết bị Y tế Gia đình",
    image: "/featured-categories-1.png",
    href: "/search?q=Thiết bị y tế",
    category: "Thiết bị y tế",
  },
  {
    title: "Chăm sóc Cá nhân",
    image: "/featured-categories-2.png",
    href: "/search?q=Chăm sóc cá nhân",
    category: "Chăm sóc cá nhân",
  },
  {
    title: "Hỗ trợ Giấc ngủ",
    image: "/featured-categories-3.png",
    href: "/search?q=Hỗ trợ giấc ngủ",
    category: "Hỗ trợ giấc ngủ",
  },
];

export function CommerceHero() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/products/categories",
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === "success" && Array.isArray(data.categories)) {
          // Chuyển đổi categories từ API sang định dạng cần thiết
          const apiCategories = data.categories.map(
            (catName: string, index: number) => ({
              category: catName,
              count: 0, // Bạn có thể lấy count từ API nếu có
              image:
                defaultCategories[index % defaultCategories.length]?.image ||
                "/placeholder-category.png",
            }),
          );

          // Lấy top 4 categories (hoặc tất cả nếu ít hơn 4)
          const topCategories = apiCategories.slice(0, 4);
          setCategories(topCategories);
        } else {
          // Fallback to default categories
          setCategories(
            defaultCategories.map((cat) => ({
              category: cat.category,
              count: 0,
              image: cat.image,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Không thể tải danh mục. Đang sử dụng danh mục mặc định.");
        // Fallback to default categories
        setCategories(
          defaultCategories.map((cat) => ({
            category: cat.category,
            count: 0,
            image: cat.image,
          })),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Hàm xử lý click vào category
  const handleCategoryClick = (categoryName: string) => {
    // Điều hướng đến trang search với query là tên category
    router.push(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  // Hàm lấy hình ảnh cho category
  const getCategoryImage = (categoryName: string, index: number) => {
    // Tìm category name tương ứng trong defaultCategories
    const matchedCategory = defaultCategories.find(
      (cat) => cat.category.toLowerCase() === categoryName.toLowerCase(),
    );

    if (matchedCategory) return matchedCategory.image;

    // Fallback to default images based on index
    return (
      defaultCategories[index % defaultCategories.length]?.image ||
      "/placeholder-category.png"
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Grid Categories Section */}
      <div className="mt-12">
        <div className="flex items-end justify-between mb-8 px-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Danh mục nổi bật
            </h2>
            <p className="text-slate-500">
              Khám phá các nhóm sản phẩm được chuyên gia khuyên dùng
            </p>
          </div>

          {!isLoading && categories.length > 0 && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {categories.length} danh mục
            </Badge>
          )}
        </div>

        {isLoading ? (
          // Loading state
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white border border-blue-200 shadow-sm rounded-3xl p-6 min-h-[320px]"
              >
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-48 w-full rounded-xl mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
              {defaultCategories.map((category, index) => (
                <CategoryCard
                  key={category.title}
                  category={category}
                  index={index}
                  onClick={() => handleCategoryClick(category.category)}
                />
              ))}
            </div>
          </div>
        ) : categories.length > 0 ? (
          // Success state - show categories from API
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
            {categories.map((cat, index) => {
              const categoryCard = {
                title: cat.category,
                image: getCategoryImage(cat.category, index),
                href: `/search?q=${encodeURIComponent(cat.category)}`,
                category: cat.category,
              };

              return (
                <CategoryCard
                  key={cat.category}
                  category={categoryCard}
                  index={index}
                  count={cat.count}
                  onClick={() => handleCategoryClick(cat.category)}
                />
              );
            })}
          </div>
        ) : (
          // No categories state
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Không có danh mục nào</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
              {defaultCategories.map((category, index) => (
                <CategoryCard
                  key={category.title}
                  category={category}
                  index={index}
                  onClick={() => handleCategoryClick(category.category)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Separate CategoryCard component
interface CategoryCardProps {
  category: {
    title: string;
    image: string;
    href: string;
    category: string;
  };
  index: number;
  count?: number;
  onClick: () => void;
}

function CategoryCard({ category, index, count, onClick }: CategoryCardProps) {
  return (
    <motion.div
      className="group relative bg-white border border-blue-200 shadow-sm hover:shadow-md shadow-sky-200 rounded-3xl p-6 min-h-[320px] overflow-hidden transition-all duration-500 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {category.title}
          </h3>
          {count !== undefined && count > 0 && (
            <Badge
              variant="outline"
              className="text-xs bg-blue-50 text-blue-600 border-blue-200"
            >
              {count}+
            </Badge>
          )}
        </div>

        <div className="flex-grow flex items-center justify-center relative">
          {/* Vòng tròn decor phía sau ảnh */}
          <div className="absolute w-32 h-32 bg-cyan-50 rounded-full group-hover:scale-125 transition-transform duration-500" />

          <div className="relative z-10 group-hover:rotate-6 transition-all duration-500">
            <Image
              height={180}
              width={180}
              src={category.image || "/placeholder-category.png"}
              alt={category.title}
              className="object-contain"
              onError={(e) => {
                // Fallback image on error
                (e.target as HTMLImageElement).src =
                  "/placeholder-category.png";
              }}
            />
          </div>
        </div>

        <div className="mt-auto flex justify-between items-center">
          <span className="text-sm font-medium text-slate-500 group-hover:text-blue-500 transition-colors">
            Xem sản phẩm
          </span>
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

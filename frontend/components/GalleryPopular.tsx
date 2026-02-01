"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/ui/product-card";
import { useProductStore } from "@/store/productStore";
import { Skeleton } from "@/components/ui/skeleton";

interface GalleryProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  price?: number;
  image_url?: string;
  rating?: number;
}

const GalleryPopular = ({
  heading = "Sản phẩm phổ biến",
  limit = 8,
}: {
  heading?: string;
  limit?: number;
}) => {
  const router = useRouter();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const { popularProducts, getLandingPageData, isLoading } = useProductStore();

  // 1. Gọi API khi component mount
  useEffect(() => {
    getLandingPageData();
  }, [getLandingPageData]);

  // 2. Sử dụng useMemo để tự động convert data khi popularProducts thay đổi
  // Cách này an toàn hơn useState vì nó phản ứng trực tiếp với Store
  const items = useMemo(() => {
    if (!popularProducts) return [];

    return popularProducts.slice(0, limit).map((product: any) => ({
      id: product.id || 0,
      name: product.name || "Không có tên",
      description: product.description || product.summary || "",
      category: product.category || "Khác",
      price: product.price || 0,
      image_url:
        product.image_url || product.image || "/placeholder-product.jpg",
      rating: product.rating || 4.5,
    }));
  }, [popularProducts, limit]);

  // 3. Carousel controls logic
  useEffect(() => {
    if (!carouselApi) return;

    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    updateSelection();
    carouselApi.on("select", updateSelection);

    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  // Hiển thị Skeleton khi đang loading hoặc khi dữ liệu chưa về
  if (isLoading && items.length === 0) {
    return <GallerySkeleton heading={heading} />;
  }

  // Nếu đã load xong mà thực sự không có data thì ẩn cả section
  if (!isLoading && items.length === 0) return null;

  return (
    <section className="py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-col justify-between md:mb-14 md:flex-row md:items-end lg:mb-16">
          <div>
            <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl lg:text-4xl">
              {heading}
            </h2>
          </div>
          {items.length > 0 && (
            <div className="mt-8 flex shrink-0 items-center justify-start gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => carouselApi?.scrollPrev()}
                disabled={!canScrollPrev}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => carouselApi?.scrollNext()}
                disabled={!canScrollNext}
              >
                <ArrowRight className="size-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "start",
            dragFree: true,
            slidesToScroll: "auto",
          }}
          className="relative"
        >
          <CarouselContent className="-ml-4 2xl:ml-[max(8rem,calc(50vw-700px+1rem))]">
            {items.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:max-w-[360px]"
              >
                <ProductCard
                  product={product}
                  onClick={() => handleProductClick(product.id)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

const GallerySkeleton = ({ heading = "" }: { heading: string }) => (
  <section className="py-12 md:py-20">
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col justify-between md:mb-14 md:flex-row md:items-end">
        <div>
          <Skeleton className="mb-3 h-10 w-64 md:mb-4 md:h-12" />
        </div>
        <div className="mt-8 flex shrink-0 items-center justify-start gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-[300px] flex-shrink-0">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="mt-4 h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export { GalleryPopular };

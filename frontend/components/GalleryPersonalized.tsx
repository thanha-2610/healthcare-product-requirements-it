"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/ui/skeleton";

interface GalleryProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  price?: number;
  image_url?: string;
  rating?: number;
  relevance?: number;
  image?: string;
}

const GalleryPersonalized = ({
  heading = "Gợi ý cá nhân hóa cho bạn",
  limit = 8,
}: {
  heading?: string;
  limit?: number;
}) => {
  const router = useRouter();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [items, setItems] = useState<GalleryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    personalizedRecommendations,
    getPersonalizedRecommendations,
    isLoading,
  } = useProductStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await getPersonalizedRecommendations();

        const convertedItems = personalizedRecommendations
          .slice(0, limit)
          .map((product: any) => ({
            id: product.id || 0,
            name: product.name || "Không có tên",
            description: product.description || product.summary || "",
            category: product.category || "Khác",
            price: product.price || product.price_range || 0,
            image_url:
              product.image_url || product.image || "/placeholder-product.jpg",
            rating: product.rating || 4.5,
            relevance: product.relevance || product.match_score || 0,
            image:
              product.image || product.image_url || "/placeholder-product.jpg",
          }));

        setItems(convertedItems);
      } catch (error) {
        console.error("Error fetching personalized recommendations:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, limit]);

  // Carousel controls
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

  // Không hiển thị gì nếu chưa đăng nhập
  if (!user) {
    return null;
  }

  if (loading || isLoading) {
    return <GallerySkeleton heading={heading} />;
  }

  if (items.length === 0) {
    // Vẫn hiển thị section nhưng có thông báo
    return (
      <section className="py-12 md:py-20">
        <div className="container mx-auto">
          <div className="mb-8 md:mb-14 lg:mb-16">
            <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl lg:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">
              Chúng tôi đang phân tích để đưa ra gợi ý phù hợp cho bạn
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-col justify-between md:mb-14 md:flex-row md:items-end lg:mb-16">
          <div>
            <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl lg:text-4xl">
              {heading}
            </h2>
            <p className="text-sm text-muted-foreground">
              Dựa trên hồ sơ sức khỏe và lịch sử xem của bạn
            </p>
          </div>
          {items.length > 3 && (
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
          className="relative left-[-1rem]"
        >
          <CarouselContent className="-mr-4 ml-8 2xl:ml-[max(8rem,calc(50vw-700px+1rem))] 2xl:mr-[max(0rem,calc(50vw-700px-1rem))]">
            {items.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-4 md:max-w-[320px] lg:max-w-[360px]"
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
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-[300px] flex-shrink-0">
            <Skeleton className="aspect-[3/2] w-full rounded-xl" />
            <Skeleton className="mt-4 h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export { GalleryPersonalized };

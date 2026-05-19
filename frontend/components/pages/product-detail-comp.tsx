"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/authStore";
import { ProductCard } from "../ui/product-card";

export default function ProductDetailComp() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const { currentProduct, isLoading, getProductDetail, trackProductView } =
    useProductStore();
  const { isLoggedIn } = useAuthStore();

  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [selectedTab, setSelectedTab] = useState<"usage" | "audience">("usage");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.includes(productId));
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      getProductDetail(productId);
      fetchSimilarProducts(productId);
    }
  }, [productId, getProductDetail]);

  useEffect(() => {
    if (productId && isLoggedIn) {
      trackProductView(productId);
    }
  }, [productId, isLoggedIn, trackProductView]);

  const fetchSimilarProducts = async (id: number) => {
    try {
      setIsSimilarLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/products/similar/${id}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSimilarProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch similar products", err);
    } finally {
      setIsSimilarLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      const newFavorites = favorites.filter((id: number) => id !== productId);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    } else {
      const newFavorites = [...favorites, productId];
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProduct?.name,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  if (isLoading || !currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-24 mb-8" />
          <div className="grid lg:grid-cols-2 gap-10 mb-8">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const product = currentProduct;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Main Info Area */}
          <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-sm border border-gray-100 mb-8">
            <div className="grid lg:grid-cols-2 gap-10">
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8">
                <Image
                  src={`/placeholder-product.jpg`}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="object-contain mix-blend-multiply"
                />
                <Badge className="absolute top-4 left-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none text-sm px-3 py-1">
                  {product.category}
                </Badge>
              </div>

              {/* Product Details */}
              <div className="flex flex-col justify-center">
                <div className="flex justify-between w-full items-center">
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">
                    {product.category}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleFavorite}
                      className={`hover:bg-red-50 ${isFavorite ? "text-red-500" : "text-gray-500"}`}
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShare}
                      className="hover:bg-blue-50 text-gray-500"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    4.9/5.0 (200+ reviews)
                  </span>
                </div>

                <div className="text-3xl font-bold text-gray-900 mb-8">
                  Contact us for pricing
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Authenticity Guaranteed
                      </p>
                      <p className="text-sm text-gray-500">
                        200% refund if counterfeit products are detected.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Expert Recommended
                      </p>
                      <p className="text-sm text-gray-500">
                        Recommendations powered by an advanced medical AI
                        system.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <Button
                    variant="outline"
                    className="flex-1 py-6 text-lg !text-white bg-gradient-to-r hover:bg-gradient-to-l from-blue-600 to-emerald-400 shadow-lg"
                  >
                    Consult
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Pharmacological Parameters (Tabs) */}
          <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-sm border border-gray-100 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Pharmacological Information
            </h2>

            <div className="flex flex-wrap border-b border-gray-200 mb-8 gap-2">
              {[
                { id: "usage", label: "Usage & Benefits" },
                { id: "audience", label: "Target Audience" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`px-6 py-4 font-semibold text-sm border-b-2 transition-all ${
                    selectedTab === tab.id
                      ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-[150px]">
              {selectedTab === "usage" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose max-w-none"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Description & Main Benefits:
                  </h3>

                  <p className="text-gray-700 leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {product.health_goal && (
                    <>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Health Goals:
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {product.health_goal
                          ?.split(", ")
                          .map((goal: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 py-1.5 px-3"
                            >
                              {goal.trim()}
                            </Badge>
                          ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {selectedTab === "audience" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Best Suited For:
                  </h3>

                  <div className="grid sm:grid-cols-3 gap-6">
                    <Card className="bg-gray-50 border-none shadow-none">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-gray-500 mb-1">Age Range</p>

                        <p className="text-xl font-bold text-gray-900">
                          {product.age_range || "All ages"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-none shadow-none">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-gray-500 mb-1">Gender</p>

                        <p className="text-xl font-bold text-gray-900">
                          {product.target_gender === "Male"
                            ? "Male"
                            : product.target_gender === "Female"
                              ? "Female"
                              : "All"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-none shadow-none">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-gray-500 mb-1">
                          Weight (kg)
                        </p>

                        <p className="text-xl font-bold text-gray-900">
                          {product.weight_range || "No limit"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Similar Products Area */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Products in the Same Category
            </h2>

            {isSimilarLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
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
            ) : similarProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {similarProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500">
                  No similar healthcare products found.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

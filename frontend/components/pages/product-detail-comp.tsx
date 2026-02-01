"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, Heart, Share2, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/authStore";
import { Product } from "@/types";

export default function ProductDetailComp() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  
  const { currentProduct, isLoading, getProductDetail, trackProductView } = useProductStore();
  const { user, isLoggedIn } = useAuthStore();
  
    const [isFavorite, setIsFavorite] = useState(() => {
      // Tính toán initial state từ localStorage
      if (typeof window !== 'undefined') {
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        return favorites.includes(productId);
      }
      return false;
    });
    
  const [selectedTab, setSelectedTab] = useState<"description" | "benefits" | "recommendations">("description");

  // Load product detail
  useEffect(() => {
    if (productId) {
      getProductDetail(productId);
    }
  }, [productId, getProductDetail]);

  // Track product view
  useEffect(() => {
    if (productId && isLoggedIn) {
      trackProductView(productId);
    }
  }, [productId, isLoggedIn, trackProductView]);


  // useEffect(() => {
  //   const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  //   setIsFavorite(favorites.includes(productId));
  // }, [productId]);

  const handleBack = () => {
    router.back();
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
          text: currentProduct?.description?.substring(0, 100),
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép link sản phẩm vào clipboard!");
    }
  };

  if (isLoading || !currentProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-12 w-3/4" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const product = currentProduct;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className={`hover:bg-red-50 ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
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
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Product Info */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Product Image & Badges */}
            <div className="space-y-6">
              <div className="relative">
                <div className="h-80 lg:h-96 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/90 text-blue-600 mb-4 shadow-lg">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <span className="text-lg font-medium text-blue-700">{product.category}</span>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                    {product.category}
                  </Badge>
                  {product.target_gender && product.target_gender !== "All" && (
                    <Badge variant="outline" className="bg-white/90">
                      {product.target_gender}
                    </Badge>
                  )}
                </div>
                
                {product.match_score && product.match_score > 0 && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      {product.match_score}% phù hợp
                    </Badge>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center p-4">
                  <div className="text-2xl font-bold text-blue-600">A+</div>
                  <div className="text-sm text-gray-600">Chất lượng</div>
                </Card>
                <Card className="text-center p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    <Clock className="inline w-5 h-5" />
                  </div>
                  <div className="text-sm text-gray-600">Hiệu quả nhanh</div>
                </Card>
                <Card className="text-center p-4">
                  <div className="text-2xl font-bold text-blue-600">✓</div>
                  <div className="text-sm text-gray-600">An toàn</div>
                </Card>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">4.8 (128 đánh giá)</span>
                </div>

              
              </div>

              {/* Health Goals */}
              {product.health_goal && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mục tiêu sức khỏe</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.health_goal.split(", ").map((goal, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {goal.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )} 
                {product.age_range && (
                <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Phù hợp cho</h4>
                    <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-blue-50">
                        Độ tuổi: {product.age_range}
                    </Badge>
                    {product.weight_range && (
                        <Badge variant="outline" className="bg-green-50">
                        Cân nặng: {product.weight_range} kg
                        </Badge>
                    )}
                    <Badge variant="outline" className="bg-purple-50">
                        Giới tính: {product.target_gender}
                    </Badge>
                    </div>
                </div>
                )}
              {/* Key Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Lợi ích chính</h3>
                <ul className="space-y-2">
                  {product.description.split(",").slice(0, 5).map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex-1 py-6 text-lg border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      // Consult doctor logic
                      router.push("/consult");
                    }}
                  >
                    Tư vấn bác sĩ
                  </Button>
                </div>
                
                
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b">
              {[
                { id: "description", label: "Mô tả chi tiết" },
                { id: "benefits", label: "Lợi ích & Công dụng" },
                { id: "recommendations", label: "Sản phẩm tương tự" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="py-8">
              {selectedTab === "description" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông tin sản phẩm</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Danh mục</span>
                            <span className="font-medium">{product.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Đối tượng</span>
                            <span className="font-medium">{product.target_gender || "Tất cả"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dạng bào chế</span>
                            <span className="font-medium">Viên nang</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Xuất xứ</span>
                            <span className="font-medium">Việt Nam</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Hướng dẫn sử dụng</h4>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                              1
                            </div>
                            <div>
                              <p className="font-medium">Liều lượng</p>
                              <p className="text-sm text-gray-600">1-2 viên/ngày sau ăn</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                              2
                            </div>
                            <div>
                              <p className="font-medium">Thời gian dùng</p>
                              <p className="text-sm text-gray-600">Tốt nhất vào buổi sáng</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                              3
                            </div>
                            <div>
                              <p className="font-medium">Lưu ý</p>
                              <p className="text-sm text-gray-600">Không dùng cho phụ nữ có thai</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {selectedTab === "benefits" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">🌟 Lợi ích nổi bật</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {product.description.split(",").map((benefit, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                                <Check className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Lợi ích {index + 1}</h4>
                                <p className="text-gray-600">{benefit.trim()}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Who Should Use */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">👥 Ai nên sử dụng?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="text-center p-6 hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">👨‍💼</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Người làm văn phòng</h4>
                        <p className="text-sm text-gray-600">Căng thẳng, mệt mỏi, ít vận động</p>
                      </Card>
                      <Card className="text-center p-6 hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">👵</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Người lớn tuổi</h4>
                        <p className="text-sm text-gray-600">Xương khớp, trí nhớ, sức đề kháng</p>
                      </Card>
                      <Card className="text-center p-6 hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">🏃‍♂️</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Vận động viên</h4>
                        <p className="text-sm text-gray-600">Hồi phục cơ, tăng sức bền</p>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "recommendations" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">🔄 Sản phẩm tương tự</h3>
                  {product.similar_products && product.similar_products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {product.similar_products.slice(0, 6).map((similarProduct) => (
                        <Card
                          key={similarProduct.id}
                          className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                          onClick={() => router.push(`/product/${similarProduct.id}`)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 line-clamp-2">
                                  {similarProduct.name}
                                </h4>
                                <Badge variant="outline" className="mt-2">
                                  {similarProduct.category}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                              {similarProduct.description?.substring(0, 100)}...
                            </p>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/product/${similarProduct.id}`);
                              }}
                            >
                              Xem chi tiết
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6">
                        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Không có sản phẩm tương tự
                      </h4>
                      <p className="text-gray-600 mb-6">
                        Chúng tôi đang cập nhật thêm sản phẩm tương tự
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/search")}
                      >
                        Khám phá thêm sản phẩm
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-8 text-center
            bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
            Câu hỏi thường gặp
            </h3>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: "Sản phẩm có tác dụng phụ không?",
                  a: "Sản phẩm được chiết xuất từ thành phần tự nhiên, an toàn và không có tác dụng phụ khi sử dụng đúng liều lượng."
                },
                {
                  q: "Thời gian sử dụng bao lâu thì có hiệu quả?",
                  a: "Thông thường sau 2-4 tuần sử dụng đều đặn, bạn sẽ cảm nhận được sự cải thiện rõ rệt."
                },
                {
                  q: "Có thể dùng chung với thuốc khác không?",
                  a: "Nên tham khảo ý kiến bác sĩ trước khi sử dụng chung với các loại thuốc khác."
                },
                {
                  q: "Bảo quản sản phẩm như thế nào?",
                  a: "Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và xa tầm tay trẻ em."
                }
              ].map((faq, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <span className="font-semibold text-gray-900 group-open:text-blue-600">
                          {faq.q}
                        </span>
                        <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-gray-600">{faq.a}</p>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      {/* <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 px-6 py-6"
          onClick={() => {
            // Quick add to cart
            alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
          }}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Mua ngay
        </Button>
      </div> */}
    </div>
  );
}
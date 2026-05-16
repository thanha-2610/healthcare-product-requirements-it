"use client";
import { ExpandableChatDemo } from "@/components/chat-box-demo";
import { CommerceHero } from "@/components/commerce-hero";
import { GalleryPersonalized } from "@/components/GalleryPersonalized";
import { GalleryPopular } from "../GalleryPopular";
import { HeroSection } from "../hero-section-3";
import VerticalTabs from "../ui/vertical-tabs";

export default function HomeComp() {
  return (
    <>
      <HeroSection />
      <CommerceHero />
      <div className=" container px-2 mx-auto">
        {/* Sản phẩm phổ biến - LUÔN HIỂN THỊ */}
        <GalleryPopular />

        {/* Gợi ý cá nhân hóa (chỉ hiển thị nếu có user) */}
        <GalleryPersonalized />

        <VerticalTabs />
        <ExpandableChatDemo />
      </div>
    </>
  );
}

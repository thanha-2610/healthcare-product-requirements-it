"use client";
import { Feature197 } from "@/components/accordion-feature-section";
import { ExpandableChatDemo } from "@/components/chat-box-demo";
import { CommerceHero } from "@/components/commerce-hero";
import { GalleryPersonalized } from "@/components/GalleryPersonalized";
import { GalleryPopular } from "../GalleryPopular";
import { HeroSection } from "../hero-section-3";
import GlobeSection from "../globe-section";

const demoDataFeature197 = {
  features: [
    {
      id: 1,
      title: "Chăm sóc sức khỏe cá nhân mỗi ngày",
      image: "/young-doctor-vaccinating-little-girl.jpg",
      description:
        "Duy trì thói quen chăm sóc cá nhân đúng cách giúp cơ thể luôn khỏe mạnh và tràn đầy năng lượng. Việc lựa chọn sản phẩm phù hợp, kết hợp sinh hoạt điều độ sẽ góp phần nâng cao chất lượng cuộc sống hằng ngày.",
    },
    {
      id: 2,
      title: "Bí quyết cải thiện giấc ngủ tự nhiên",
      image: "/medium-shot-three-doctors-consulting-medical-case.jpg",
      description:
        "Giấc ngủ chất lượng đóng vai trò quan trọng trong việc phục hồi thể chất và tinh thần. Xây dựng thói quen ngủ khoa học và sử dụng các giải pháp hỗ trợ phù hợp có thể giúp bạn ngủ sâu và ngon hơn.",
    },
    {
      id: 3,
      title: "Sử dụng thực phẩm chức năng đúng cách",
      image: "/medical-banner-with-stethoscope.jpg",
      description:
        "Thực phẩm chức năng giúp bổ sung dưỡng chất cần thiết cho cơ thể khi chế độ ăn chưa đáp ứng đủ. Hiểu rõ công dụng và sử dụng hợp lý sẽ giúp tối ưu hiệu quả chăm sóc sức khỏe.",
    },
    {
      id: 4,
      title: "Thiết bị y tế gia đình – Theo dõi sức khỏe tại nhà",
      image: "/veterinarian-conducting-experiment-laboratory.jpg",
      description:
        "Các thiết bị y tế gia đình giúp bạn dễ dàng theo dõi tình trạng sức khỏe hằng ngày. Chủ động kiểm tra tại nhà hỗ trợ phát hiện sớm các dấu hiệu bất thường và chăm sóc sức khỏe hiệu quả hơn.",
    },
  ],
};

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

        <Feature197 {...demoDataFeature197} />
        <GlobeSection />

        <ExpandableChatDemo />
      </div>
    </>
  );
}

import { Feature197 } from "@/components/accordion-feature-section";
import { ExpandableChatDemo } from "@/components/chat-box-demo";
import { CommerceHero } from "@/components/commerce-hero";
import Footer from "@/components/main-layout/ui/footer-1";
import { Gallery6 } from "@/components/gallery6";
import { LogoCloud } from "@/components/logo-cloud-4";
import { cn } from "@/lib/utils";
import MainLayout from "@/components/main-layout";
import { useEffect, useState } from "react";
import api from "../lib/axios";
import AuthDialog from "../components/AuthDialog";

const demoDataGallery6 = {
  heading: "Featured Projects",
  demoUrl: "https://www.shadcnblocks.com",
  items: [
    {
      id: "item-1",
      title: "Build Modern UIs",
      summary:
        "Create stunning user interfaces with our comprehensive design system.",
      url: "#",
      image: "https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg",
    },
    {
      id: "item-2",
      title: "Design System Components",
      summary:
        "Explore our library of customizable components built with shadcn/ui and Tailwind CSS.",
      url: "#",
      image: "https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg",
    },
    {
      id: "item-3",
      title: "Responsive Layouts",
      summary:
        "Build websites that look great on any device with our responsive design patterns.",
      url: "#",
      image: "https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg",
    },
    {
      id: "item-4",
      title: "Developer Experience",
      summary:
        "Streamline your workflow with our developer-friendly tools and documentation.",
      url: "#",
      image: "https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg",
    },
    {
      id: "item-5",
      title: "Performance First",
      summary:
        "Create fast, optimized websites using our performance-focused components.",
      url: "#",
      image: "https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg",
    },
  ],
};

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

const logos = [
  {
    src: "/logo-care-0.png",
    alt: "Nvidia Logo",
  },
  {
    src: "/logo-care-1.png",
    alt: "Supabase Logo",
  },
  {
    src: "/logo-care-2.png",
    alt: "OpenAI Logo",
  },
  {
    src: "/logo-care-0.png",
    alt: "Turso Logo",
  },
  {
    src: "/logo-care-1.png",
    alt: "Vercel Logo",
  },
  {
    src: "/logo-care-2.png",
    alt: "GitHub Logo",
  },
  {
    src: "/logo-care-0.png",
    alt: "Claude AI Logo",
  },
  {
    src: "/logo-care-1.png",
    alt: "Clerk Logo",
  },
];

export default function Home() {
  const [personalRecs, setPersonalRecs] = useState([]);
  const [themeRecs, setThemeRecs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // 1. Lấy gợi ý cá nhân
    const    = localStorage.getItem("user_profile");
    if (profile) {
      const p = JSON.parse(profile);
      api
        .post("/recommend", {
          query: `${p.gender} ${p.age} tuổi ${p.diseases}`,
        })
        .then((res) => setPersonalRecs(res.data));
    }
    // 2. Lấy gợi ý mặc định
    api
      .post("/recommend", { query: "sức khỏe" })
      .then((res) => setThemeRecs(res.data));
    // 3. Lấy sản phẩm đã xem
    setRecent(JSON.parse(localStorage.getItem("recent_viewed") || "[]"));
  }, []);

  const handleDetail = (item: any) => {
    setSelectedProduct(item);
    const current = JSON.parse(localStorage.getItem("recent_viewed") || "[]");
    const updated = [
      item,
      ...current.filter((p: any) => p.id !== item.id),
    ].slice(0, 4);
    localStorage.setItem("recent_viewed", JSON.stringify(updated));
    setRecent(updated);
  };

  return (
    <MainLayout>
      <CommerceHero />
      <Gallery6 {...demoDataGallery6} />
      <Feature197 {...demoDataFeature197} />
      <div className="h-96 w-full place-content-center px-4">
        <div
          aria-hidden="true"
          className={cn(
            "-top-1/2 -translate-x-1/2 pointer-events-none absolute left-1/2 h-[120vmin] w-[120vmin] rounded-b-full",
            "bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]",
            "blur-[30px]",
          )}
        />
        <div className="w-full">
          <h2 className="mb-5 text-center">
            <span className="block font-medium text-2xl text-sky-300">
              Thương hiệu sản phẩm sức khỏe đáng tin cậy
            </span>
            <span className="font-black text-2xl text-blue-700 tracking-tight md:text-3xl max-w-7xl">
              Các thương hiệu được lựa chọn cẩn thận mang lại chất lượng và độ
              tin cậy trong chăm sóc sức khỏe
            </span>
          </h2>

          <LogoCloud logos={logos} />
        </div>
      </div>
      <ExpandableChatDemo />
    </MainLayout>
  );
}

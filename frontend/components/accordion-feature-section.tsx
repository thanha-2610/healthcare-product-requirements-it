"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FeatureItem {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface Feature197Props {
  features: FeatureItem[];
}
const defaultFeatures: FeatureItem[] = [
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
];

const Feature197 = ({ features = defaultFeatures }: Feature197Props) => {
  const [activeTabId, setActiveTabId] = useState<number | null>(1);
  const [activeImage, setActiveImage] = useState(features[0].image);

  return (
    <section className="py-20">
      <div className="container mx-auto">
        <div className="mb-12 flex w-full items-start justify-between gap-12">
          <div className="w-full md:w-1/2">
            <Accordion type="single" className="w-full" defaultValue="item-1">
              {features.map((tab) => (
                <AccordionItem key={tab.id} value={`item-${tab.id}`}>
                  <AccordionTrigger
                    onClick={() => {
                      setActiveImage(tab.image);
                      setActiveTabId(tab.id);
                    }}
                    className="cursor-pointer py-5 !no-underline transition"
                  >
                    <h6
                      className={`text-xl font-semibold ${tab.id === activeTabId ? "text-blue-600" : "text-muted-foreground"}`}
                    >
                      {tab.title}
                    </h6>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mt-3 text-cyan-500">{tab.description}</p>
                    <div className="mt-4 md:hidden">
                      <img
                        src={tab.image}
                        alt={tab.title}
                        className="h-full max-h-80 w-full rounded-md object-cover"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="relative m-auto hidden w-1/2 overflow-hidden rounded-xl bg-muted md:block">
            <img
              src={activeImage}
              alt="Feature preview"
              className="aspect-[4/3] rounded-md object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Feature197 };

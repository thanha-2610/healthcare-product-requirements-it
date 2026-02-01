import type { Metadata } from "next";
import MainLayout from "@/components/main-layout";
import HomeComp from "@/components/pages/home-comp";

export const metadata: Metadata = {
  title: "Sức khỏe cá nhân hóa - TN.Care",
  description:
    "Ứng dụng các thuật toán học máy để phân tích đặc điểm nhân khẩu học và chỉ số sức khỏe, từ đó đưa ra danh mục sản phẩm tối ưu cho từng cá thể",
};

const SearchPage = () => {
  return (
    <MainLayout>
      <HomeComp />
    </MainLayout>
  );
};
export default SearchPage;

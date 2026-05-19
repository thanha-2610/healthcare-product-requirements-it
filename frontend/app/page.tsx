import type { Metadata } from "next";
import MainLayout from "@/components/main-layout";
import HomeComp from "@/components/pages/home-comp";

export const metadata: Metadata = {
  title: "Personalized Healthcare - THANHA.CARE",
  description:
    "Applying machine learning algorithms to analyze demographic characteristics and health indicators, providing the most suitable product recommendations for each individual",
};

const SearchPage = () => {
  return (
    <MainLayout>
      <HomeComp />
    </MainLayout>
  );
};
export default SearchPage;

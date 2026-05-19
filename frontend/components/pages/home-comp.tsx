"use client";
import { CommerceHero } from "@/components/commerce-hero";
import { HeroSection } from "../hero-section-3";
import VerticalTabs from "../ui/vertical-tabs";

export default function HomeComp() {
  return (
    <>
      <HeroSection />
      <CommerceHero />
      <VerticalTabs />
    </>
  );
}

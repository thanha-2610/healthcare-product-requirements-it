"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/store/productStore";

// --- BENTO UI COMPONENTS ---
const CornerPlusIcons = () => (
  <>
    <PlusIcon className="absolute -top-3 -left-3" />
    <PlusIcon className="absolute -top-3 -right-3" />
    <PlusIcon className="absolute -bottom-3 -left-3" />
    <PlusIcon className="absolute -bottom-3 -right-3" />
  </>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    strokeWidth="1"
    stroke="currentColor"
    className={`dark:text-white text-black size-6 ${className}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
);

interface CategoryBentoProps {
  className?: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const CategoryBentoCard: React.FC<CategoryBentoProps> = ({
  className = "",
  title,
  description,
  image,
  href,
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "group relative border border-dashed border-zinc-400 dark:border-zinc-700 rounded-lg p-6 bg-white dark:bg-zinc-950 min-h-[220px] flex flex-col justify-between overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-colors",
        className,
      )}
    >
      <CornerPlusIcons />
      {/* Background Decor/Image */}
      <div className="absolute right-0 bottom-0 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 z-0">
        <Image
          src={image}
          alt={title}
          width={180}
          height={180}
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-2 max-w-[75%]">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {description}
        </p>
      </div>

      <div className="relative z-10 mt-auto flex items-center gap-2 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
        Discover <ArrowUpRight className="w-4 h-4" />
      </div>
    </Link>
  );
};

// --- DATA ---
const categories = [
  {
    title: "Digestive Support",
    description: "Helps relieve bloating, indigestion, and gut flora imbalance",
    image: "/featured-categories-0.png",
    href: "/search?q=digestive",
    className: "lg:col-span-4 lg:row-span-2",
  },
  {
    title: "Better Sleep",
    description: "Promotes deeper sleep and reduces fatigue",
    image: "/featured-categories-1.png",
    href: "/search?q=sleep",
    className: "lg:col-span-2 lg:row-span-1",
  },
  {
    title: "Stress Relief",
    description: "Balances emotions and relaxes the mind",
    image: "/featured-categories-2.png",
    href: "/search?q=stress",
    className: "lg:col-span-2 lg:row-span-1",
  },
  {
    title: "Dietary Supplements",
    description: "Provides essential vitamins and minerals for the body",
    image: "/featured-categories-3.png",
    href: "/search?q=dietary supplements",
    className: "lg:col-span-3 lg:row-span-1",
  },
  {
    title: "Medical Devices",
    description: "Safe and convenient healthcare solutions for home use",
    image: "/featured-categories-0.png",
    href: "/search?q=medical devices",
    className: "lg:col-span-3 lg:row-span-1",
  },
];



export function CommerceHero() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 1. Danh mục nổi bật (Bento Layout) */}
      <section className="pt-8 md:pt-16 lg:pt-24" id="featured-categories">
        <div className="mb-8 px-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Featured Categories
          </h2>
          <p className="text-slate-500">
            Discover product categories recommended by experts
          </p>
        </div>

        <div className="px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-[220px] gap-6">
            {categories.map((cat, idx) => (
              <CategoryBentoCard key={idx} {...cat} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

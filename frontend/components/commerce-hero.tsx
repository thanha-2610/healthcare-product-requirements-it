"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const categories = [
  {
    title: "Thực phẩm Chức năng",
    image: "/featured-categories-0.png",
    href: "/categories/supplements",
  },
  {
    title: "Thiết bị Y tế Gia đình",
    image: "/featured-categories-1.png",
    href: "/categories/devices",
  },
  {
    title: "Chăm sóc Cá nhân",
    image: "/featured-categories-2.png",
    href: "/categories/personal-care",
  },
  {
    title: "Hỗ trợ Giấc ngủ",
    image: "/featured-categories-3.png",
    href: "/categories/sleep-support",
  },
];

export function CommerceHero() {
  return (
    <div>
      <motion.section
        className="w-full px-4 py-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-cyan-600 uppercase bg-cyan-100 rounded-full"
          >
            Machine Learning Powered
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              Hệ thống gợi ý
            </span>
            <br />
            <span className="text-blue-900">Sức khỏe cá nhân hóa</span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Ứng dụng các thuật toán học máy để phân tích đặc điểm nhân khẩu học
            và chỉ số sức khỏe, từ đó đưa ra danh mục sản phẩm tối ưu cho từng
            cá thể.
          </motion.p>
        </div>
      </motion.section>

      {/* Grid Categories Section */}
      <div className="mt-12">
        <div className="flex items-end justify-between mb-8 px-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Danh mục nổi bật
            </h2>
            <p className="text-slate-500">
              Khám phá các nhóm sản phẩm được chuyên gia khuyên dùng
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              className="group relative bg-white border border-blue-200 shadow-sm hover:shadow-md shadow-sky-200 rounded-3xl p-6 min-h-[320px] overflow-hidden transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <a href={category.href} className="flex flex-col h-full">
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.title}
                </h3>

                <div className="flex-grow flex items-center justify-center relative">
                  {/* Vòng tròn decor phía sau ảnh */}
                  <div className="absolute w-32 h-32 bg-cyan-50 rounded-full group-hover:scale-125 transition-transform duration-500" />

                  <Image
                    height={180}
                    width={180}
                    src={category.image}
                    alt={category.title}
                    className="relative z-10 object-contain group-hover:rotate-6 transition-all duration-500"
                  />
                </div>

                <div className="mt-auto flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">
                    Xem thêm
                  </span>
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

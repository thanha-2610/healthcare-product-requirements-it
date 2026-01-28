"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-blue-100 to-white text-black">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
        <div className="flex items-center space-x-3 mb-6">
          <Link
            href="/"
            className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-500/80 bg-clip-text text-transparent"
          >
            TN.CARE
          </Link>
        </div>
        <p className="text-center max-w-xl text-sm font-normal leading-relaxed">
          Hỗ trợ cuộc sống khỏe mạnh hơn với các sản phẩm và giải pháp chăm sóc
          sức khỏe đáng tin cậy
        </p>
      </div>
      <div className="border-t border-gray-500">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm font-normal">
          TN Care ©2025. Mọi quyền, được bảo lưu.
        </div>
      </div>
    </footer>
  );
}

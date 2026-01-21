"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-gray-200 to-white text-black">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
        <div className="flex items-center space-x-3 mb-6">
          <Image
            height={44}
            width={200}
            alt="githubusercontent"
            className="h-11"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/dummyLogo/prebuiltuiLogoSquareShape.svg"
          />
        </div>
        <p className="text-center max-w-xl text-sm font-normal leading-relaxed">
          Empowering creators worldwide with the most advanced AI content
          creation tools. Transform your ideas into reality.
        </p>
      </div>
      <div className="border-t border-gray-500">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm font-normal">
          <a href="https://prebuiltui.com">prebuiltui</a> ©2025. All rights,
          reserved.
        </div>
      </div>
    </footer>
  );
}

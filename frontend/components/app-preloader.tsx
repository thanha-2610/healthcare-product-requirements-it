'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import CubeLoader from './cube-loader';

export const PreloaderContext = createContext<boolean>(false);

export const usePreloader = () => useContext(PreloaderContext);

export default function AppPreloader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Thời gian chờ mô phỏng việc tải tài nguyên ban đầu hoặc gọi API từ Backend
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Đợi thêm 500ms để hiệu ứng mờ dần hoàn tất trước khi gỡ khỏi DOM
      setTimeout(() => setShowPreloader(false), 500);
    }, 2500); // 2.5 giây là thời gian hợp lý để hiển thị loader

    return () => clearTimeout(timer);
  }, []);

  return (
    <PreloaderContext.Provider value={isLoading}>
      {showPreloader && (
        <div 
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f0f9ff] transition-opacity duration-500 ease-in-out ${
            isLoading ? "opacity-100" : "opacity-0"
          }`}
        >
          <CubeLoader 
            title="Loading" 
            description="Loading medical data..." 
            isLight={true}
          />
        </div>
      )}
      {children}
    </PreloaderContext.Provider>
  );
}

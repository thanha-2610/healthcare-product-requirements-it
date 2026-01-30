import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Machine Learning Powered | TN.Care",
  description: "Cá nhân hóa chăm sóc sức khỏe bằng Machine Learning, phân tích dữ liệu cá nhân để đề xuất giải pháp và sản phẩm phù hợp nhất",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <ToastProvider> {children}</ToastProvider>
      </body>
    </html>
  );
}

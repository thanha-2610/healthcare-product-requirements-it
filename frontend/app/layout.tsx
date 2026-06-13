import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import AppPreloader from "@/components/app-preloader";
import { ExpandableChatDemo } from "@/components/chat-box-demo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Machine Learning Powered | THANHA.CARE",
  description:
    "Personalize healthcare using Machine Learning by analyzing personal data to recommend the most suitable solutions and products",
  openGraph: {
    title: "Machine Learning Powered | THANHA.CARE",
    description:
      "Personalize healthcare using Machine Learning by analyzing personal data to recommend the most suitable solutions and products",
    images: [
      {
        url: "/banner.jpg",
        width: 1200,
        height: 630,
        alt: "THANHA.CARE Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Machine Learning Powered | THANHA.CARE",
    description:
      "Personalize healthcare using Machine Learning by analyzing personal data to recommend the most suitable solutions and products",
    images: ["/banner.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <AppPreloader>
            {children}
            <ExpandableChatDemo />
          </AppPreloader>
        </ToastProvider>
      </body>
    </html>
  );
}

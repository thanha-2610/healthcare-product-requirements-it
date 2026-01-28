"use client";
import React, { ReactNode } from "react";
import { Navbar } from "./ui/header";
import Footer from "./ui/footer-1";

type Props = { children: ReactNode };

const MainLayout = ({ children }: Props) => {
  return (
    <div>
      <Navbar />
      <div className="w-full relative min-h-screen">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;

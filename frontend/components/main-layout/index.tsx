"use client";
import React, { ReactNode } from "react";
import { HeroHeader } from "./ui/header";
import { CinematicFooter } from "../motion-footer";

type Props = { children: ReactNode };

const MainLayout = ({ children }: Props) => {
  return (
    <div>
      <HeroHeader />

      <div className="w-full relative min-h-screen">{children}</div>
      <CinematicFooter />
    </div>
  );
};

export default MainLayout;

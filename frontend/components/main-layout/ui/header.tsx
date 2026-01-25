"use client";

import { Menu, Search, ShoppingBasket } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AuthDialog from "@/components/auth-dialog";
import Link from "next/link";

const navigation = [
  { name: "Home", href: "#" },
  { name: "Shop", href: "#" },
  { name: "Collections", href: "#" },
  { name: "Blog", href: "#" },
];

export function Navbar() {
  return (
    <header className="flex items-center">
      {/* Left side: Logo & Desktop Nav */}
      <div className="w-full md:w-2/3 lg:w-1/2 bg-background/95 backdrop-blur-sm p-4 rounded-br-2xl flex items-center gap-2">
        <Link
          href="/"
          className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-sky-500/80 bg-clip-text text-transparent"
        >
          TN.CARE
        </Link>

        <nav className="hidden lg:flex items-center gap-2 w-full">
          {navigation.map((item) => (
            <button
              key={item.name}
              className="px-4 py-2 text-sm font-medium cursor-pointer relative group hover:text-primary transition-colors bg-transparent border-none"
            >
              {item.name}
            </button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer hover:text-primary transition-colors"
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer hover:text-primary transition-colors"
          >
            <ShoppingBasket className="w-5 h-5" />
          </Button>
        </nav>

        {/* Mobile Nav Trigger */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] sm:w-[400px] p-0 bg-background/95 backdrop-blur-md border-r border-border/50"
          >
            <SheetHeader className="p-6 text-left border-b border-border/50">
              <SheetTitle>
                <Link
                  href="/"
                  className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-sky-500/80 bg-clip-text text-transparent"
                >
                  TN.CARE
                </Link>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-6 space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="justify-start px-2 h-12 text-base font-medium hover:bg-accent/50 hover:text-primary transition-colors"
                >
                  {item.name}
                </Button>
              ))}
            </nav>
            <Separator className="mx-6" />
            <div className="p-6 flex flex-col gap-4">
              <Button
                variant="outline"
                className="justify-start gap-2 h-12 hover:bg-accent/50"
              >
                <Search className="w-4 h-4" /> Search
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 h-12 hover:bg-accent/50 relative"
              >
                <ShoppingBasket className="w-4 h-4" /> Cart
                <span className="absolute right-3 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
            <Separator className="mx-6" />
            <div className="p-6">
              <AuthDialog />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Right side: Desktop Auth */}
      <div className="hidden md:flex w-1/2 justify-end items-center pr-4 gap-4 ml-auto">
        <AuthDialog />
      </div>
    </header>
  );
}

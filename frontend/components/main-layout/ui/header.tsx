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
import { useRouter } from "next/navigation";

const navigation = [ 
  { name: "Shop", href: "#" },
  { name: "Search", href: "/search" },
  { name: "Collections", href: "#" },
  { name: "Blog", href: "#" },
];

export function Navbar() {
  const router = useRouter();

  return (
    <header className="flex items-center bg-blue-100">
      {/* Left side: Logo & Desktop Nav */}
      <div className="w-full md:w-2/3 lg:w-1/2 backdrop-blur-sm p-4 rounded-br-2xl flex items-center gap-2 bg-white">
        <Link
          href="/"
          className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-500/80 bg-clip-text text-transparent"
        >
          TN.CARE
        </Link>

        <nav className="hidden lg:flex items-center justify-between w-full">
          {navigation.map((item) => (
            <Link 
              key={item.name}
              href={item?.href}
              className="px-4 py-2 text-sm font-medium cursor-pointer relative group hover:text-primary transition-colors bg-transparent border-none"
            >
              {item.name}
            </Link>
          ))}
           
          
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
                  className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-500/80 bg-clip-text text-transparent"
                >
                  TN.CARE
                </Link>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-6 space-y-1">
              {navigation.map((item) => (
                <Button 
                  key={item.name}
                  size="icon"onClick={() => router.push(item?.href)}
                  variant="ghost"
                  className="justify-start px-2 h-12 text-base font-medium hover:bg-accent/50 hover:text-primary transition-colors"
                >
                  {item.name}
                </Button>
              ))}
            </nav>
            
            <Separator />
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

"use client";
import { Mail, Search, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import Image from "next/image";
import { useRouter } from "next/navigation";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function HeroSection() {
  const router = useRouter();

  return (
    <>
      <main className="overflow-hidden">
        <section>
          <div className="relative mx-auto max-w-6xl px-6 pt-32 lg:pb-16 lg:pt-48">
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-cyan-600 bg-cyan-100 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  Machine Learning Powered
                </div>
                <h1 className=" text-4xl font-bold sm:text-5xl md:text-6xl bg-gradient-to-r from-blue-600 to-emerald-400 bg-clip-text text-transparent">
                  Smart Health Assistant Powered by Artificial Intelligence
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg">
                  Find personalized healthcare solutions based on your symptoms
                  with high accuracy and maximum safety
                </p>

                <form action="" className="mt-12 mx-auto max-w-sm">
                  <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] pr-1.5 items-center rounded-[1rem] border shadow shadow-zinc-950/5 has-[input:focus]:ring-2 lg:pr-0">
                    <Search className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4" />

                    <input
                      type="text"
                      className="h-12 w-full bg-transparent pl-12 focus:outline-none"
                      placeholder="Search for health products..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const query = (e.target as HTMLInputElement).value;
                          if (query.trim()) {
                            router.push(
                              `/search?q=${encodeURIComponent(query)}`,
                            );
                          }
                        }
                      }}
                    />

                    <div className="md:pr-1.5 lg:pr-0">
                      <Button
                        aria-label="submit"
                        size="sm"
                        className="rounded-[0.5rem]"
                        onClick={() => {
                          const input = document.querySelector(
                            "input",
                          ) as HTMLInputElement;
                          if (input?.value.trim()) {
                            router.push(
                              `/search?q=${encodeURIComponent(input.value)}`,
                            );
                          }
                        }}
                      >
                        <span className="hidden md:block">Search</span>
                        <SendHorizonal
                          className="relative mx-auto size-5 md:hidden"
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  </div>
                </form>

                <Image
                  src="/hero-section.png"
                  alt="Banner"
                  width={600}
                  height={600}
                  className="mx-auto"
                />
              </AnimatedGroup>
            </div>
          </div>
        </section>
        <LogoCloud />
      </main>
    </>
  );
}

const logos = [
  {
    src: "/logo-care-0.png",
    alt: "Nvidia Logo",
  },
  {
    src: "/logo-care-1.png",
    alt: "Supabase Logo",
  },
  {
    src: "/logo-care-2.png",
    alt: "OpenAI Logo",
  },
  {
    src: "/logo-care-0.png",
    alt: "Turso Logo",
  },
  {
    src: "/logo-care-1.png",
    alt: "Vercel Logo",
  },
  {
    src: "/logo-care-2.png",
    alt: "GitHub Logo",
  },
  {
    src: "/logo-care-0.png",
    alt: "Claude AI Logo",
  },
  {
    src: "/logo-care-1.png",
    alt: "Clerk Logo",
  },
];

const LogoCloud = () => {
  return (
    <section className="bg-background pb-16 md:pb-32">
      <div className="group relative m-auto max-w-6xl px-6">
        <div className="flex flex-col items-center md:flex-row">
          <div className="inline md:max-w-44 md:border-r md:pr-6">
            <p className="text-end text-sm">Trusted health product brand</p>
          </div>
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider durationOnHover={20} duration={40} gap={112}>
              {logos.map((logo, index) => (
                <div key={index} className="flex">
                  <Image
                    className="mx-auto h-6 w-fit dark:invert "
                    src={logo.src}
                    alt={logo.alt}
                    width={200}
                    height={200}
                  />
                </div>
              ))}
            </InfiniteSlider>

            <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
            <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
            <ProgressiveBlur
              className="pointer-events-none absolute left-0 top-0 h-full w-20"
              direction="left"
              blurIntensity={1}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute right-0 top-0 h-full w-20"
              direction="right"
              blurIntensity={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

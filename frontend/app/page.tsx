import { Feature197 } from "@/components/accordion-feature-section";
import { ExpandableChatDemo } from "@/components/chat-box-demo";
import { CommerceHero } from "@/components/commerce-hero";
import Footer from "@/components/footer-1";
import { Gallery6 } from "@/components/gallery6";
import { LogoCloud } from "@/components/logo-cloud-4";
import { cn } from "@/lib/utils";

const demoDataGallery6 = {
  heading: "Featured Projects",
  demoUrl: "https://www.shadcnblocks.com",
  items: [
    {
      id: "item-1",
      title: "Build Modern UIs",
      summary:
        "Create stunning user interfaces with our comprehensive design system.",
      url: "#",
      image: "https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg",
    },
    {
      id: "item-2",
      title: "Design System Components",
      summary:
        "Explore our library of customizable components built with shadcn/ui and Tailwind CSS.",
      url: "#",
      image: "https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg",
    },
    {
      id: "item-3",
      title: "Responsive Layouts",
      summary:
        "Build websites that look great on any device with our responsive design patterns.",
      url: "#",
      image: "https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg",
    },
    {
      id: "item-4",
      title: "Developer Experience",
      summary:
        "Streamline your workflow with our developer-friendly tools and documentation.",
      url: "#",
      image: "https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg",
    },
    {
      id: "item-5",
      title: "Performance First",
      summary:
        "Create fast, optimized websites using our performance-focused components.",
      url: "#",
      image: "https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg",
    },
  ],
};

const demoDataFeature197 = {
  features: [
    {
      id: 1,
      title: "Ready-to-Use UI Blocks",
      image: "https://shadcnblocks.com/images/block/placeholder-1.svg",
      description:
        "Browse through our extensive collection of pre-built UI blocks designed with shadcn/ui. Each block is carefully crafted to be responsive, accessible, and easily customizable. Simply copy and paste the code into your project.",
    },
    {
      id: 2,
      title: "Tailwind CSS & TypeScript",
      image: "https://shadcnblocks.com/images/block/placeholder-2.svg",
      description:
        "Built with Tailwind CSS for rapid styling and TypeScript for type safety. Our blocks leverage the full power of Tailwind's utility classes while maintaining clean, type-safe code that integrates seamlessly with your Next.js projects.",
    },
    {
      id: 3,
      title: "Dark Mode & Customization",
      image: "https://shadcnblocks.com/images/block/placeholder-3.svg",
      description:
        "Every block supports dark mode out of the box and can be customized to match your brand. Modify colors, spacing, and typography using Tailwind's configuration. The shadcn/ui theming system makes it easy to maintain consistency across your site.",
    },
    {
      id: 4,
      title: "Accessibility First",
      image: "https://shadcnblocks.com/images/block/placeholder-4.svg",
      description:
        "All blocks are built with accessibility in mind, following WCAG guidelines. They include proper ARIA labels, keyboard navigation support, and semantic HTML structure. Ensure your website is usable by everyone without extra effort.",
    },
    {
      id: 5,
      title: "Modern Development Stack",
      image: "https://shadcnblocks.com/images/block/placeholder-5.svg",
      description:
        "Built for modern web development with React 18, Next.js 14, and the latest shadcn/ui components. Take advantage of React Server Components, TypeScript strict mode, and other cutting-edge features while maintaining excellent performance.",
    },
  ],
};

const logos = [
  {
    src: "https://svgl.app/library/nvidia-wordmark-light.svg",
    alt: "Nvidia Logo",
  },
  {
    src: "https://svgl.app/library/supabase_wordmark_light.svg",
    alt: "Supabase Logo",
  },
  {
    src: "https://svgl.app/library/openai_wordmark_light.svg",
    alt: "OpenAI Logo",
  },
  {
    src: "https://svgl.app/library/turso-wordmark-light.svg",
    alt: "Turso Logo",
  },
  {
    src: "https://svgl.app/library/vercel_wordmark.svg",
    alt: "Vercel Logo",
  },
  {
    src: "https://svgl.app/library/github_wordmark_light.svg",
    alt: "GitHub Logo",
  },
  {
    src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg",
    alt: "Claude AI Logo",
  },
  {
    src: "https://svgl.app/library/clerk-wordmark-light.svg",
    alt: "Clerk Logo",
  },
];

export default function Home() {
  return (
    <div>
      <CommerceHero />
      <Gallery6 {...demoDataGallery6} />
      <Feature197 {...demoDataFeature197} />
       <div className="h-96 w-full place-content-center px-4">
     <div
        aria-hidden="true"
        className={cn(
          "-top-1/2 -translate-x-1/2 pointer-events-none absolute left-1/2 h-[120vmin] w-[120vmin] rounded-b-full",
          "bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]",
          "blur-[30px]"
        )}
      />
      <div className="w-full">
        <h2 className="mb-5 text-center">
          <span className="block font-medium text-2xl text-muted-foreground">
            Already used by
          </span>
          <span className="font-black text-2xl text-primary tracking-tight md:text-3xl">
            Best in the Game
          </span>
        </h2>

        <LogoCloud logos={logos} />
      </div>
    </div>
    <ExpandableChatDemo />      
      <Footer />
    </div>
  );
}

import { motion } from "framer-motion";
import { Badge } from "./badge";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Product } from "@/types";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  // Use a pseudo-random image from the available featured categories placeholders
  const imageIndex = (product.id + index) % 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="aspect-[4/3] w-full bg-gray-50 dark:bg-zinc-800 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center">
        <Image
          src={`/placeholder-product.jpg`}
          alt={product.name}
          width={200}
          height={200}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <Badge className="w-fit mb-3 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-none">
        {product.category}
      </Badge>
      <h3 className="font-bold text-lg mb-2 line-clamp-2 dark:text-white group-hover:text-blue-600 transition-colors">
        {product.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-grow mb-4">
        {product.description}
      </p>

      <Link href={`/product/${product?.id}`} className="mt-auto">
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <span className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-1 group-hover:underline">
            See details
          </span>
          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

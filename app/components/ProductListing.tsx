"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { ProductListingNode } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/utils";
import { QuickViewModal } from "./QuickViewModal";

type ProductListingProps = {
  products: ProductListingNode[];
};

export function ProductListing({ products }: ProductListingProps) {
  const [selectedProductHandle, setSelectedProductHandle] = useState<
    string | null
  >(null);

  const handleQuickView = (handle: string) => {
    setSelectedProductHandle(handle);
  };

  const handleCloseModal = () => {
    setSelectedProductHandle(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 p-6 sm:p-8 max-w-7xl mx-auto">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <ProductCard
              product={product}
              onQuickView={handleQuickView}
            />
          </motion.div>
        ))}
      </div>

      {selectedProductHandle && (
        <QuickViewModal
          productHandle={selectedProductHandle}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

type ProductCardProps = {
  product: ProductListingNode;
  onQuickView: (handle: string) => void;
};

function ProductCard({ product, onQuickView }: ProductCardProps) {
  const image = product.featuredImage;
  const price = product.priceRange.minVariantPrice;

  return (
    <motion.article
      className="group flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        {image ? (
          <>
            <motion.img
              src={image.url}
              alt={image.altText || product.title}
              className="w-full h-full object-cover"
              width={image.width}
              height={image.height}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <svg
              className="w-16 h-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        
        {/* Quick View Button Overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        >
          <motion.button
            onClick={() => onQuickView(product.handle)}
            className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-semibold rounded-full shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Quick View
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          {product.title}
        </h3>

        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <motion.p
              className="text-xl font-bold text-gray-900 dark:text-gray-100"
              initial={false}
            >
              {formatMoney(price)}
            </motion.p>

            {/* Mobile Quick View Button */}
            <motion.button
              onClick={() => onQuickView(product.handle)}
              className="lg:hidden px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

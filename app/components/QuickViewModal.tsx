"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type {
  ProductDetailResponse,
  ProductVariant,
  SelectedOptionsMap,
} from "@/lib/shopify/types";
import { resolveVariant, getAvailableOptionValues, formatMoney } from "@/lib/shopify/utils";
import { ProductSkeleton } from "./ProductSkeleton";

type QuickViewModalProps = {
  productHandle: string;
  onClose: () => void;
};

type AddToBagState = "idle" | "loading" | "success";

export function QuickViewModal({
  productHandle,
  onClose,
}: QuickViewModalProps) {
  const [product, setProduct] = useState<ProductDetailResponse["product"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptionsMap>({});
  const [addToBagState, setAddToBagState] = useState<AddToBagState>("idle");
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
  }, []);

  // Fetch product details
  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/product/${productHandle}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data: ProductDetailResponse = await response.json();
        if (!cancelled) {
          setProduct(data.product);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productHandle]);

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Focus management and trap
  useEffect(() => {
    if (!loading && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[0]?.focus();
      }

      // Focus trap: keep focus within modal
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      window.addEventListener("keydown", handleTabKey);
      return () => window.removeEventListener("keydown", handleTabKey);
    }
  }, [loading]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = useCallback(() => {
    onClose();
    // Return focus to trigger element
    triggerRef.current?.focus();
  }, [onClose]);

  if (loading) {
    const backdropTransition = shouldReduceMotion
      ? { duration: 0 }
      : { duration: 0.2 };
    const modalTransition = shouldReduceMotion
      ? { duration: 0 }
      : { duration: 0.3, ease: "easeOut" as const };

    return (
      <AnimatePresence>
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={backdropTransition}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={handleBackdropClick}
          />
          <motion.div
            ref={modalRef}
            initial={
              shouldReduceMotion
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.95, y: 20 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.95, y: 20 }
            }
            transition={modalTransition}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <ProductSkeleton />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!product) {
    return null;
  }

  const variants: ProductVariant[] = product.variants.edges.map((edge) => edge.node);
  
  // If product has no options, auto-select the first available variant
  const hasOptions = product.options.length > 0;
  if (!hasOptions && variants.length > 0 && Object.keys(selectedOptions).length === 0) {
    // Auto-select first variant if no options exist
    const firstVariant = variants.find((v) => v.availableForSale) || variants[0];
    if (firstVariant) {
      // This is a product with no options, so we can use the first variant directly
    }
  }
  
  const selectedVariant = hasOptions
    ? resolveVariant(variants, selectedOptions)
    : variants.find((v) => v.availableForSale) || variants[0] || null;
  const displayImage = selectedVariant?.image || product.featuredImage;
  const displayPrice = selectedVariant?.price || product.variants.edges[0]?.node.price;

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToBag = async () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;

    setAddToBagState("loading");
    
    // Simulate async add to bag
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setAddToBagState("success");
    
    // Reset after 1.5 seconds
    setTimeout(() => {
      setAddToBagState("idle");
      handleClose();
    }, 1500);
  };

  const allOptionsSelected = hasOptions
    ? product.options.every((opt) => selectedOptions[opt.name])
    : true; // If no options, consider all "selected"
  
  const isAddToBagDisabled =
    !selectedVariant ||
    !selectedVariant.availableForSale ||
    addToBagState !== "idle" ||
    !allOptionsSelected;

  const backdropTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2 };
  const modalTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeOut" as const };
  const imageTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.3 };
  const priceTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2 };

  return (
    <AnimatePresence>
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        transition={backdropTransition}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div 
          className="absolute inset-0 bg-black/50" 
          onClick={handleBackdropClick}
        />
        <motion.div
          ref={modalRef}
          initial={
            shouldReduceMotion
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.95, y: 20 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            shouldReduceMotion
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.95, y: 20 }
          }
          transition={modalTransition}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6 text-gray-900 dark:text-gray-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Modal Content */}
          <div className="flex flex-col lg:flex-row overflow-y-auto">
            {/* Product Image */}
            <div className="lg:w-1/2 bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-8">
              <AnimatePresence mode="wait">
                {displayImage && (
                  <motion.img
                    key={displayImage.url}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    transition={imageTransition}
                    src={displayImage.url}
                    alt={displayImage.altText || product.title}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                    width={displayImage.width}
                    height={displayImage.height}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Product Details */}
            <div className="lg:w-1/2 p-4 md:p-6 lg:p-8 flex flex-col">
              <h2
                id="modal-title"
                className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 md:mb-4 pr-4"
              >
                {product.title}
              </h2>

              {product.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-6 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="mb-4 md:mb-6">
                <motion.p
                  key={displayPrice.amount}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: -10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={priceTransition}
                  className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100"
                >
                  {formatMoney(displayPrice)}
                </motion.p>
                {selectedVariant?.compareAtPrice && (
                  <p className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    {formatMoney(selectedVariant.compareAtPrice)}
                  </p>
                )}
              </div>

              {/* Variant Selection */}
              {product.options.length > 0 && product.options.map((option) => {
                const availableValues = getAvailableOptionValues(
                  variants,
                  product.options,
                  selectedOptions,
                  option.name
                );
                const selectedValue = selectedOptions[option.name];

                return (
                  <div key={option.id} className="mb-4 md:mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isSelected = selectedValue === value;
                        const isAvailable = availableValues.includes(value);
                        const isDisabled = !isAvailable;

                        return (
                          <button
                            key={value}
                            onClick={() => handleOptionChange(option.name, value)}
                            disabled={isDisabled}
                            className={`
                              px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all
                              ${
                                isSelected
                                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                              }
                              ${
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                            `}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Add to Bag Button */}
              <div className="mt-auto pt-3 md:pt-6">
                <motion.button
                  onClick={handleAddToBag}
                  disabled={isAddToBagDisabled}
                  whileHover={
                    !isAddToBagDisabled && !shouldReduceMotion
                      ? { scale: 1.02 }
                      : {}
                  }
                  whileTap={
                    !isAddToBagDisabled && !shouldReduceMotion
                      ? { scale: 0.98 }
                      : {}
                  }
                  className={`
                    w-full py-3 md:py-4 px-6 rounded-lg font-semibold text-base md:text-lg transition-all
                    ${
                      addToBagState === "success"
                        ? "bg-green-600 text-white"
                        : isAddToBagDisabled
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                  `}
                >
                  {addToBagState === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Adding...
                    </span>
                  ) : addToBagState === "success" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Added to Bag
                    </span>
                  ) : (
                    "Add to Bag"
                  )}
                </motion.button>

                {hasOptions && !allOptionsSelected && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Please select all options
                  </p>
                )}
                {selectedVariant && !selectedVariant.availableForSale && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">
                    This variant is unavailable
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

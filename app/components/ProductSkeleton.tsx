export function ProductSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Image Skeleton */}
      <div className="lg:w-1/2 bg-gray-100 dark:bg-gray-800 p-8 flex items-center justify-center">
        <div className="w-full h-48 md:h-[60vh] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="lg:w-1/2 p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Title */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse" />
        </div>

        {/* Price */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />

        {/* Options */}
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse" />
          </div>
        </div>

        {/* Button */}
        <div className="mt-auto pt-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

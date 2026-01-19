import { client } from "@/lib/shopify/serverClient";
import { getCollectionProducts } from "@/lib/shopify/graphql/query";
import { ProductListing } from "./components/ProductListing";
import type { ProductListingNode, ProductListingEdge } from "@/lib/shopify/types";
import { env } from "@/env";

const COLLECTION_HANDLE = env.NEXT_PUBLIC_SHOPIFY_COLLECTION_HANDLE;

export default async function Home() {
  "use cache";
  
  let products: ProductListingEdge[] = [];
  
  try {
    const response = await client.request(getCollectionProducts, {
      variables: {
        handle: COLLECTION_HANDLE,
        first: 20,
      },
    });

    if (response.data?.collection?.products?.edges) {
      products = response.data.collection.products.edges;
    }
  } catch (error) {
    console.error("Error fetching collection products:", error);
  }

  const productNodes: ProductListingNode[] = products.map((edge: ProductListingEdge) => edge.node);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Product Collection
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Click &quot;Quick View&quot; on any product to see details
        </p>
      </div>

      {productNodes.length > 0 ? (
        <ProductListing products={productNodes} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No products found. Please check your collection handle and Shopify configuration.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Set NEXT_PUBLIC_SHOPIFY_COLLECTION_HANDLE in your .env.local file.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

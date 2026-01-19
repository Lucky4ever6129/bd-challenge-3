// Types for Shopify Storefront API responses

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: Image | null;
};

export type ProductListingNode = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image | null;
  priceRange: {
    minVariantPrice: Money;
  };
};

export type ProductListingEdge = {
  node: ProductListingNode;
};

export type CollectionProductsResponse = {
  collection: {
    id: string;
    title: string;
    products: {
      edges: ProductListingEdge[];
    };
  } | null;
};

export type ProductDetailResponse = {
  product: {
    id: string;
    title: string;
    description: string;
    handle: string;
    featuredImage: Image | null;
    images: {
      edges: Array<{
        node: Image;
      }>;
    };
    options: ProductOption[];
    variants: {
      edges: Array<{
        node: ProductVariant;
      }>;
    };
  } | null;
};

export type SelectedOptionsMap = Record<string, string>;

import useSWR from 'swr';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  slug: string;
  featured: boolean;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface FeaturedProductsResponse {
  products: Product[];
  pagination: PaginationData;
}

interface UseFeaturedProductsOptions {
  limit?: number;
  page?: number;
  category?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useFeaturedProducts(options: UseFeaturedProductsOptions = {}) {
  const { limit = 4, page = 1, category } = options;
  
  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit.toString());
  queryParams.append('page', page.toString());
  if (category) {
    queryParams.append('category', category);
  }

  const { data, error, isLoading, mutate } = useSWR<FeaturedProductsResponse>(
    `/api/products/featured?${queryParams.toString()}`,
    fetcher
  );

  return {
    products: data?.products || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate
  };
}

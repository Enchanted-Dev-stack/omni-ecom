import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import Navbar from '@/components/ui/navbar';
import SearchFilters from './components/search-filters';
import connectDB from '@/lib/db';
import Product from '@/models/product';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
    price?: string;
  };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q;
  return {
    title: query ? `Search results for "${query}" | OmniStore` : 'Search Products | OmniStore',
    description: query 
      ? `Find the best ${query} products at OmniStore`
      : 'Search through our collection of amazing products. Find exactly what you need.',
  };
}

async function getProducts(searchParams: SearchPageProps['searchParams']) {
  try {
    await connectDB();
    
    // Build the filter object
    const filter: any = {};
    
    // Add text search if query exists
    if (searchParams.q) {
      filter.$or = [
        { name: { $regex: searchParams.q, $options: 'i' } },
        { description: { $regex: searchParams.q, $options: 'i' } }
      ];
    }

    // Add category filter if specified
    if (searchParams.category && searchParams.category !== 'All Categories') {
      filter['category.name'] = searchParams.category;
    }

    // Add price range filter if specified
    if (searchParams.price && searchParams.price !== 'all') {
      const [min, max] = searchParams.price.split('-');
      filter.price = {};
      if (min) filter.price.$gte = parseFloat(min);
      if (max) filter.price.$lte = parseFloat(max);
    }

    // Build the sort object
    let sortObj = {};
    switch (searchParams.sort) {
      case 'price_asc':
        sortObj = { price: 1 };
        break;
      case 'price_desc':
        sortObj = { price: -1 };
        break;
      default:
        sortObj = { createdAt: -1 }; // Default sort by newest
    }

    const products = await Product.find(filter)
      .sort(sortObj)
      .populate('category', 'name')
      .lean();

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const products = await getProducts(searchParams);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {searchParams.q 
              ? `Search results for "${searchParams.q}"` 
              : 'All Products'}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            {searchParams.q
              ? `Showing ${products.length} results for your search`
              : 'Browse our collection of amazing products. Use filters to narrow down your search.'}
          </p>
        </div>

        {/* Filters */}
        <SearchFilters />

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            products.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  <p className="mt-2 font-medium text-gray-900">€{product.price.toFixed(2)}</p>
                  {product.category && (
                    <p className="mt-1 text-xs text-gray-500">{product.category.name}</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

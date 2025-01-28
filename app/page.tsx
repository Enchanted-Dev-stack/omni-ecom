import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/ui/navbar";
import ProductCard from "@/components/ui/product-card";
import { useFeaturedProducts } from "@/hooks/use-featured-products";

async function getFeaturedProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/featured?limit=4`, {
    next: { revalidate: 0 } // Revalidate on every request
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch featured products');
  }
  
  const data = await res.json();
  return data.products.map((product: any) => ({
    id: product._id,
    name: product.name,
    price: product.price,
    image: product.images[0] || '/images/placeholder.jpg',
    slug: product.slug
  }));
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 sm:pb-16 lg:pt-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Shop the Latest
                <span className="text-indigo-600"> Tech Gadgets</span>
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                Discover amazing products with great deals. Free shipping on selected items.
              </p>
              <div className="mt-8">
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/images/hero.jpg"
                alt="Hero image"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="text-indigo-600 hover:text-indigo-500 flex items-center"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {['Electronics', 'Accessories', 'Gadgets', 'Wearables'].map((category) => (
              <Link
                key={category}
                href={`/categories/${category.toLowerCase()}`}
                className="group relative rounded-lg overflow-hidden bg-gray-100 hover:bg-gray-200"
              >
                <div className="aspect-w-3 aspect-h-2">
                  <div className="p-4 flex items-center justify-center h-full">
                    <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Get the Latest Deals
            </h2>
            <p className="mt-4 text-lg text-indigo-100">
              Subscribe to our newsletter and never miss out on exclusive offers.
            </p>
            <div className="mt-8 flex justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-5 py-3 w-full max-w-xs rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="bg-indigo-800 text-white px-5 py-3 rounded-r-lg hover:bg-indigo-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

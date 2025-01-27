import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/ui/navbar";
import ProductCard from "@/components/ui/product-card";

// Temporary featured products data
const featuredProducts = [
  {
    id: '1',
    name: 'Premium Headphones',
    price: 299.99,
    image: '/images/products/headphones.jpg',
    slug: 'premium-headphones'
  },
  {
    id: '2',
    name: 'Smartwatch Pro',
    price: 199.99,
    image: '/images/products/smartwatch.jpg',
    slug: 'smartwatch-pro'
  },
  {
    id: '3',
    name: 'Wireless Earbuds',
    price: 149.99,
    image: '/images/products/earbuds.jpg',
    slug: 'wireless-earbuds'
  },
  {
    id: '4',
    name: 'Laptop Stand',
    price: 49.99,
    image: '/images/products/laptop-stand.jpg',
    slug: 'laptop-stand'
  }
];

export default function Home() {
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
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get the Latest Deals
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-200">
              Subscribe to our newsletter and never miss out on exclusive offers.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-5 py-3 border-transparent rounded-l-md focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white focus:outline-none"
                />
                <button className="px-5 py-3 text-base font-medium text-indigo-600 bg-white border border-transparent rounded-r-md hover:bg-indigo-50">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

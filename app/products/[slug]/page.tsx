'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, Share2, Star, ChevronRight, Minus, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/ui/navbar";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    _id: string;
    name: string;
  };
  stock: number;
  images: string[];
  featured: boolean;
}

export default function ProductDetails({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/info/${params.slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch product');
        }

        setProduct(data.product);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (product && value > product.stock) return;
    setQuantity(value);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen pt-20">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {error || 'Product not found'}
            </h2>
            <button
              onClick={() => router.push('/products')}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Back to Products
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-700">
                Home
              </button>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <button onClick={() => router.push('/products')} className="text-gray-500 hover:text-gray-700">
                Products
              </button>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <span className="text-gray-900">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div 
              className="relative w-full pb-[100%] cursor-zoom-in overflow-hidden"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <div className="absolute inset-0">
                <Image
                  src={product.images[selectedImage] || '/images/placeholder.png'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="rounded-lg object-contain bg-gray-100 transition-transform duration-200"
                  style={isZoomed ? {
                    transform: 'scale(2)',
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                  } : undefined}
                  priority
                />
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-full pb-[100%] rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 25vw, 15vw"
                        className="object-cover bg-gray-100 hover:opacity-75"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-2 text-sm text-gray-500">Category: {product.category.name}</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">(125 reviews)</span>
            </div>

            <div>
              <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
              <p className="mt-2 text-sm text-gray-500">
                Stock: {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
              </p>
            </div>

            <div className="prose prose-sm text-gray-500">
              <p>{product.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="p-2 border rounded-md hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="p-2 border rounded-md hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  disabled={product.stock === 0}
                  className="flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </button>
                <button className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Heart className="h-5 w-5 mr-2" />
                  Add to Wishlist
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <Share2 className="h-5 w-5 mr-2" />
                Share this product
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

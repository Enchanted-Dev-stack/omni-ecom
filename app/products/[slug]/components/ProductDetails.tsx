'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShoppingCart, Heart, Share2, Star, ChevronRight, Minus, Plus, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';

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
  has360View: boolean;
}

interface ProductDetailsProps {
  product: Product;
  slug: string;
}

export default function ProductDetails({ product, slug }: ProductDetailsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (product && value > product.stock) return;
    setQuantity(value);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      await addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        slug,
        quantity
      });

      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Image Section */}
      <div className="relative flex">
        {/* Thumbnail Navigation */}
        <div className="mr-4 relative h-0 pb-[100%] w-16">
          <div className="absolute inset-0">
            <div className="h-full flex flex-col gap-2 overflow-y-auto scrollbar-none pr-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-16 h-16 border-2 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                    currentImage === index 
                      ? 'border-indigo-600 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            {/* Scroll Indicators */}
            <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
          </div>
        </div>

        {/* Main Image Display */}
        <div className="flex-1 relative h-0 pb-[100%]">
          <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.images[currentImage]}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
            
            {/* 360 View Icon (if available) */}
            {product.has360View && (
              <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                  360°
                </span>
              </div>
            )}

            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
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
              disabled={product.stock === 0 || addingToCart}
              onClick={handleAddToCart}
              className="flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
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
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { toast } from 'sonner';

export default function CartPage() {
  const { state, updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingItems, setDeletingItems] = useState<{ [key: string]: boolean }>({});

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    try {
      await updateQuantity(id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setDeletingItems(prev => ({ ...prev, [id]: true }));
    try {
      await removeFromCart(id);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setDeletingItems(prev => ({ ...prev, [id]: false }));
    }
  };

  // Mock recommended products
  const recommendedProducts = [
    {
      _id: '1',
      name: 'Classic Leather Bag',
      price: 129.99,
      image: '/images/products/bag1.jpg',
      slug: 'classic-leather-bag'
    },
    {
      _id: '2',
      name: 'Urban Backpack',
      price: 89.99,
      image: '/images/products/bag2.jpg',
      slug: 'urban-backpack'
    },
    {
      _id: '3',
      name: 'Travel Duffel',
      price: 149.99,
      image: '/images/products/bag3.jpg',
      slug: 'travel-duffel'
    }
  ];

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart</p>
            <div className="mt-6">
              <Link
                href="/search"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link href="/search" className="text-sm text-indigo-600 hover:text-indigo-500">
            Continue Shopping
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          <div className="lg:col-span-7">
            {/* Cart Items */}
            <div className="space-y-6">
              {state.items.map((item) => (
                <div 
                  key={item._id} 
                  className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 ${
                    deletingItems[item._id] ? 'opacity-50' : ''
                  }`}
                >
                  <div className="p-4 flex items-center gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link href={`/products/${item.slug}`} className="hover:text-indigo-600 transition-colors">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="mt-1.5 text-sm text-gray-500">€{item.price.toFixed(2)} each</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={deletingItems[item._id]}
                            className="text-sm text-red-600 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            Remove
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            disabled={deletingItems[item._id]}
                            className="text-sm text-gray-600 hover:text-gray-500 transition-colors disabled:opacity-50"
                          >
                            Save for later
                          </button>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1 || deletingItems[item._id]}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            disabled={isUpdating || deletingItems[item._id]}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      disabled={deletingItems[item._id]}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 h-fit disabled:opacity-50"
                    >
                      {deletingItems[item._id] ? (
                        <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      ) : (
                        <X className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Methods Info */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Secure Payment</h3>
              <div className="flex items-center space-x-8">
                <Image 
                  src="/images/payment/visa-svgrepo-com.svg" 
                  alt="Visa" 
                  width={400} 
                  height={400} 
                  className="h-20 w-auto" 
                />
                <Image 
                  src="/images/payment/mastercard-full-svgrepo-com.svg" 
                  alt="Mastercard" 
                  width={400} 
                  height={400} 
                  className="h-20 w-auto" 
                />
                <Image 
                  src="/images/payment/amex-svgrepo-com.svg" 
                  alt="American Express" 
                  width={400} 
                  height={400} 
                  className="h-20 w-auto" 
                />
                <Image 
                  src="/images/payment/paypal-svgrepo-com.svg" 
                  alt="PayPal" 
                  width={400} 
                  height={400} 
                  className="h-20 w-auto" 
                />
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                All transactions are secure and encrypted
              </div>
            </div>

            {/* Recommended Products */}
            <div className="mt-12">
              <h2 className="text-xl font-medium text-gray-900 mb-6">You might also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProducts.map((product) => (
                  <Link 
                    key={product._id} 
                    href={`/products/${product.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="relative aspect-square">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          €{product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-16 rounded-lg bg-white shadow p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">€{state.total.toFixed(2)}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Shipping</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {state.total > 100 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    '€4.99'
                  )}
                </dd>
              </div>

              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <dt className="text-base font-medium text-gray-900">Order total</dt>
                <dd className="text-base font-medium text-gray-900">
                  €{(state.total + (state.total > 100 ? 0 : 4.99)).toFixed(2)}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <Link
                href="/checkout"
                className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 ${
                  state.items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={(e) => {
                  if (state.items.length === 0) {
                    e.preventDefault();
                    toast.error('Your cart is empty');
                  }
                }}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

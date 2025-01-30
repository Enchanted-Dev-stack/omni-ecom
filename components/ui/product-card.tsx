'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

export default function ProductCard({ id, name, price, image, slug }: ProductCardProps) {
  return (
    <div className="group relative">
      <div className="relative w-full pb-[100%]">
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="rounded-lg object-cover object-center group-hover:opacity-75"
            priority
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link href={`/products/${slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {name}
            </Link>
          </h3>
        </div>
        <div className="flex items- justify-between space-x-2">
          <p className="text-sm font-medium text-gray-900">${price.toFixed(2)}</p>
          <button 
            className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to cart functionality
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

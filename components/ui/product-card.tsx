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
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
        <Image
          src={image}
          alt={name}
          width={500}
          height={500}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link href={`/products/${slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {name}
            </Link>
          </h3>
        </div>
        <div className="flex items-center space-x-2">
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

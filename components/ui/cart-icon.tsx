'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';

export default function CartIcon() {
  const { state } = useCart();
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="relative">
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white">
          {itemCount}
        </span>
      )}
    </div>
  );
}

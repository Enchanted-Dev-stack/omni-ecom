'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
};

type CartState = {
  items: CartItem[];
  total: number;
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SET_CART'; payload: CartItem[] };

const calculateTotal = (items: CartItem[]) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      let newItems;

      if (existingItem) {
        newItems = state.items.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }

      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item._id !== action.payload);
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item._id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case 'SET_CART': {
      return {
        items: action.payload,
        total: calculateTotal(action.payload),
      };
    }
    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
} | null>(null);

const initialState: CartState = { items: [], total: 0 };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { data: session } = useSession();

  // Load cart data on mount
  useEffect(() => {
    const loadCart = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/cart');
          if (response.ok) {
            const data = await response.json();
            if (data.cart && Array.isArray(data.cart.items)) {
              // Transform cart items to match our format
              const items = data.cart.items.map((item: any) => ({
                _id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.images[0],
                slug: item.product.slug,
                quantity: item.quantity
              }));
              dispatch({ type: 'SET_CART', payload: items });
            }
          }
        } catch (error) {
          console.error('Error loading cart from database:', error);
          // Fallback to localStorage if database fails
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              const items = JSON.parse(savedCart);
              dispatch({ type: 'SET_CART', payload: Array.isArray(items) ? items : [] });
            } catch (e) {
              console.error('Error parsing cart from localStorage:', e);
              localStorage.removeItem('cart');
            }
          }
        }
      } else {
        // Load cart from localStorage for guest users
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const items = JSON.parse(savedCart);
            dispatch({ type: 'SET_CART', payload: Array.isArray(items) ? items : [] });
          } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
            localStorage.removeItem('cart');
          }
        }
      }
    };

    loadCart();
  }, [session]);

  const addToCart = async (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });

    if (session?.user) {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: item._id,
            quantity: item.quantity,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update cart on server');
        }
      } catch (error) {
        console.error('Error updating cart on server:', error);
        toast.error('Failed to sync cart with server');
      }
    }

    // Always save to localStorage as backup
    try {
      localStorage.setItem('cart', JSON.stringify([...state.items, item]));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  };

  const removeFromCart = async (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });

    if (session?.user) {
      try {
        const response = await fetch(`/api/cart/items/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove item on server');
        }
      } catch (error) {
        console.error('Error removing item on server:', error);
        toast.error('Failed to sync cart with server');
      }
    }

    // Update localStorage
    const newItems = state.items.filter(item => item._id !== id);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });

    if (session?.user) {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: id,
            quantity,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update quantity on server');
        }
      } catch (error) {
        console.error('Error updating quantity on server:', error);
        toast.error('Failed to sync cart with server');
      }
    }

    // Update localStorage
    const newItems = state.items.map(item =>
      item._id === id ? { ...item, quantity } : item
    );
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

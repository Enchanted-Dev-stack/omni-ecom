'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
// import { ThemeProvider } from 'next-themes';
import { CartProvider } from '@/contexts/cart-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
        <CartProvider>
          <Toaster position="top-center" richColors />
          {children}
        </CartProvider>
      {/* </ThemeProvider> */}
    </SessionProvider>
  );
}

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-session';
import OrderList from './components/OrderList';

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'View your order history and track current orders',
};

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/orders');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">My Orders</h1>
        <OrderList />
      </div>
    </div>
  );
}

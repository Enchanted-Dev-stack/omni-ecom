import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-session';
import OrderDetails from './components/OrderDetails';

interface OrderPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View order details and status',
};

export default async function OrderPage({ params }: OrderPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/orders/' + params.id);
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Order Details</h2>
          <p className="text-sm text-muted-foreground">
            View and manage order information
          </p>
        </div>
      </div>
      <OrderDetails orderId={params.id} />
    </div>
  );
}

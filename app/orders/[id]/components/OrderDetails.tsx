'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { 
  Clock, 
  Package, 
  CreditCard, 
  Truck, 
  MapPin,
  ArrowLeft,
  Printer,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  Timer
} from 'lucide-react';

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  slug: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  shippingCost: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Timer
        };
      case 'processing':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: CircleDot
        };
      case 'shipped':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: Truck
        };
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle2
        };
      case 'paid':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CreditCard
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle
        };
    }
  };

  const { color, icon: Icon } = getStatusInfo(status);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4 mr-1.5" />
      {status}
    </span>
  );
};

const OrderTimeline = ({ status }: { status: string }) => {
  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStep = steps.indexOf(status.toLowerCase());

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index <= currentStep ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {index < currentStep ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : index === currentStep ? (
                <CircleDot className="w-5 h-5" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            <span className="mt-2 text-xs font-medium capitalize">{step}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-1 ${
              index < steps.length - 1
                ? index < currentStep
                  ? 'bg-primary'
                  : 'bg-gray-100'
                : 'bg-transparent'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function OrderDetails({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}/info`);
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or you don't have permission to view it.</p>
        <button
          onClick={() => router.push('/orders')}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          View All Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Orders
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.print()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Order
          </button>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Order Status</h2>
              <StatusBadge status={order.orderStatus} />
            </div>
            <OrderTimeline status={order.orderStatus} />
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={index} className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold">Shipping Address</h2>
            </div>
            <div className="text-gray-600 space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount - order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold">Payment Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Payment Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Status</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

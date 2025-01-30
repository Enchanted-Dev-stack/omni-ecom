'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { 
  Package, 
  Clock, 
  ChevronRight, 
  Search,
  ShoppingBag,
  Timer,
  Truck,
  CheckCircle2
} from 'lucide-react';

interface OrderItem {
  product: {
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
  quantity: number;
}

interface Order {
  _id: string;  // MongoDB uses _id
  id?: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          icon: Timer
        };
      case 'processing':
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Package
        };
      case 'shipped':
        return {
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: Truck
        };
      case 'delivered':
        return {
          color: 'bg-green-50 text-green-700 border-green-200',
          icon: CheckCircle2
        };
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: Package
        };
    }
  };

  const { color, icon: Icon } = getStatusInfo(status);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
      <Icon className="w-4 h-4 mr-1.5" />
      {status}
    </span>
  );
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      console.log(' Fetching orders:', { page });
      
      const url = `/api/orders?page=${page}&limit=10`;
      console.log(' API URL:', url);
      
      const response = await fetch(url);
      console.log(' Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(' API Error:', errorData);
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      console.log(' Received data:', {
        orderCount: data.orders.length,
        pagination: data.pagination
      });
      
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error(' Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.items.some(item => 
      item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-8">When you make your first order, it will appear here.</p>
        <Link 
          href="/products" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-colors duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Link
            key={order._id}
            href={`/orders/${order._id}`}
            className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-primary/10"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                    #{(order._id || order.id || '').toString().slice(-8)}
                  </span>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item, index) => (
                      item.product?.images?.[0] ? (
                        <div
                          key={index}
                          className="relative w-14 h-14 rounded-lg border-2 border-white overflow-hidden shadow-sm"
                        >
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name || 'Product image'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : null
                    ))}
                    {order.items.length > 3 && (
                      <div className="relative w-14 h-14 rounded-lg border-2 border-white bg-gray-50 flex items-center justify-center shadow-sm">
                        <span className="text-sm font-medium text-gray-600">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-0.5">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchOrders(page)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                pagination.page === page
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingCart,
  UserPlus
} from 'lucide-react';

// This will be replaced with real data from the API
const mockData = {
  totalSales: 15890,
  totalOrders: 125,
  totalCustomers: 89,
  lowStock: 5,
  recentOrders: [
    { id: 1, customer: 'John Doe', total: 129.99, status: 'Processing' },
    { id: 2, customer: 'Jane Smith', total: 79.99, status: 'Shipped' },
    { id: 3, customer: 'Bob Johnson', total: 199.99, status: 'Delivered' },
  ],
  salesChart: {
    // Add chart data here
  }
};

const stats = [
  {
    title: 'Total Sales',
    value: `$${mockData.totalSales.toLocaleString()}`,
    icon: DollarSign,
    trend: '+12.5%',
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  {
    title: 'Total Orders',
    value: mockData.totalOrders,
    icon: ShoppingCart,
    trend: '+8.2%',
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    title: 'Total Customers',
    value: mockData.totalCustomers,
    icon: Users,
    trend: '+5.1%',
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  {
    title: 'Low Stock Items',
    value: mockData.lowStock,
    icon: AlertTriangle,
    trend: '-2.3%',
    color: 'text-red-600',
    bg: 'bg-red-100'
  }
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className={`h-4 w-4 ${stat.color}`} />
                <span className={`text-sm ${stat.color}`}>{stat.trend}</span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {mockData.recentOrders.map((order) => (
            <div key={order.id} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Order #{order.id}</p>
                <p className="text-sm text-gray-500">{order.customer}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium">${order.total}</span>
                <span className={`px-3 py-1 rounded-full text-sm
                  ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Add New Product', icon: Package, color: 'bg-blue-500' },
          { title: 'Process Orders', icon: ShoppingBag, color: 'bg-green-500' },
          { title: 'Add Customer', icon: UserPlus, color: 'bg-purple-500' },
          { title: 'Update Inventory', icon: AlertTriangle, color: 'bg-yellow-500' }
        ].map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                <Icon className={`h-5 w-5 ${action.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="font-medium text-gray-700">{action.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

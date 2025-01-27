'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Boxes,
  Tags
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Tags
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart
  },
  {
    title: 'Inventory',
    href: '/admin/inventory',
    icon: Boxes
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <h1 className={`font-bold text-xl text-indigo-600 ${collapsed ? 'hidden' : 'block'}`}>
            Admin Panel
          </h1>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        <nav className="p-2 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                <span className={collapsed ? 'hidden' : 'block'}>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

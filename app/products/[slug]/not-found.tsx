import Link from 'next/link';
import Navbar from '@/components/ui/navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Product Not Found</h2>
          <p className="text-gray-500 mb-8">
            The product you are looking for might have been removed or is temporarily unavailable.
          </p>
          <div className="space-y-4">
            <Link 
              href="/products"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
            >
              Browse Products
            </Link>
            <div>
              <Link 
                href="/"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Go back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

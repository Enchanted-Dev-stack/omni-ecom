import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Navbar from "@/components/ui/navbar";
import Reviews from "@/components/ui/reviews";
import ProductDetails from './components/ProductDetails';
import connectDB from '@/lib/db';
import Product from '@/models/product';
import '@/models/category'; // Import Category model to register it

interface Props {
  params: { 
    slug: string 
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    await connectDB();
    console.log('Fetching product for metadata with slug:', params.slug);
    
    const product = await Product.findOne({ slug: params.slug })
      .populate('category', 'name')
      .lean();

    console.log('Product found for metadata:', product ? 'yes' : 'no');

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.'
      };
    }

    return {
      title: `${product.name} | OmniStore`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images.map(image => ({
          url: image,
          alt: product.name
        }))
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description,
        images: product.images[0]
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product Details | OmniStore',
      description: 'View product details and make a purchase.'
    };
  }
}

export default async function ProductPage({ params }: Props) {
  console.log('Rendering product page for slug:', params.slug);
  
  try {
    await connectDB();
    console.log('Connected to database');

    const product = await Product.findOne({ slug: params.slug })
      .populate('category', 'name')
      .lean();

    console.log('Product query result:', product ? 'Found' : 'Not found');

    if (!product) {
      console.log('Product not found, throwing 404');
      notFound();
    }

    // Transform _id to string for client component
    const serializedProduct = {
      ...product,
      _id: product._id.toString(),
      category: product.category ? {
        ...product.category,
        _id: product.category._id.toString()
      } : null
    };

    console.log('Successfully serialized product:', {
      id: serializedProduct._id,
      name: serializedProduct.name,
      slug: serializedProduct.slug
    });

    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 pt-20">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </a>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <a href="/products" className="text-gray-500 hover:text-gray-700">
                  Products
                </a>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <span className="text-gray-900" aria-current="page">{product.name}</span>
              </li>
            </ol>
          </nav>

          <ProductDetails product={serializedProduct} slug={params.slug} />

          {/* Reviews Section */}
          <Reviews productId={serializedProduct._id} />
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    throw error; // This will help us see the actual error in the logs
  }
}

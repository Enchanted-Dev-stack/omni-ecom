import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product';
import Category from '@/models/category';
import { createResponse, handleError } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    // First, find the product without population
    const product = await Product.findOne({ slug: params.slug });
    
    if (!product) {
      return createResponse({ error: 'Product not found' }, 404);
    }

    // Then, if there's a category ID, fetch the category separately
    let category = null;
    if (product.category) {
      category = await Category.findById(product.category).select('name');
    }

    // Return the combined data
    return createResponse({ 
      product: {
        ...product.toJSON(),
        category: category
      }
    });
  } catch (error) {
    return handleError(error);
  }
}
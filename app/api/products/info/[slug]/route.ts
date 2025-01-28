import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product';
import { createResponse, handleError } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug: params.slug }).populate('category', 'name');
    
    if (!product) {
      return createResponse({ error: 'Product not found' }, 404);
    }

    return createResponse({ product });
  } catch (error) {
    return handleError(error);
  }
}
import { NextRequest } from 'next/server';
import { createResponse, handleError } from '@/lib/api-utils';
import connectDB from '@/lib/db';
import Product from '@/models/product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '4');
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || undefined;

    // Build query
    const query: any = {
      featured: true,
      status: 'active',
      stock: { $gt: 0 } // Only show in-stock items
    };

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Fetch featured products
    const products = await Product.find(query)
      .select('name description price images category stock slug featured')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return createResponse({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest } from 'next/server';
import { createResponse, handleError } from '@/lib/api-utils';
import connectDB from '@/lib/db';
import Product from '@/models/product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const color = searchParams.get('color');
    const features = searchParams.get('features');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');

    // Build query
    const query: any = {};
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    if (color && color !== 'All Colors') {
      query.colors = color;
    }
    if (features && features !== 'All Features') {
      query.features = features;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'price_asc':
        sortQuery = { price: 1 };
        break;
      case 'price_desc':
        sortQuery = { price: -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .sort(sortQuery)
      .lean();

    return createResponse({ products });
  } catch (error) {
    return handleError(error);
  }
}

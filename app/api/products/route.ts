import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product';
import { createResponse, handleError, paginationSchema } from '@/lib/api-utils';
import { productSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const validation = paginationSchema.safeParse(Object.fromEntries(searchParams));
    if (!validation.success) {
      return createResponse({ error: 'Invalid pagination parameters' }, 400);
    }

    const { page, limit } = validation.data;
    const skip = (page - 1) * limit;

    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ isActive: true });

    return createResponse({
      products,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: products.length,
        total_records: total,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return createResponse({ error: 'Validation error', details: validation.error.errors }, 400);
    }

    const product = await Product.create(validation.data);
    return createResponse({ product }, 201);
  } catch (error) {
    return handleError(error);
  }
}

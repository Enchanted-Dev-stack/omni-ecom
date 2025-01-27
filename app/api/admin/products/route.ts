import { NextRequest } from 'next/server';
import { createResponse, handleError } from '@/lib/api-utils';
import connectDB from '@/lib/db';
import Product from '@/models/product';
import { productSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filter: any = {};
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (status && status !== 'All') {
      if (status === 'In Stock') {
        filter.stock = { $gt: 10 };
      } else if (status === 'Low Stock') {
        filter.stock = { $gt: 0, $lte: 10 };
      } else if (status === 'Out of Stock') {
        filter.stock = 0;
      }
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return createResponse({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse and validate the request body
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return createResponse({ 
        error: 'Validation error', 
        details: validation.error.errors 
      }, 400);
    }

    await connectDB();

    // Format the data before saving
    const productData = {
      ...validation.data,
      price: parseFloat(validation.data.price.toString()),
      stock: parseInt(validation.data.stock.toString()),
      images: validation.data.images || [],
      status: validation.data.status || 'active',
      featured: validation.data.featured || false,
    };

    // Create the product
    const product = await Product.create(productData);

    return createResponse({ 
      message: 'Product created successfully',
      product 
    }, 201);
  } catch (error: any) {
    // Check for duplicate slug error
    if (error.code === 11000 && error.keyPattern?.slug) {
      return createResponse({ 
        error: 'A product with this name already exists' 
      }, 400);
    }
    return handleError(error);
  }
}

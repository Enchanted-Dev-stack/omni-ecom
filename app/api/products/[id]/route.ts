import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product';
import { createResponse, handleError } from '@/lib/api-utils';
import { productSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const product = await Product.findById(params.id).populate('category', 'name');
    
    if (!product) {
      return createResponse({ error: 'Product not found' }, 404);
    }

    return createResponse({ product });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();

    const validation = productSchema.partial().safeParse(body);
    if (!validation.success) {
      return createResponse({ error: 'Validation error', details: validation.error.errors }, 400);
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      validation.data,
      { new: true }
    ).populate('category', 'name');

    if (!product) {
      return createResponse({ error: 'Product not found' }, 404);
    }

    return createResponse({ product });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const product = await Product.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return createResponse({ error: 'Product not found' }, 404);
    }

    return createResponse({ message: 'Product deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
}

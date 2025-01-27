import { NextRequest } from 'next/server';
import { createResponse, handleError } from '@/lib/api-utils';
import connectDB from '@/lib/db';
import Product from '@/models/product';
import { productSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const product = await Product.findById(params.id);
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
    const body = await request.json();

    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return createResponse({ error: 'Validation error', details: validation.error.errors }, 400);
    }

    await connectDB();

    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

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

    const product = await Product.findByIdAndDelete(params.id);
    if (!product) {
      return createResponse({ error: 'Product not found' }, 404);
    }

    return createResponse({ message: 'Product deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
}

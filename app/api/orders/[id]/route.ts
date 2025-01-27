import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/order';
import { createResponse, handleError } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    // TODO: Get user ID from session
    const userId = 'TODO';

    const order = await Order.findOne({
      _id: params.id,
      user: userId,
    }).populate('items.product', 'name price images');

    if (!order) {
      return createResponse({ error: 'Order not found' }, 404);
    }

    return createResponse({ order });
  } catch (error) {
    return handleError(error);
  }
}

// Only admin can update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    // TODO: Verify admin role

    const { status } = body;
    if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return createResponse({ error: 'Invalid order status' }, 400);
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    ).populate('items.product', 'name price images');

    if (!order) {
      return createResponse({ error: 'Order not found' }, 404);
    }

    return createResponse({ order });
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest } from 'next/server';
import  connectDB  from '@/lib/db';
import { getCurrentUser } from '@/lib/get-session';
import { createResponse, handleError } from '@/lib/api-utils';
import Order from '@/models/order';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user?.id) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return createResponse({ error: 'Invalid order ID' }, 400);
    }

    // Find order and populate user details
    const order = await Order.findOne({
      _id: params.id,
      user: user.id,
    }).lean();

    if (!order) {
      return createResponse({ error: 'Order not found' }, 404);
    }

    return createResponse({
      order: {
        ...order,
        id: order._id.toString(),
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return handleError(error);
  }
}
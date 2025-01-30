import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { createResponse, handleError } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/get-session';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { amount, currency = 'INR', receipt } = body;

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    return createResponse({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    return handleError(error);
  }
}

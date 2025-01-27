import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/order';
import Cart from '@/models/cart';
import Product from '@/models/product';
import { createResponse, handleError, paginationSchema } from '@/lib/api-utils';
import { orderSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // TODO: Get user ID from session
    const userId = 'TODO';

    const { searchParams } = new URL(request.url);
    const validation = paginationSchema.safeParse(Object.fromEntries(searchParams));
    if (!validation.success) {
      return createResponse({ error: 'Invalid pagination parameters' }, 400);
    }

    const { page, limit } = validation.data;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name price images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ user: userId });

    return createResponse({
      orders,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: orders.length,
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
    // TODO: Get user ID from session
    const userId = 'TODO';

    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return createResponse({ error: 'Validation error', details: validation.error.errors }, 400);
    }

    const { items, shippingAddress, paymentMethod } = validation.data;

    // Calculate total amount and verify stock
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return createResponse({ error: `Product not found: ${item.productId}` }, 400);
      }
      if (product.stock < item.quantity) {
        return createResponse({ error: `Insufficient stock for product: ${product.name}` }, 400);
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: product.price
      });

      // Update stock
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    });

    // Clear cart after successful order
    await Cart.findOneAndDelete({ user: userId });

    return createResponse({ order }, 201);
  } catch (error) {
    return handleError(error);
  }
}

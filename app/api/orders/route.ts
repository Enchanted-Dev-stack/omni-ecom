import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/order';
import Cart from '@/models/cart';
import Product from '@/models/product';
import { createResponse, handleError, paginationSchema } from '@/lib/api-utils';
import { orderSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/get-session';

export async function GET(request: NextRequest) {
  try {
    console.log(' [GET] /api/orders - Request received');
    await connectDB();
    const user = await getCurrentUser();
    
    console.log(' User:', user ? { id: user.id, email: user.email } : 'Not authenticated');
    
    if (!user) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(request.url);
    console.log(' Query params:', Object.fromEntries(searchParams));
    
    const validation = paginationSchema.safeParse(Object.fromEntries(searchParams));
    if (!validation.success) {
      console.log(' Invalid pagination parameters:', validation.error);
      return createResponse({ error: 'Invalid pagination parameters' }, 400);
    }

    const { page = 1, limit = 10 } = validation.data;
    const skip = (page - 1) * limit;

    console.log('🔍 Fetching orders with:', { user: user.id, skip, limit });

    const [orders, total] = await Promise.all([
      Order.find({ user: user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'items.product',
          select: 'name price images slug',
          model: 'Product'
        })
        .lean()
        .then(orders => orders.map(order => ({
          ...order,
          _id: order._id.toString(), // Ensure ID is a string
        }))),
      Order.countDocuments({ user: user.id })
    ]);

    if (orders.length > 0) {
      console.log('First order structure:', JSON.stringify(orders[0], null, 2));
    }

    console.log(` Found ${orders.length} orders out of ${total} total`);

    return createResponse({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(' Error in GET /api/orders:', error);
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    if (!user?.id) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    console.log('Request body:', body); // Debug log

    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation errors:', validation.error.errors); // Debug log
      return createResponse({ error: 'Validation error', details: validation.error.errors }, 400);
    }

    const { items, shippingDetails, totalAmount, shippingCost, paymentDetails } = validation.data;

    // Map shipping details to match our schema
    const shippingAddress = {
      street: shippingDetails.address,
      city: shippingDetails.city,
      state: shippingDetails.state,
      zipCode: shippingDetails.zipCode,
      country: shippingDetails.country,
    };

    // Create the order
    const order = await Order.create({
      user: user.id,
      items: items.map(item => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        image: item.image,
        slug: item.slug,
      })),
      shippingAddress,
      totalAmount,
      shippingCost,
      paymentMethod: 'razorpay', 
      paymentStatus: 'paid', 
      paymentDetails,
      orderStatus: 'pending' 
    });

    // Clear cart after successful order
    await Cart.findOneAndDelete({ user: user.id });

    return createResponse({ 
      id: order._id,
      message: 'Order created successfully' 
    }, 201);
  } catch (error) {
    console.error('Order creation error:', error); // Debug log
    return handleError(error);
  }
}

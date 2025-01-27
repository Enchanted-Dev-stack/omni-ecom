import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/cart';
import { createResponse, handleError } from '@/lib/api-utils';
import { cartItemSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/get-session';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    if (!user?.id) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const cart = await Cart.findOne({ user: user.id })
      .populate('items.product', 'name price images');

    return createResponse({ cart: cart || { items: [] } });
  } catch (error) {
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
    const validation = cartItemSchema.safeParse(body);
    if (!validation.success) {
      return createResponse({ error: 'Validation error', details: validation.error.errors }, 400);
    }

    const { productId, quantity } = validation.data;

    let cart = await Cart.findOne({ user: user.id });

    if (!cart) {
      cart = await Cart.create({
        user: user.id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    cart = await cart.populate('items.product', 'name price images');

    return createResponse({ cart }, 200);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    if (!user?.id) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    await Cart.findOneAndDelete({ user: user.id });

    return createResponse({ message: 'Cart cleared successfully' });
  } catch (error) {
    return handleError(error);
  }
}

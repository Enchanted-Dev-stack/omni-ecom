import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/cart';
import { createResponse, handleError } from '@/lib/api-utils';
import { getCurrentUser } from '@/lib/get-session';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    if (!user?.id) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const cart = await Cart.findOne({ user: user.id });
    if (!cart) {
      return createResponse({ error: 'Cart not found' }, 404);
    }

    // Remove the item from the cart
    cart.items = cart.items.filter(
      item => item.product.toString() !== params.id
    );

    await cart.save();

    return createResponse({ message: 'Item removed from cart' });
  } catch (error) {
    return handleError(error);
  }
}

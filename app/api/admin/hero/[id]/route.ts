import { NextRequest } from 'next/server';
import { createResponse, handleError } from '@/lib/api-utils';
import connectDB from '@/lib/db';
import Hero from '@/models/hero';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const hero = await Hero.findById(params.id).lean();

    if (!hero) {
      return createResponse({ error: 'Hero not found' }, 404);
    }

    return createResponse({ hero });
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

    const updates = await request.json();
    const hero = await Hero.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!hero) {
      return createResponse({ error: 'Hero not found' }, 404);
    }

    return createResponse({ hero });
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

    const hero = await Hero.findByIdAndDelete(params.id);

    if (!hero) {
      return createResponse({ error: 'Hero not found' }, 404);
    }

    return createResponse({ message: 'Hero deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
}

// Reorder hero slides
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { newOrder } = await request.json();
    const hero = await Hero.findById(params.id);

    if (!hero) {
      return createResponse({ error: 'Hero not found' }, 404);
    }

    // Get current order
    const currentOrder = hero.order;

    // Update orders
    if (newOrder > currentOrder) {
      // Moving down: decrease order of items in between
      await Hero.updateMany(
        { 
          order: { $gt: currentOrder, $lte: newOrder },
          _id: { $ne: params.id }
        },
        { $inc: { order: -1 } }
      );
    } else if (newOrder < currentOrder) {
      // Moving up: increase order of items in between
      await Hero.updateMany(
        { 
          order: { $gte: newOrder, $lt: currentOrder },
          _id: { $ne: params.id }
        },
        { $inc: { order: 1 } }
      );
    }

    // Update the hero's order
    hero.order = newOrder;
    await hero.save();

    return createResponse({ hero });
  } catch (error) {
    return handleError(error);
  }
}

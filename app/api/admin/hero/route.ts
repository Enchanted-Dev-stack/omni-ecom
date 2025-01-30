import { NextRequest } from 'next/server';
import { createResponse, handleError } from '@/lib/api-utils';
import connectDB from '@/lib/db';
import Hero from '@/models/hero';

export async function GET() {
  try {
    await connectDB();

    const heroes = await Hero.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return createResponse({ heroes });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();

    // Get highest order
    const lastHero = await Hero.findOne().sort({ order: -1 });
    const order = lastHero ? lastHero.order + 1 : 0;

    const hero = await Hero.create({ ...data, order });

    return createResponse({ hero }, 201);
  } catch (error) {
    return handleError(error);
  }
}

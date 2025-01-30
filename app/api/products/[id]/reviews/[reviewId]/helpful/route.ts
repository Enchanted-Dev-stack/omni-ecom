import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Review from '@/models/review';
import HelpfulVote from '@/models/helpfulVote';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user?.email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 401 }
      );
    }

    // Connect to MongoDB using Mongoose
    await connectDB();

    try {
      // Try to create the vote record first - this will fail if it already exists
      await HelpfulVote.create({
        reviewId: params.reviewId,
        userId: session.user.id
      });

      // If vote creation succeeds, increment the helpful count
      const review = await Review.findByIdAndUpdate(
        params.reviewId,
        { $inc: { helpful: 1 } },
        { new: true }
      );

      if (!review) {
        // If review not found, delete the vote we just created
        await HelpfulVote.deleteOne({
          reviewId: params.reviewId,
          userId: session.user.id
        });
        
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ helpful: review.helpful });
    } catch (error: any) {
      if (error.code === 11000) { // Duplicate key error
        return NextResponse.json(
          { error: 'You have already marked this review as helpful' },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error updating helpful count:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update helpful count' },
      { status: 500 }
    );
  }
}

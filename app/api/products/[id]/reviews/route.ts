import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/review';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

// GET /api/products/[id]/reviews
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sortBy') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get review statistics
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(params.id) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingCounts: {
            $push: '$rating'
          }
        }
      }
    ]);

    const ratingDistribution = stats.length > 0 ? {
      1: stats[0].ratingCounts.filter((r: number) => r === 1).length,
      2: stats[0].ratingCounts.filter((r: number) => r === 2).length,
      3: stats[0].ratingCounts.filter((r: number) => r === 3).length,
      4: stats[0].ratingCounts.filter((r: number) => r === 4).length,
      5: stats[0].ratingCounts.filter((r: number) => r === 5).length,
    } : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Get reviews with sorting
    const sortOptions: any = {
      createdAt: sortBy === 'recent' ? -1 : 1
    };
    if (sortBy === 'helpful') {
      sortOptions.helpful = -1;
    }

    const reviews = await Review.find({ productId: params.id })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name image')
      .lean();

    // Format the reviews
    const formattedReviews = reviews.map(review => ({
      id: review._id.toString(),
      user: {
        name: review.userId.name,
        avatar: review.userId.image
      },
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      date: formatDate(review.createdAt),
      helpful: review.helpful,
      verified: review.verified
    }));

    const totalReviews = await Review.countDocuments({ productId: params.id });

    return NextResponse.json({
      reviews: formattedReviews,
      stats: {
        averageRating: stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0,
        totalReviews,
        ratingDistribution
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/reviews
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to write a review' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    // Validate request body
    const { rating, title, comment } = body;
    if (!rating || !title || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      productId: params.id,
      userId: session.user.id
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create the review
    const review = new Review({
      productId: params.id,
      userId: session.user.id,
      rating,
      title,
      comment,
      verified: true, // Set to true if user has purchased the product
      helpful: 0
    });

    await review.save();

    // Get updated stats
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(params.id) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingCounts: {
            $push: '$rating'
          }
        }
      }
    ]);

    const ratingDistribution = stats.length > 0 ? {
      1: stats[0].ratingCounts.filter((r: number) => r === 1).length,
      2: stats[0].ratingCounts.filter((r: number) => r === 2).length,
      3: stats[0].ratingCounts.filter((r: number) => r === 3).length,
      4: stats[0].ratingCounts.filter((r: number) => r === 4).length,
      5: stats[0].ratingCounts.filter((r: number) => r === 5).length,
    } : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    return NextResponse.json({
      review: {
        id: review._id.toString(),
        user: {
          name: session.user.name,
          avatar: session.user.image
        },
        rating,
        title,
        comment,
        date: formatDate(new Date()),
        helpful: 0,
        verified: true
      },
      stats: {
        averageRating: stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : rating,
        totalReviews: stats.length > 0 ? stats[0].totalReviews : 1,
        ratingDistribution
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// Helper function to format dates
function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
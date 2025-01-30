'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, X } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

interface ReviewsProps {
  productId: string;
}

export default function Reviews({ productId }: ReviewsProps) {
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [helpfulLoading, setHelpfulLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews?sortBy=${sortBy}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      setReviews(data.reviews);
      setStats({
        averageRating: data.stats.averageRating || 0,
        totalReviews: data.stats.totalReviews || 0,
        ratingDistribution: data.stats.ratingDistribution || {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateRatingPercentage = (rating: number) => {
    if (!stats.totalReviews) return 0;
    const count = stats.ratingDistribution[rating] || 0;
    return (count / stats.totalReviews) * 100;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Please sign in to write a review');
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      // Add new review to the list and update stats
      setReviews(prevReviews => [data.review, ...prevReviews]);
      
      // Ensure we have complete stats data
      const newStats = {
        averageRating: data.stats.averageRating || stats.averageRating,
        totalReviews: data.stats.totalReviews || stats.totalReviews + 1,
        ratingDistribution: {
          1: data.stats.ratingDistribution?.[1] ?? stats.ratingDistribution[1],
          2: data.stats.ratingDistribution?.[2] ?? stats.ratingDistribution[2],
          3: data.stats.ratingDistribution?.[3] ?? stats.ratingDistribution[3],
          4: data.stats.ratingDistribution?.[4] ?? stats.ratingDistribution[4],
          5: data.stats.ratingDistribution?.[5] ?? stats.ratingDistribution[5]
        }
      };

      // If we're adding a new review and don't have updated stats, increment the appropriate rating count
      if (!data.stats.ratingDistribution) {
        newStats.ratingDistribution[newReview.rating as keyof typeof newStats.ratingDistribution]++;
      }

      setStats(newStats);
      setShowReviewForm(false);
      setNewReview({ rating: 0, title: '', comment: '' });
      toast.success('Review submitted successfully');
    } catch (error: any) {
      toast.error(error.message || 'You have already reviewed this product');
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!session) {
      toast.error('Please sign in to mark reviews as helpful');
      return;
    }

    if (helpfulLoading[reviewId]) return;

    try {
      setHelpfulLoading(prev => ({ ...prev, [reviewId]: true }));

      const response = await fetch(`/api/products/${productId}/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark review as helpful');
      }

      // Update the helpful count in the reviews list
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId
            ? { ...review, helpful: data.helpful }
            : review
        )
      );

      toast.success('Thank you for your feedback!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark review as helpful');
    } finally {
      setHelpfulLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-10">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-16 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customer Reviews</h2>
        
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
          {/* Rating Summary */}
          <div className="lg:col-span-1">
            <div className="flex items-center">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-5 w-5 ${
                      rating < stats.averageRating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <p className="ml-3 text-sm text-gray-700">
                Based on {stats.totalReviews} reviews
              </p>
            </div>

            <div className="mt-6">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center text-sm">
                  <div className="flex items-center w-24">
                    {rating}
                    <Star className="h-4 w-4 ml-1 text-yellow-400" fill="currentColor" />
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mx-3">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{
                        width: `${calculateRatingPercentage(rating)}%`
                      }}
                    />
                  </div>
                  <span className="text-gray-600 min-w-[40px]">
                    {stats.ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (!session) {
                  toast.error('Please sign in to write a review');
                  return;
                }
                setShowReviewForm(true);
              }}
              className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Write a Review
            </button>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Reviews</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
                className="text-sm border-gray-300 rounded-md"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>

            <div className="mt-8 space-y-8">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {review.user.avatar ? (
                        <Image
                          src={review.user.avatar}
                          alt={review.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xl font-medium text-gray-600">
                            {review.user.name[0]}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{review.user.name}</h4>
                        <div className="mt-1 flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <Star
                              key={rating}
                              className={`h-4 w-4 ${
                                rating < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{review.date}</p>
                  </div>

                  <div className="mt-4">
                    <p className="text-base font-medium text-gray-900">{review.title}</p>
                    <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                  </div>

                  <div className="mt-4 flex items-center space-x-4">
                    <button 
                      onClick={() => handleHelpful(review.id)}
                      disabled={helpfulLoading[review.id]}
                      className={`flex items-center text-sm ${
                        helpfulLoading[review.id]
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <ThumbsUp className={`h-4 w-4 mr-1 ${helpfulLoading[review.id] ? 'animate-pulse' : ''}`} />
                      Helpful ({review.helpful})
                    </button>
                    <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </button>
                    {review.verified && (
                      <span className="text-sm text-green-600 flex items-center">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setShowReviewForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
            
            <form onSubmit={handleSubmitReview}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onMouseEnter={() => setHoveredStar(rating)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating <= (hoveredStar || newReview.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Summarize your experience"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Review Details
                </label>
                <textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Share your experience with this product"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

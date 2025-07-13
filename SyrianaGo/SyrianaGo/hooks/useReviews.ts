import { createReview, getReviews } from '@/api/https/review.https';
import { useState, useEffect } from 'react';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userId?: {
    name: string;
  };
  createdAt: string;
}

interface NewReview {
  rating: number;
  comment: string;
}

interface UseReviewsReturn {
  reviews: Review[];
  loading: boolean;
  error: string;
  submitReview: (review: NewReview) => Promise<void>;
  submitting: boolean;
  averageRating: number;
  refreshReviews: () => Promise<void>;
}

export const useReviews = (listingId: string | undefined): UseReviewsReturn => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    if (!listingId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const data = await getReviews(listingId);
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (newReview: NewReview) => {
    if (!listingId) {
      throw new Error('Listing ID is required');
    }

    try {
      setSubmitting(true);
      setError('');

      await createReview(listingId, newReview);
      
      // Refresh reviews after successful submission
      await fetchReviews();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const refreshReviews = async () => {
    await fetchReviews();
  };

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  const averageRating = reviews.length > 0 
    ? parseFloat((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : 0;

  return {
    reviews,
    loading,
    error,
    submitReview,
    submitting,
    averageRating,
    refreshReviews,
  };
};
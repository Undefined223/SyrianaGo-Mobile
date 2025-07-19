import { useState } from 'react';
import { createBooking } from '@/api/https/booking.https';

interface BookingDetails {
  checkIn: string;
  checkOut: string;
  guests: number;
  price: number;
}

interface UseBookingReturn {
  submitting: boolean;
  error: string | null;
  submitBooking: (
    userId: string,
    listingId: string,
    details: BookingDetails,
    paymentMethod: string,
  ) => Promise<void>;
}

export const useBooking = (): UseBookingReturn => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitBooking = async (
    userId: string,
    listingId: string,
    details: BookingDetails,
    paymentMethod: string,
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      const bookingPayload = {
        userId,
        listingId,
        details,
        paymentMethod,
      };

      console.log('Submitting booking payload:', bookingPayload);

      const response = await createBooking(bookingPayload);

      console.log('Booking response:', response);

      if (response.requiresAction) {
        console.log('Payment requires additional authentication:', response.clientSecret);
        // Handle 3D Secure authentication flow here
      } else {
        console.log('Booking confirmed:', response.bookingId);
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, error, submitBooking };
};

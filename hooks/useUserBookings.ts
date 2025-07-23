import { useEffect, useState } from 'react';
import { getUserBookings } from '@/api/https/auth.https';

interface Booking {
  _id: string;
  userId: string;
  listingId: {
    _id: string;
    name: {
      en: string;
      fr: string;
      ar: string;
    };
    description: {
      en: string;
      fr: string;
      ar: string;
    };
    pricePerDay: number;
    images: string[];
    subcategory: string;
    location: {
      city: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    contact: {
      phone: string;
      email: string;
      website: string;
    };
    cta: {
      label: string;
      url: string;
    };
    isFeatured: boolean;
    vendor: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  details: {
    startDate: string;
    endDate: string;
    guests: number;
  };
  status: string;
  paymentMethod: string;
  paymentIntentId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const useUserBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getUserBookings();
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        if (
          err instanceof Error &&
          'response' in err &&
          err.response !== null &&
          typeof err.response === 'object' &&
          'config' in err.response &&
          'data' in err.response
        ) {
          console.log('Request details:', err.response.config);
          console.log('Response details:', err.response.data);
        }
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return { bookings, loading, error };
};

export default useUserBookings;

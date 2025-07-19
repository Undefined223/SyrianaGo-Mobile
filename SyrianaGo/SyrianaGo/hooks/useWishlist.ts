import { useState, useEffect } from 'react';
import { Listing } from '@/types/listing';
import { getWishlist, removeFromWishlist } from '@/api/https/auth.https';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const data = await getWishlist();
        setWishlist(data);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const remove = async (listingId: string) => {
    try {
      await removeFromWishlist(listingId);
      setWishlist((prev) => prev.filter((item) => item._id !== listingId));
    } catch (err) {
      console.error('Error removing item from wishlist:', err);
      setError('Failed to remove item');
    }
  };

  return { wishlist, loading, error, remove };
};

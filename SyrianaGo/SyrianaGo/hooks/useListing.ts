import { useEffect, useState, useCallback } from 'react';
import { getListing } from '@/api/https/listing.https';

export function useListing(id: string | undefined) {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getListing(id);
      setListing(res.data || res.listing || res);
      setError(null); // Clear previous errors
    } catch (err) {
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id, fetchListing]);

  return { listing, loading, error, refetch: fetchListing };
}

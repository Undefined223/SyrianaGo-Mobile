import { useEffect, useState } from 'react';
import { getAllCategories } from '@/api/https/cat.https';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllCategories()
      .then((data) => {
        // Log the response to debug
        console.log('Fetched categories:', data);
        // Try common response shapes
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.categories)
          ? data.categories
          : [];
        setCategories(
          arr.map((cat: any) => ({
            name: cat.name?.en || cat.name,
            icon: cat.icon || 'hotel',
            route: `/category/${cat._id}`,
            _id: cat._id,
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load categories');
        setLoading(false);
      });
  }, []);

  return { categories, loading, error };
}

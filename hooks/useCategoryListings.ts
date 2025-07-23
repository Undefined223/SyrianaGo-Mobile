import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { getCategoryWithListings } from '@/api/https/cat.https';

export function useCategoryListings(id: string | string[]) {
  const [category, setCategory] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    fetchListings();
  }, [id]);

  useEffect(() => {
    if (!selectedSubcategory) {
      setFilteredListings(listings);
    } else {
      setFilteredListings(listings.filter((l) => l.subcategory === selectedSubcategory));
    }
  }, [selectedSubcategory, listings]);

  const animateCard = (listingId: string) => {
    if (!cardAnimations[listingId]) {
      cardAnimations[listingId] = new Animated.Value(0);
    }
    Animated.spring(cardAnimations[listingId], {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const fetchListings = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setCurrentPage(1);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await getCategoryWithListings(id, page);

      if (page === 1 || isRefresh) {
        setCategory(res.category);
        setSubcategories(res.subcategories || []);
        setListings(res.listings);
        setFilteredListings(res.listings);
        setCurrentPage(1);
      } else {
        setListings((prev) => [...prev, ...res.listings]);
        setCurrentPage(page);
      }

      setTotalPages(res.totalPages);
      setSelectedSubcategory(null);
      setError(null);

      setTimeout(() => {
        res.listings.forEach((listing: any, index: number) => {
          setTimeout(() => animateCard(listing._id), index * 100);
        });
      }, 300);
    } catch (err) {
      setError('Failed to load category or listings');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchListings(currentPage + 1);
    }
  };

  const handleRefresh = () => {
    fetchListings(1, true);
  };

  return {
    category,
    subcategories,
    listings,
    filteredListings,
    selectedSubcategory,
    setSelectedSubcategory,
    loading,
    loadingMore,
    refreshing,
    error,
    cardAnimations,
    handleLoadMore,
    handleRefresh,
    fetchListings,
  };
}

import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '@/api/https/auth.https';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

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

  const handleRemove = async (listingId) => {
    try {
      await removeFromWishlist(listingId);
      setWishlist((prev) => prev.filter((item) => item._id !== listingId));
    } catch (err) {
      console.error('Error removing item from wishlist:', err);
      setError('Failed to remove item');
    }
  };

  const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

  const renderItem = ({ item, index }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: `${API_URL}/uploads/${item.images[0]}` }} 
            style={styles.image} 
            resizeMode="cover"
          />

          <View style={styles.favoriteIcon}>
            <Ionicons name="heart" size={20} color="#ff6b6b" />
          </View>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name.en}</Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${item.pricePerDay}</Text>
              <Text style={styles.priceLabel}>/day</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
          
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemove(item._id)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.viewButton} 
              onPress={() => navigation.navigate('listing/[id]', { id: item._id })}
              activeOpacity={0.8}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
              <Ionicons name="arrow-forward" size={16} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>My Wishlist</Text>
              <Text style={styles.headerSubtitle}>
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="heart" size={32} color="#2E7D32" />
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{wishlist.length}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                ${wishlist.reduce((sum, item) => sum + item.pricePerDay, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyGradient}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="heart-outline" size={100} color="#66BB6A" />
          <View style={styles.emptyIconDecoration} />
        </View>
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>
          Discover amazing items and save your favorites here
        </Text>
        <TouchableOpacity style={styles.exploreButton} activeOpacity={0.8}>
          <Text style={styles.exploreButtonText}>Explore Items</Text>
          <Ionicons name="compass" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={styles.loadingCard}>
          <View style={styles.loadingImage}>
            <View style={styles.shimmer} />
          </View>
          <View style={styles.loadingInfo}>
            <View style={styles.loadingText}>
              <View style={[styles.shimmer, { height: 20 }]} />
            </View>
            <View style={styles.loadingTextSmall}>
              <View style={[styles.shimmer, { height: 16 }]} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
      </View>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} activeOpacity={0.8}>
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FDF8" />
      
      {loading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : wishlist.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FDF8',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: '#E8F5E8',
  },
  headerContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#388E3C',
    fontWeight: '600',
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#66BB6A',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  separator: {
    height: 16,
  },
  cardContainer: {
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#F1F8E9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  favoriteIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: {
    padding: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
    lineHeight: 24,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
  },
  priceLabel: {
    fontSize: 16,
    color: '#66BB6A',
    marginLeft: 4,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  viewButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyGradient: {
    padding: 40,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#E8F5E8',
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  emptyIconDecoration: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(102, 187, 106, 0.1)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#388E3C',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  loadingContainer: {
    padding: 20,
    gap: 16,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  loadingImage: {
    height: 200,
    backgroundColor: '#F1F8E9',
    position: 'relative',
  },
  loadingInfo: {
    padding: 20,
    gap: 12,
  },
  loadingText: {
    height: 20,
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
  },
  loadingTextSmall: {
    height: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    width: '60%',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#C8E6C9',
    borderRadius: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#388E3C',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
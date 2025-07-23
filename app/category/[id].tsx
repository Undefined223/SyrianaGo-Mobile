import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Animated,
  FlatList,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCategoryListings } from '@/hooks/useCategoryListings';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
const { width, height } = Dimensions.get('window');

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Custom hook usage
  const {
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
  } = useCategoryListings(id as string);

  // Animation refs for UI-only animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleImageError = (imageUri: string) => {
    setImageErrors(prev => new Set([...prev, imageUri]));
  };

  const getImageUri = (imagePath: string) => {
    return `${API_URL}/uploads/${imagePath}`;
  };

  const renderListingCard = ({ item: listing, index }: { item: any, index: number }) => {
    const cardScale = cardAnimations[listing._id] || new Animated.Value(1);

    return (
      <Animated.View
        style={[
          styles.listingCard,
          {
            transform: [
              {
                scale: cardScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }
            ],
            opacity: cardScale,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.cardTouchable}
          activeOpacity={0.9}
          onPress={() => {
            router.push(`/listing/${listing._id}`);
          }}
        >
          <View style={styles.imageContainer}>
            {listing.images && listing.images.length > 0 ? (
              <Image
                source={{ uri: getImageUri(listing.images[0]) }}
                style={styles.listingImage}
                resizeMode="cover"
                onError={() => handleImageError(getImageUri(listing.images[0]))}
              />
            ) : (
              <LinearGradient
                colors={['#017b3e', '#4CAF50']}
                style={styles.placeholderImage}
              >
                <Text style={styles.placeholderText}>📷</Text>
              </LinearGradient>
            )}
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageOverlay}
            />
            
            <View style={styles.cardContent}>
              <Text style={styles.listingTitle} numberOfLines={2}>
                {listing.name?.[language] || listing.name || t('unknown_listing')}
              </Text>
              <Text style={styles.listingDesc} numberOfLines={2}>
                {listing.description?.[language] || listing.description || t('no_description')}
              </Text>
              
              <View style={styles.cardFooter}>
                {listing.price && (
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>${listing.price}</Text>
                  </View>
                )}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {subcategories.find(s => s._id === listing.subcategory)?.name?.[language] || t('general')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: headerOpacity,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#017b3e', '#2E7D32', '#4CAF50']}
        style={styles.headerGradient}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          {category?.icon && (
            <View style={styles.iconContainer}>
              <Image
                source={{ uri: getImageUri(category.icon) }}
                style={styles.categoryIcon}
                resizeMode="cover"
              />
              <View style={styles.iconGlow} />
            </View>
          )}
          
          <Text style={styles.categoryTitle}>
            {category?.name?.[language] || category?.name || t('category')}
          </Text>
          
          <Text style={styles.categorySubtitle}>
            {filteredListings.length} {t('amazing_listings')}
          </Text>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );

  const renderSubcategoryFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>{t('filter_by_category')}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !selectedSubcategory && styles.filterChipActive]}
          onPress={() => setSelectedSubcategory(null)}
        >
          <LinearGradient
            colors={!selectedSubcategory ? ['#017b3e', '#4CAF50'] : ['#f8f9fa', '#e9ecef']}
            style={styles.filterChipGradient}
          >
            <Text style={[styles.filterChipText, !selectedSubcategory && styles.filterChipTextActive]}>
              🌟 {t('all')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {subcategories.map((sub: any) => (
          <TouchableOpacity
            key={sub._id}
            style={[styles.filterChip, selectedSubcategory === sub._id && styles.filterChipActive]}
            onPress={() => setSelectedSubcategory(sub._id)}
          >
            <LinearGradient
              colors={selectedSubcategory === sub._id ? ['#017b3e', '#4CAF50'] : ['#f8f9fa', '#e9ecef']}
              style={styles.filterChipGradient}
            >
              <Text style={[styles.filterChipText, selectedSubcategory === sub._id && styles.filterChipTextActive]}>
                {sub.name?.[language] || sub.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="large" color="#017b3e" />
          <Text style={styles.loadingText}>{t('loading_more_listings')}</Text>
        </View>
      );
    }

    if (filteredListings.length === 0 && !loading) {
      return (
        <View style={styles.endMessage}>
          <Text style={styles.endMessageText}>📋 {t('no_listings_found')}</Text>
          <Text style={styles.endMessageSubtext}>{t('try_adjusting_filters')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.endMessage}>
        <Text style={styles.endMessageText}>🎉 {t('seen_all_listings')}</Text>
        <Text style={styles.endMessageSubtext}>{t('check_back_later')}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#017b3e', '#4CAF50']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingMainText}>{t('loading_content')}</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#e74c3c', '#c0392b']} style={styles.errorContainer}>
        <Text style={styles.errorText}>😔 {t('something_went_wrong')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>{t('try_again')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {renderHeader()}
        
        {subcategories.length > 0 && renderSubcategoryFilter()}
        
        <FlatList
          data={filteredListings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#017b3e']}
              tintColor="#017b3e"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    height: 200,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
  },
  categoryTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  categorySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  filterChipActive: {
    // Active style handled by gradient
  },
  filterChipGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  listingCard: {
    flex: 1,
    margin: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardTouchable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  listingImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  listingDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: 'rgba(1,123,62,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingFooter: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  endMessage: {
    padding: 32,
    alignItems: 'center',
  },
  endMessageText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#017b3e',
    marginBottom: 8,
  },
  endMessageSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
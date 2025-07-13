import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import styles from './ListingCard.styles';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export default function ListingCard({ listing, subcategories, cardAnimations }: any) {
  const router = useRouter();
  const cardScale = cardAnimations[listing._id] || new Animated.Value(1);

  const getImageUri = (imagePath: string) => `${API_URL}/uploads/${imagePath}`;

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
              }),
            },
          ],
          opacity: cardScale,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => router.push(`/listing/${listing._id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {listing.images?.length > 0 ? (
            <Image source={{ uri: getImageUri(listing.images[0]) }} style={styles.listingImage} />
          ) : (
            <LinearGradient colors={['#017b3e', '#4CAF50']} style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>📷</Text>
            </LinearGradient>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          />

          <View style={styles.cardContent}>
            <Text style={styles.listingTitle} numberOfLines={2}>
              {listing.title || listing.name?.en || listing.name}
            </Text>
            <Text style={styles.listingDesc} numberOfLines={2}>
              {listing.description?.en || listing.description || 'Discover amazing deals...'}
            </Text>
            <View style={styles.cardFooter}>
              {listing.price && (
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>${listing.price}</Text>
                </View>
              )}
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {subcategories.find((s: any) => s._id === listing.subcategory)?.name?.en || 'General'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

import React, { useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  ScrollView,
  Linking,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Share,
  Alert,
  Modal
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import { useListing } from '@/hooks/useListing';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Reviews from '@/components/Reviews'; // Import the Reviews component
import { addToWishlist, removeFromWishlist } from '@/api/https/auth.https'; // Import wishlist API functions
import { AuthContext, AuthContextType } from '../context/AuthContext';

import ImageGallery from '@/components/listing/ImageGallery';
import TabNavigation from '@/components/listing/TabNavigation';
import BookingModal from '@/components/listing/BookingModal';
import { StripeProvider } from '@stripe/stripe-react-native';
import MapView, { Marker } from 'react-native-maps';
import { WebView } from 'react-native-webview';

import styles from './styles/ListingDetailScreen.styles';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
const { width, height } = Dimensions.get('window');

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const { listing, loading, error, refetch } = useListing(id as string | undefined);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // New state for tab navigation

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (listing) {
      // Animate on load
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [listing]);

  const authContext = useContext(AuthContext) as AuthContextType;

  const { wishlist, setWishlist, user } = authContext;
  const { t, language } = useLanguage();


  const handleShare = async () => {
    try {
      await Share.share({
        message: `${t('check_out_listing')}: ${listing.name?.[language] || listing.name?.en || t('unknown_listing')}`,
        url: `https://syriango.com/${language}/listing/${id}`,
      });
    } catch (error) {
      console.log(t('error_sharing'), error);
    }
  };

  const handleFavorite = async () => {
    try {
      if (isFavorited) {
        await removeFromWishlist(id as string);
        setWishlist(wishlist.filter((item: { _id: string }) => item._id !== id));
      } else {
        const newItem = await addToWishlist(id as string);
        setWishlist([...wishlist, newItem]);
      }
      setIsFavorited(!isFavorited);
      Animated.sequence([
        Animated.spring(heartAnim, {
          toValue: 1.3,
          tension: 300,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(heartAnim, {
          toValue: 1,
          tension: 300,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleContact = (type: string, value: string) => {
    switch (type) {
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'website':
        const url = value.startsWith('http') ? value : `https://${value}`;
        Linking.openURL(url);
        break;
    }
  };

  const renderImageGallery = () => {
    return <ImageGallery images={listing.images || []} API_URL={API_URL} />;
  };

  const renderTabNavigation = () => {
    return <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />;
  };

  const renderPriceCard = () => {
    const price = listing.pricePerDay || listing.price;
    if (!price) return null;

    return (
      <Animated.View
        style={[
          styles.priceCard,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.priceGradient}
        >
          <Text style={styles.priceLabel}>{t('price_per_day')}</Text>
          <Text style={styles.priceValue}>${price}</Text>
          <View style={styles.priceAccent} />
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderLocationCard = () => {
    const city = listing.location?.city;
    if (!city) return null;

    return (
      <Animated.View
        style={[
          styles.locationCard,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.locationGradient}
        >
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{city}</Text>
          <View style={styles.locationPulse} />
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderContactCard = () => {
    const contact = listing.contact || {};
    const hasContact = contact.phone || contact.email || contact.website;

    if (!hasContact) return null;

    return (
      <Animated.View
        style={[
          styles.contactCard,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <BlurView intensity={20} style={styles.contactBlur}>
          <LinearGradient
            colors={['rgba(1,123,62,0.9)', 'rgba(46,125,50,0.9)']}
            style={styles.contactGradient}
          >
            <Text style={styles.contactTitle}>💬 {t('get_in_touch')}</Text>

            <View style={styles.contactButtons}>
              {contact.phone && (
                <Text>{t('phone')}: {contact.phone}</Text>
              )}
              {contact.email && (
                <Text>{t('email')}: {contact.email}</Text>
              )}
              {contact.website && (
                <Text>{t('website')}: {contact.website}</Text>
              )}
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  };

  const renderMapSection = () => {
    const location = listing.location;

    if (!location?.coordinates?.lat || !location?.coordinates?.lng) return null;

    const latitude = location.coordinates.lat;
    const longitude = location.coordinates.lng;

    const leafletHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
          <style>
            html, body, #map {
              height: 100%;
              width: 100%;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            document.addEventListener("DOMContentLoaded", function() {
              const map = L.map('map').setView([${latitude}, ${longitude}], 15);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
              }).addTo(map);
              L.marker([${latitude}, ${longitude}]).addTo(map)
                .bindPopup('${listing.name?.[language] || listing.name?.en || t('unknown_listing')}')
                .openPopup();
            });
          </script>
        </body>
      </html>
    `;

    return (
    <View style={styles.mapContainer}>
  <WebView
    originWhitelist={['*']}
    source={{ html: leafletHtml }}
    style={styles.map}
  />
</View>

    );
  };


  const renderDetailsContent = () => {
    const desc = listing.description?.en || listing.description;

    return (
      <View style={styles.tabContent}>
        <View style={styles.cardsContainer}>
          {renderPriceCard()}
          {renderLocationCard()}
        </View>

        {renderMapSection()}

        <Animated.View
          style={[
            styles.descriptionSection,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <Text style={styles.descriptionTitle}>✨ {t('about_listing')}</Text>
          <Text style={styles.description}>{desc}</Text>
        </Animated.View>

        {renderContactCard()}
      </View>
    );
  };

  const renderReviewsContent = () => {
    // You'll need to pass the current user if available
    // This assumes you have a way to get the current user
    const currentUser = user; // Replace with actual user data if available

    return (
      <View style={styles.tabContent}>
        <Reviews
          listingId={id as string}
          user={currentUser}
        />
      </View>
    );
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleBookingSubmit = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates for your booking.');
      return;
    }

    try {
      console.log('Submitting booking:', { startDate, endDate });
      // Replace with actual API call
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: id,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking');
      }

      const result = await response.json();
      console.log('Booking submitted successfully:', result);
      Alert.alert('Success', 'Your booking has been submitted!');
      toggleModal();
    } catch (error) {
      console.error('Error submitting booking:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit booking');
    }
  };

  const renderBookingModal = () => {
    const currentUser = user; // Ensure user context is available

    if (!currentUser) {
      Alert.alert('Error', 'You must be signed in to book a listing.');
      return null;
    }

    return (


      <BookingModal
        isVisible={isModalVisible}  // Change from isModalVisible to isVisible
        onClose={toggleModal}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        listingId={Array.isArray(id) ? id[0] : id} // Ensure id is a string
        userId={currentUser.id} // Pass userId from context
        pricePerDay={listing.pricePerDay || listing.price}
      />
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleFavorite}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <Text style={styles.actionButtonText}>
              {isFavorited ? '❤️' : '🖤'}
            </Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>🔗</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderListingName = () => {
    return (
      <Text style={styles.listingName}>
        {listing.name?.[language] || listing.name?.en || t('unknown_listing')}
      </Text>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#017b3e', '#4CAF50']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading amazing listing...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#e74c3c', '#c0392b']} style={styles.errorContainer}>
        <Text style={styles.errorText}>😔 Oops! Something went wrong</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (!listing) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>🔍 Listing not found</Text>
      </View>
    );
  }

  const name = listing.name?.en || listing.name;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderImageGallery()}

        {renderActionButtons()}

        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.headerSection,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {renderListingName()}
            {listing.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>⭐ Featured</Text>
              </View>
            )}
          </Animated.View>

          {renderTabNavigation()}

          {activeTab === 'details' ? renderDetailsContent() : renderReviewsContent()}

          <TouchableOpacity
            style={styles.bookButton}
            onPress={toggleModal}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderBookingModal()}
    </View>
  );
}
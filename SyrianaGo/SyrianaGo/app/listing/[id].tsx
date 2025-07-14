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
import { AuthContext } from '@/app/context/AuthContext';

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

  const { wishlist, setWishlist } = useContext(AuthContext);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing listing: ${listing.name?.en || listing.name}`,
        url: `https://syriango.com/en/listing/${id}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
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
    const images = listing.images || [];
    if (images.length === 0) return null;

    return (
      <View style={styles.imageGalleryContainer}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(img: string, idx: number) => img + idx}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          renderItem={({ item, index }: { item: string; index: number }) => (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `${API_URL}/uploads/${item}` }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
              />
            </View>
          )}
        />
        
        {/* Image indicators */}
        <View style={styles.imageIndicators}>
          {images.map((_, index: number) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentImageIndex === index && styles.indicatorActive
              ]}
            />
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFavorite}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <Text style={styles.actionButtonText}>
                {isFavorited ? '❤️' : '🤍'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTabNavigation = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'details' && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab('details')}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'details' && styles.tabButtonTextActive
          ]}>
            Details
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'reviews' && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab('reviews')}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'reviews' && styles.tabButtonTextActive
          ]}>
            Reviews
          </Text>
        </TouchableOpacity>
      </View>
    );
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
          <Text style={styles.priceLabel}>Price per day</Text>
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
            <Text style={styles.contactTitle}>💬 Get in Touch</Text>
            
            <View style={styles.contactButtons}>
              {contact.phone && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContact('phone', contact.phone)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#25D366', '#128C7E']}
                    style={styles.contactButtonGradient}
                  >
                    <Text style={styles.contactButtonIcon}>📞</Text>
                    <Text style={styles.contactButtonText}>Call</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {contact.email && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContact('email', contact.email)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#EA4335', '#D33B2C']}
                    style={styles.contactButtonGradient}
                  >
                    <Text style={styles.contactButtonIcon}>✉️</Text>
                    <Text style={styles.contactButtonText}>Email</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {contact.website && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContact('website', contact.website)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4285F4', '#1976D2']}
                    style={styles.contactButtonGradient}
                  >
                    <Text style={styles.contactButtonIcon}>🌐</Text>
                    <Text style={styles.contactButtonText}>Website</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
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

        <Animated.View
          style={[
            styles.descriptionSection,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <Text style={styles.descriptionTitle}>✨ About this listing</Text>
          <Text style={styles.description}>{desc}</Text>
        </Animated.View>

        {renderContactCard()}
      </View>
    );
  };

  const renderReviewsContent = () => {
    // You'll need to pass the current user if available
    // This assumes you have a way to get the current user
    const currentUser = null; // Replace with actual user data if available
    
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (event: { nativeEvent: { contentOffset: { y: number } } }) => {
              console.log('Scroll event:', event.nativeEvent.contentOffset.y);
            },
          }
        )}
      >
        {renderImageGallery()}

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
            <Text style={styles.title}>{name}</Text>
            {listing.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>⭐ Featured</Text>
              </View>
            )}
          </Animated.View>

          {renderTabNavigation()}

          {activeTab === 'details' ? renderDetailsContent() : renderReviewsContent()}

          {/* Book Button */}
          <TouchableOpacity
            style={styles.bookButton}
            onPress={toggleModal}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Booking Dates</Text>

            {/* Date Picker Placeholder */}
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel}>Start Date:</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => console.log('Open Start Date Picker')}
              >
                <Text style={styles.datePickerButtonText}>{startDate ? startDate.toDateString() : 'Select Start Date'}</Text>
              </TouchableOpacity>

              <Text style={styles.datePickerLabel}>End Date:</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => console.log('Open End Date Picker')}
              >
                <Text style={styles.datePickerButtonText}>{endDate ? endDate.toDateString() : 'Select End Date'}</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Options Placeholder */}
            <View style={styles.paymentOptionsContainer}>
              <Text style={styles.paymentOptionsTitle}>Payment Options</Text>
              <TouchableOpacity
                style={styles.paymentOptionButton}
                onPress={() => console.log('Card Payment Selected')}
              >
                <Text style={styles.paymentOptionText}>Pay with Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paymentOptionButton}
                onPress={() => console.log('Cash on Delivery Selected')}
              >
                <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={toggleModal}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fffe',
  },
  notFoundText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  imageGalleryContainer: {
    height: height * 0.5,
    position: 'relative',
  },
  imageContainer: {
    width: width,
    height: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  actionButtons: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'column',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f8fffe',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  featuredBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  featuredText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B8860B',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#337914',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
    minHeight: 400,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  priceCard: {
    flex: 1,
    marginRight: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  priceGradient: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  priceLabel: {
    fontSize: 12,
    color: '#B8860B',
    fontWeight: '600',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  priceAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderBottomLeftRadius: 20,
  },
  locationCard: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  locationGradient: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  locationIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  locationPulse: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  contactCard: {
    marginBottom: 40,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  contactBlur: {
    flex: 1,
  },
  contactGradient: {
    padding: 24,
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  contactButton: {
    margin: 8,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  contactButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  contactButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  bookButton: {
    backgroundColor: '#337914',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  datePickerContainer: {
    marginBottom: 24,
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  datePickerButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  paymentOptionsContainer: {
    marginBottom: 24,
  },
  paymentOptionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentOptionButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#333',
  },
  closeModalButton: {
    backgroundColor: '#337914',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
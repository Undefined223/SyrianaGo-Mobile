import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useReviews } from '@/hooks/useReviews';

const { width } = Dimensions.get('window');

interface ReviewsProps {
  listingId: string;
  user?: {
    id: string;
    name: string;
  } | null;
}

const Reviews: React.FC<ReviewsProps> = ({ listingId, user }) => {
  const { reviews, loading, error, submitReview, submitting, averageRating, refreshReviews } = useReviews(listingId);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    if (!loading) {
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
      ]).start();
    }
  }, [loading]);

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  const renderStars = (rating: number, size: number = 20, color: string = '#FFD700') => {
    return (
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }, (_, i) => (
          <Text
            key={i}
            style={[
              styles.star,
              { fontSize: size, color: i < rating ? color : '#E0E0E0' }
            ]}
          >
            ⭐
          </Text>
        ))}
      </View>
    );
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    try {
      await submitReview(newReview);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      Alert.alert('Success', 'Your review has been submitted!');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  const renderRatingDistribution = () => {
    if (reviews.length === 0) return null;

    return (
      <View style={styles.ratingDistribution}>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviews.filter(r => r.rating === rating).length;
          const percentage = (count / reviews.length) * 100;
          
          return (
            <View key={rating} style={styles.ratingRow}>
              <Text style={styles.ratingNumber}>{rating}</Text>
              <Text style={styles.starSmall}>⭐</Text>
              <View style={styles.ratingBar}>
                <View
                  style={[
                    styles.ratingBarFill,
                    { width: `${percentage}%` }
                  ]}
                />
              </View>
              <Text style={styles.ratingCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#337914" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header Section */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.headerGradient}
          >
            <Text style={styles.title}>Guest Reviews</Text>
            
            {reviews.length > 0 && (
              <View style={styles.averageRatingContainer}>
                <View style={styles.ratingOverview}>
                  {renderStars(Math.round(averageRating), 24, '#FFD700')}
                  <Text style={styles.averageRatingText}>{averageRating}</Text>
                </View>
                <Text style={styles.reviewCount}>
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            
            {renderRatingDistribution()}
          </LinearGradient>
        </Animated.View>

        {/* Reviews List */}
        <Animated.View
          style={[
            styles.reviewsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {reviews.length === 0 ? (
            <View style={styles.noReviewsContainer}>
              <Text style={styles.noReviewsEmoji}>💬</Text>
              <Text style={styles.noReviewsTitle}>No Reviews Yet</Text>
              <Text style={styles.noReviewsSubtitle}>
                Be the first to share your experience!
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View key={review._id} style={styles.reviewCard}>
                <LinearGradient
                  colors={['#ffffff', '#f8f9fa']}
                  style={styles.reviewGradient}
                >
                  <View style={styles.reviewHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userInitial}>
                          {(review.userId?.name || 'G')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>
                          {review.userId?.name || 'Guest User'}
                        </Text>
                        <Text style={styles.reviewTime}>
                          {formatTimeAgo(review.createdAt)}
                        </Text>
                      </View>
                    </View>
                    {renderStars(review.rating, 16)}
                  </View>
                  
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </LinearGradient>
              </View>
            ))
          )}
        </Animated.View>

        {/* Review Form */}
        {user ? (
          <Animated.View
            style={[
              styles.reviewFormSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {!showReviewForm ? (
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => setShowReviewForm(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#337914', '#2d6b12']}
                  style={styles.writeReviewGradient}
                >
                  <Text style={styles.writeReviewButtonText}>✍️ Write a Review</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <BlurView intensity={20} style={styles.reviewFormBlur}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.95)', 'rgba(248,249,250,0.95)']}
                  style={styles.reviewFormGradient}
                >
                  <Text style={styles.reviewFormTitle}>Share Your Experience</Text>
                  
                  <View style={styles.ratingSelector}>
                    <Text style={styles.ratingLabel}>Your Rating:</Text>
                    <View style={styles.ratingButtons}>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <TouchableOpacity
                          key={rating}
                          style={[
                            styles.ratingButton,
                            newReview.rating === rating && styles.ratingButtonActive
                          ]}
                          onPress={() => setNewReview(prev => ({ ...prev, rating }))}
                        >
                          <Text
                            style={[
                              styles.ratingButtonText,
                              newReview.rating === rating && styles.ratingButtonTextActive
                            ]}
                          >
                            {rating}⭐
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TextInput
                    style={styles.commentInput}
                    placeholder="Tell others about your experience..."
                    placeholderTextColor="#999"
                    value={newReview.comment}
                    onChangeText={(text) => setNewReview(prev => ({ ...prev, comment: text }))}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  {error && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}

                  <View style={styles.formButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowReviewForm(false);
                        setNewReview({ rating: 5, comment: '' });
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                      onPress={handleSubmitReview}
                      disabled={submitting}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={submitting ? ['#94a3b8', '#64748b'] : ['#337914', '#2d6b12']}
                        style={styles.submitButtonGradient}
                      >
                        {submitting ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.submitButtonText}>Submit Review</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </BlurView>
            )}
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.signInPrompt,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.signInGradient}
            >
              <Text style={styles.signInEmoji}>👤</Text>
              <Text style={styles.signInTitle}>Sign In to Leave a Review</Text>
              <Text style={styles.signInSubtitle}>
                Share your experience and help others make informed decisions
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  headerSection: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerGradient: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  averageRatingText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#337914',
    marginLeft: 12,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  ratingDistribution: {
    marginTop: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 14,
    color: '#666',
    width: 20,
    fontWeight: '600',
  },
  starSmall: {
    fontSize: 12,
    marginHorizontal: 8,
  },
  ratingBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#337914',
    borderRadius: 3,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    width: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 1,
  },
  reviewsSection: {
    paddingHorizontal: 16,
  },
  noReviewsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noReviewsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noReviewsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  noReviewsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  reviewCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewGradient: {
    padding: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#337914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  reviewTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  reviewFormSection: {
    margin: 16,
    marginBottom: 32,
  },
  writeReviewButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  writeReviewGradient: {
    padding: 20,
    alignItems: 'center',
  },
  writeReviewButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  reviewFormBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  reviewFormGradient: {
    padding: 24,
  },
  reviewFormTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24,
  },
  ratingSelector: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: '#337914',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  ratingButtonTextActive: {
    color: '#fff',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  signInPrompt: {
    margin: 16,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signInGradient: {
    padding: 32,
    alignItems: 'center',
  },
  signInEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  signInTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default Reviews;
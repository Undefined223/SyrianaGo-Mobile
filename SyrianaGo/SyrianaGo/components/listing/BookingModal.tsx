import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import axiosInstance from '@/api/AxiosInstance';
import styles from '@/styles/BookingModal.styles';
import { useBooking } from '@/hooks/useBooking';
import { getBlockedDatesByListing, getListingAvailability } from '@/api/https/listing.https';
import { createBooking } from '@/api/https/booking.https';
import { useLanguage } from '@/app/context/LanguageContext';

const { width, height } = Dimensions.get('window');

interface BookingModalProps {
  isVisible: boolean;
  onClose: () => void;
  listingId: string;
  userId: string;
  pricePerDay: number;
  startDate: Date | null;
  endDate: Date | null;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isVisible,
  onClose,
  listingId,
  userId,
  pricePerDay,
}) => {
  const { t } = useLanguage();

  // State management
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('cod');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [saveCard, setSaveCard] = useState<boolean>(true);

  const stripe = useStripe();

  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setCheckIn(null);
      setCheckOut(null);
      setGuests(1);
      setPaymentMethod('cod');
      setLoading(false);
      setSuccess(false);
      setError('');
      setCardDetails(null);
      setSaveCard(true);
    }
  }, [isVisible]);

  // Fetch unavailable dates
  useEffect(() => {
    if (!isVisible) return;

    const fetchUnavailableDates = async () => {
      try {
        const [booked, blocked] = await Promise.all([
          getListingAvailability(listingId),
          getBlockedDatesByListing(listingId),
        ]);

        const bookedDates = booked.unavailableDates || [];
        const blockedDates = (blocked || []).flatMap((b: any) =>
          getDatesInRange(b.startDate, b.endDate)
        );

        setUnavailableDates([...new Set([...bookedDates, ...blockedDates])]);
      } catch (err) {
        console.error('Error fetching unavailable dates:', err);
        setUnavailableDates([]);
      }
    };

    fetchUnavailableDates();
  }, [isVisible, listingId]);

  // Helper function to get dates in range
  const getDatesInRange = (start: string, end: string): string[] => {
    const arr: string[] = [];
    let dt = new Date(start);
    const endDt = new Date(end);

    while (dt <= endDt) {
      arr.push(dt.toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  };

  // Calculate total price
  const calculateTotalPrice = (): number => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights * pricePerDay;
  };

  // Calculate number of nights
  const calculateNights = (): number => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return t('select_date');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle date selection
  const handleDateSelect = (day: any, type: 'checkIn' | 'checkOut') => {
    const selectedDate = new Date(day.dateString);

    if (type === 'checkIn') {
      setCheckIn(selectedDate);
      // Reset checkout if it's before new checkin
      if (checkOut && selectedDate >= checkOut) {
        setCheckOut(null);
      }
    } else {
      setCheckOut(selectedDate);
    }
  };

  // Create booking payload
  const createBookingPayload = () => ({
    userId,
    listingId,
    details: {
      checkIn: checkIn?.toISOString().split('T')[0],
      checkOut: checkOut?.toISOString().split('T')[0],
      guests,
      price: calculateTotalPrice(),
    },
    paymentMethod,
    saveCard: paymentMethod === 'stripe' ? saveCard : false,
  });

  // Handle COD booking
  const handleCODBooking = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = createBookingPayload();
      await createBooking(payload);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Stripe booking
  const handleStripeBooking = async () => {
    if (!stripe) {
      Alert.alert('Error', 'Stripe is not initialized');
      return;
    }

    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please complete your card details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create booking and get client secret
      const payload = createBookingPayload();
      const response = await createBooking(payload);

      // Confirm booking immediately
      setSuccess(true);
      Alert.alert('Booking Confirmed', 'Your booking has been confirmed. You can check the payment status later in your profile.');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!checkIn || !checkOut) {
      Alert.alert('Error', 'Please select both check-in and check-out dates');
      return;
    }

    if (guests < 1) {
      Alert.alert('Error', 'Please enter a valid number of guests');
      return;
    }

    if (paymentMethod === 'stripe') {
      handleStripeBooking();
    } else {
      handleCODBooking();
    }
  };

  // Create disabled dates object for calendar
  const getDisabledDates = () => {
    const disabled: { [key: string]: { disabled: boolean; disableTouchEvent: boolean } } = {};
    unavailableDates.forEach(date => {
      disabled[date] = { disabled: true, disableTouchEvent: true };
    });
    return disabled;
  };

  // Create marked dates for calendar
  const getMarkedDates = () => {
    const marked = { ...getDisabledDates() };

    if (checkIn) {
      const checkInDate = checkIn.toISOString().split('T')[0];
      marked[checkInDate] = {
        selected: true,
        selectedColor: '#337914',
        selectedTextColor: '#ffffff',
      };
    }

    if (checkOut) {
      const checkOutDate = checkOut.toISOString().split('T')[0];
      marked[checkOutDate] = {
        selected: true,
        selectedColor: '#337914',
        selectedTextColor: '#ffffff',
      };
    }

    return marked;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{t('book_your_stay')}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Booking Form */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.formContainer}>
            {/* Date Selection */}
            <View style={styles.dateSection}>
              <Text style={styles.sectionTitle}>{t('select_dates')}</Text>

              {/* Date Range Display */}
              <View style={styles.dateRangeContainer}>
                <View style={styles.dateRangeItem}>
                  <Text style={styles.dateRangeLabel}>{t('check_in')}</Text>
                  <View style={styles.dateRangeValue}>
                    <Text style={styles.dateRangeText}>{formatDate(checkIn)}</Text>
                  </View>
                </View>
                <View style={styles.dateRangeItem}>
                  <Text style={styles.dateRangeLabel}>{t('check_out')}</Text>
                  <View style={styles.dateRangeValue}>
                    <Text style={styles.dateRangeText}>{formatDate(checkOut)}</Text>
                  </View>
                </View>
              </View>

              {/* Calendar */}
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={(day) => {
                    if (!checkIn || (checkIn && checkOut)) {
                      handleDateSelect(day, 'checkIn');
                    } else {
                      handleDateSelect(day, 'checkOut');
                    }
                  }}
                  markedDates={getMarkedDates()}
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    selectedDayBackgroundColor: '#337914',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#337914',
                    dayTextColor: '#2c3e50',
                    textDisabledColor: '#d1d5db',
                    arrowColor: '#337914',
                    monthTextColor: '#2c3e50',
                    textDayFontWeight: '600',
                    textMonthFontWeight: '700',
                    textDayHeaderFontWeight: '600',
                  }}
                />
              </View>
            </View>

            {/* Guests Input */}
            <View style={styles.guestsSection}>
              <Text style={styles.sectionTitle}>{t('number_of_guests')}</Text>
              <TextInput
                style={styles.guestsInput}
                keyboardType="numeric"
                value={guests.toString()}
                onChangeText={(text) => setGuests(parseInt(text) || 1)}
                placeholder={t('enter_number_of_guests')}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Price Summary */}
            {checkIn && checkOut && (
              <View style={styles.priceSection}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>
                    ${pricePerDay} x {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.priceValue}>${calculateTotalPrice()}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t('total')}</Text>
                  <Text style={styles.totalValue}>${calculateTotalPrice()}</Text>
                </View>
              </View>
            )}

            {/* Payment Method Selection */}
            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>{t('payment_method')}</Text>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'cod' && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod('cod')}
              >
                <View style={styles.paymentOptionContent}>
                  <View style={styles.radioButton}>
                    {paymentMethod === 'cod' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.paymentOptionText}>{t('cash_on_delivery')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'stripe' && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod('stripe')}
              >
                <View style={styles.paymentOptionContent}>
                  <View style={styles.radioButton}>
                    {paymentMethod === 'stripe' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.paymentOptionText}>{t('credit_debit_card')}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Stripe Card Input */}
            {paymentMethod === 'stripe' && (
              <View style={styles.cardSection}>
                <CardField
                  postalCodeEnabled={true}
                  placeholders={{
                    number: '4242 4242 4242 4242',
                    expiry: 'MM/YY',
                    cvc: 'CVC',
                  }}
                  cardStyle={styles.cardField}
                  style={styles.cardFieldContainer}
                  onCardChange={(cardDetails) => setCardDetails(cardDetails)}
                />

                <TouchableOpacity
                  style={styles.saveCardOption}
                  onPress={() => setSaveCard(!saveCard)}
                >
                  <View style={styles.checkbox}>
                    {saveCard && <Text style={styles.checkboxText}>✓</Text>}
                  </View>
                  <Text style={styles.saveCardText}>{t('save_card_for_future_bookings')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? t('processing') : t('submit_booking')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default BookingModal;
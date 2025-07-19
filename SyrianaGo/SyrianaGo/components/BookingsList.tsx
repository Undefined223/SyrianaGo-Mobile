import { useLanguage } from '@/app/context/LanguageContext';
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';

const BookingsList = ({ bookings, loading, error,  }) => {
  const {t} = useLanguage();
  if (loading) {
    return <Text>{t('loading_bookings')}</Text>;
  }

  if (error) {
    console.error('Bookings error:', error);
    return <Text>{t('error_fetching_bookings')}</Text>;
  }

  if (bookings.length === 0) {
    return <Text>{t('no_bookings_available')}</Text>;
  }

  return bookings.map((booking) => (
    <View key={booking._id} style={styles.bookingCard}>
      <Image source={{ uri: booking.listingId.images[0] }} style={styles.bookingImage} />
      <Text style={styles.bookingName}>{booking.listingId.name.en}</Text>
      <Text style={styles.bookingDates}>{booking.details.startDate} - {booking.details.endDate}</Text>
      <Text style={styles.bookingGuests}>{t('guests')}: {booking.details.guests}</Text>
      <Text style={styles.bookingStatus}>{t('status')}: {booking.status}</Text>
      <TouchableOpacity
        style={styles.bookingActionButton}
        onPress={() => Linking.openURL(booking.listingId.cta.url)}
      >
        <Text style={styles.bookingActionText}>{t('rebook')}</Text>
      </TouchableOpacity>
    </View>
  ));
};

const styles = StyleSheet.create({
  bookingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 15,
  },
  bookingImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  bookingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  bookingDates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bookingGuests: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bookingStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#017b3e',
    marginBottom: 10,
  },
  bookingActionButton: {
    backgroundColor: '#017b3e',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookingActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BookingsList;

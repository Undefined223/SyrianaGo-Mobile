import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Image, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';

const sliderImages = [
  require('@/assets/images/slider1.webp'),
  require('@/assets/images/slider2.jpg'),
  require('@/assets/images/slider3.webp'),
];

const slideData = [
  {
    title: "Discover Syria's Beauty",
    subtitle: "Ancient wonders await",
  },
  {
    title: 'Explore Ancient History',
    subtitle: "5000 years of civilization",
  },
  {
    title: 'Experience Syrian Hospitality',
    subtitle: "Warmth that touches hearts",
  },
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Swiper
        autoplay
        autoplayTimeout={4}
        height={240}
        showsPagination={false}
        onIndexChanged={(index) => setCurrentIndex(index)}
        loop
      >
        {sliderImages.map((img, idx) => (
          <View key={idx} style={styles.slide}>
            <Image source={img} style={styles.image} resizeMode="cover" />
            <View style={styles.overlay}>
              <View style={styles.contentContainer}>
                <Text style={styles.title}>{slideData[idx].title}</Text>
                <Text style={styles.subtitle}>{slideData[idx].subtitle}</Text>
              </View>
            </View>
          </View>
        ))}
      </Swiper>
      
      {/* Custom Pagination */}
      <View style={styles.paginationContainer}>
        {sliderImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.activePaginationDot
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  slide: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: Dimensions.get('window').width - 48,
    height: 240,
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#e8f5e8',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.9,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activePaginationDot: {
    backgroundColor: '#ffffff',
    width: 20,
  },
});
import React, { useState } from 'react';
import { View, FlatList, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '@/styles/ImageGallery.styles';

const { width } = Dimensions.get('window');

interface ImageGalleryProps {
  images: string[];
  API_URL: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, API_URL }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <View style={styles.imageGalleryContainer}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(img, idx) => img + idx}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentImageIndex(index);
        }}
        renderItem={({ item }) => (
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

      <View style={styles.imageIndicators}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentImageIndex === index && styles.indicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default ImageGallery;

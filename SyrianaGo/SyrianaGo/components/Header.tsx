import React from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Props = {
  category: any;
  listingCount: number;
  title?: string;
  subtitle?: string;
};

export default function Header({ category, listingCount, title, subtitle }: Props) {
  const getImageUri = (imagePath: string) => `${API_URL}/uploads/${imagePath}`;

  return (
    <Animated.View style={styles.header}>
      <LinearGradient colors={['#017b3e', '#2E7D32', '#4CAF50']} style={styles.gradient}>
        <BlurView intensity={20} style={styles.blur}>
          {category?.icon && (
            <View style={styles.iconContainer}>
              <Image
                source={{ uri: getImageUri(category.icon) }}
                style={styles.icon}
                resizeMode="cover"
              />
              <View style={styles.iconGlow} />
            </View>
          )}
          <Text style={styles.title}>{title || category?.name?.en || category?.name || 'Category'}</Text>
          <Text style={styles.subtitle}>{subtitle || `${listingCount} amazing listings`}</Text>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 200,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  blur: {
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
  icon: {
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
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
});

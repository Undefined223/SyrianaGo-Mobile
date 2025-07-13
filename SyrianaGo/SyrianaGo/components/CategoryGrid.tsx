import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

interface Category {
  _id: string;
  name: string;
  icon?: string;
  route: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const router = useRouter();

  const handlePress = (category: Category) => {
    let finalRoute = '';

    if (category.route.includes('[id]')) {
      finalRoute = category.route.replace('[id]', category._id || '');
    } else if (category._id) {
      finalRoute = `/category/${category._id}`;
    } else {
      finalRoute = category.route;
    }

    router.push(finalRoute);
  };

  return (
    <View style={styles.grid}>
      {categories.map((cat, index) => (
        <View key={`${cat._id}-${index}`} style={styles.itemContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handlePress(cat)}
            style={styles.touchable}
          >
            <View style={styles.item}>
              <View style={styles.iconContainer}>
                {cat.icon ? (
                  <Image
                    source={{ uri: `${API_URL}/uploads/${cat.icon}` }}
                    style={styles.iconImage}
                    resizeMode="cover"
                  />
                ) : (
                  <FontAwesome5 name="hotel" size={24} color="#017b3e" />
                )}
              </View>
              <Text style={styles.label}>{cat.name}</Text>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: '48%',
    marginBottom: 16,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  label: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
    textAlign: 'center',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './SubCategoryFilter.styles';

export default function SubcategoryFilter({ subcategories, selectedSubcategory, onSelect }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✨ Filter by Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => onSelect(null)}>
          <LinearGradient
            colors={!selectedSubcategory ? ['#017b3e', '#4CAF50'] : ['#f8f9fa', '#e9ecef']}
            style={styles.chip}
          >
            <Text style={!selectedSubcategory ? styles.chipTextActive : styles.chipText}>🌟 All</Text>
          </LinearGradient>
        </TouchableOpacity>

        {subcategories.map((sub: any) => (
          <TouchableOpacity key={sub._id} onPress={() => onSelect(sub._id)}>
            <LinearGradient
              colors={selectedSubcategory === sub._id ? ['#017b3e', '#4CAF50'] : ['#f8f9fa', '#e9ecef']}
              style={styles.chip}
            >
              <Text style={selectedSubcategory === sub._id ? styles.chipTextActive : styles.chipText}>
                {sub.name?.en || sub.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

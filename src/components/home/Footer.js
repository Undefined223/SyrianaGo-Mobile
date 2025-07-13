import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Footer() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>© 2025 SyrianTrip.com | All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', borderTopWidth: 1, borderColor: '#ccc' },
  text: { color: '#888', fontSize: 12 },
});

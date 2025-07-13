import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function HeaderBanner() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/syrian-flag.jpg')} style={styles.flag} />
      <Text style={styles.title}>SyrianTrip</Text>
      <Text style={styles.slogan}>رحلتك السوريّة تبدأ من هنا</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 12 },
  flag: { width: '100%', height: 80, resizeMode: 'cover', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#337914' },
  slogan: { fontSize: 16, fontStyle: 'italic', color: '#000' },
});

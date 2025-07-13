import React from 'react';
import { View, ImageBackground, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HeroSection() {
  return (
    <ImageBackground
      source={require('../../assets/umayyad.jpg')}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.text}>Discover Syria's Beauty & Culture</Text>
        <TouchableOpacity style={styles.videoBtn}>
          <Ionicons name="play-circle-outline" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { height: 250, justifyContent: 'center', alignItems: 'center' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.4)', flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  text: { fontSize: 20, color: 'white', textAlign: 'center', paddingHorizontal: 20 },
  videoBtn: { marginTop: 10 }
});

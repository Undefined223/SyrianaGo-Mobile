import React, { useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LanguageContext } from '../app/context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const flags = [
    { code: 'en', emoji: '🇬🇧', label: 'English' },
    { code: 'ar', emoji: '🇸🇦', label: 'Arabic' },
    { code: 'fr', emoji: '🇫🇷', label: 'French' },
  ];
  const scaleAnim = useRef(flags.map(() => new Animated.Value(1))).current;

  const switchLanguage = (lang: string, idx: number) => {
    Animated.sequence([
      Animated.spring(scaleAnim[idx], {
        toValue: 1.12,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim[idx], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => setLanguage(lang));
  };

  return (
    <View style={styles.switcherCard}>
      <Text style={styles.title}>🌐 Choose Language</Text>
      <View style={styles.pillRow}>
        {flags.map((flag, idx) => (
          <Animated.View
            key={flag.code}
            style={{
              transform: [{ scale: scaleAnim[idx] }],
              marginHorizontal: 6,
            }}
          >
            <TouchableOpacity
              style={[styles.pillButton, language === flag.code && styles.pillButtonActive]}
              activeOpacity={0.85}
              onPress={() => switchLanguage(flag.code, idx)}
            >
              <LinearGradient
                colors={language === flag.code ? ["#FFD700", "#FFFACD"] : ["#e0e0e0", "#f8fffe"]}
                style={[styles.pillGradient, language === flag.code && styles.pillGradientActive]}
              >
                <Text style={[styles.flagEmoji, language === flag.code && styles.flagEmojiActive]}>{flag.emoji}</Text>
                <Text style={[styles.flagLabel, language === flag.code && styles.flagLabelActive]}>{flag.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      <Text style={styles.currentLang}>Current: <Text style={{fontWeight:'bold'}}>{flags.find(f=>f.code===language)?.label}</Text></Text>
    </View>
  );
};

const styles = StyleSheet.create({
  switcherCard: {
    padding: 8,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 220,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#017b3e',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  pillButtonActive: {
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  pillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 50,
    minWidth: 70,
    justifyContent: 'center',
  },
  pillGradientActive: {
    borderWidth: 0,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  flagEmoji: {
    fontSize: 22,
    marginRight: 8,
    opacity: 0.9,
  },
  flagEmojiActive: {
    opacity: 1,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  flagLabel: {
    fontSize: 13,
    color: '#017b3e',
    opacity: 0.8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  flagLabelActive: {
    opacity: 1,
    color: '#FFD700',
    fontWeight: '700',
  },
  currentLang: {
    fontSize: 12,
    color: '#017b3e',
    marginTop: 6,
    letterSpacing: 0.3,
  },
});

export default LanguageSwitcher;
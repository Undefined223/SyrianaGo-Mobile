import React from 'react';
import { StyleSheet, View, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import HeroSlider from '@/components/HeroSlider';
import CategoryGrid from '@/components/CategoryGrid';
import { useCategories } from '@/hooks/useCategories';

export default function HomeScreen() {
  const { t } = useLanguage();
  const { categories, loading, error } = useCategories();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#017b3e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.welcomeText}>{t('welcome_to_syria')}</ThemedText>
            <HelloWave />
          </View>
          <ThemedText style={styles.subtitleText}>
            {t('discover_ancient_wonders')}
          </ThemedText>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Slider */}
        <View style={styles.heroSection}>
          <HeroSlider />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>{t('explore_categories')}</ThemedText>
              <ThemedText style={styles.sectionDescription}>
                {t('find_everything')}
              </ThemedText>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#017b3e" style={{ marginVertical: 32 }} />
            ) : error ? (
              <ThemedText style={{ color: 'red', textAlign: 'center', marginVertical: 32 }}>{error}</ThemedText>
            ) : (
              <CategoryGrid categories={categories} />
            )}
          </View>

          {/* Featured Stats */}
          <View style={styles.section}>
            <View style={styles.statsCard}>
              <ThemedText style={styles.statsTitle}>{t('syria_at_a_glance')}</ThemedText>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>5000+</ThemedText>
                  <ThemedText style={styles.statLabel}>{t('years_of_history')}</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>6</ThemedText>
                  <ThemedText style={styles.statLabel}>{t('unesco_sites')}</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>1000+</ThemedText>
                  <ThemedText style={styles.statLabel}>{t('destinations')}</ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerTitle}>{t('syria_tourism_guide')}</ThemedText>
            <ThemedText style={styles.footerText}>
              {t('gateway_to_exploring')}
            </ThemedText>
            <View style={styles.footerLinks}>
              <ThemedText style={styles.footerLink}>{t('about')}</ThemedText>
              <ThemedText style={styles.footerDot}>•</ThemedText>
              <ThemedText style={styles.footerLink}>{t('terms')}</ThemedText>
              <ThemedText style={styles.footerDot}>•</ThemedText>
              <ThemedText style={styles.footerLink}>{t('contact')}</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#017b3e',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#e8f5e8',
    textAlign: 'center',
    fontWeight: '400',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
  },
  section: {
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#017b3e',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#017b3e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 14,
    color: '#017b3e',
    fontWeight: '500',
  },
  footerDot: {
    fontSize: 14,
    color: '#d1d5db',
  },
});
import React, { useContext } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useLanguage } from '@/app/context/LanguageContext';

import styles from '@/styles/TabNavigation.styles';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage()
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'details' && styles.tabButtonActive]}
        onPress={() => setActiveTab('details')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabButtonText, activeTab === 'details' && styles.tabButtonTextActive]}>
          {t('details')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'reviews' && styles.tabButtonActive]}
        onPress={() => setActiveTab('reviews')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabButtonText, activeTab === 'reviews' && styles.tabButtonTextActive]}>
          {t('reviews')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TabNavigation;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLanguage } from '@/app/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const SettingsContent = ({ onToggle2FA, onLogout }) => {
  const { t } = useLanguage();

  return (
    <View style={styles.settingsCard}>
      <LanguageSwitcher />
      <Text style={styles.settingsGroupTitle}>{t('security')}</Text>
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{t('two_factor_authentication')}</Text>
          <Text style={styles.settingDescription}>{t('enhance_account_security')}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingArrow}
          onPress={onToggle2FA}
        >
          <Text style={styles.settingArrow}>🔒</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{t('logout')}</Text>
          <Text style={styles.settingDescription}>{t('sign_out_of_account')}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingArrow}
          onPress={onLogout}
        >
          <Text style={styles.settingArrow}>🚪</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#017b3e',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingArrow: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 10,
  },
});

export default SettingsContent;

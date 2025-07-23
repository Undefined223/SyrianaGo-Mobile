import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import SettingsContent from './SettingsContent';
import { useLanguage } from '@/app/context/LanguageContext';

const SettingsTab = ({ form, setForm, success, error, loading, onSubmit, onToggle2FA, onLogout }) => {

  const {t} = useLanguage();
  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{t('settings')}</Text>

      {/* Settings Form */}
      <View style={styles.settingsForm}>
        {/* Name */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t('name')}</Text>
          <TextInput
            style={styles.formInput}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder={t('enter_your_name')}
          />
        </View>

        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t('email')}</Text>
          <TextInput
            style={styles.formInput}
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            placeholder={t('enter_your_email')}
            keyboardType="email-address"
          />
        </View>

        {/* Old Password */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t('old_password')}</Text>
          <TextInput
            style={styles.formInput}
            value={form.oldPassword}
            onChangeText={(text) => setForm({ ...form, oldPassword: text })}
            placeholder={t('enter_your_old_password')}
            secureTextEntry
          />
        </View>

        {/* New Password */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t('new_password')}</Text>
          <TextInput
            style={styles.formInput}
            value={form.newPassword}
            onChangeText={(text) => setForm({ ...form, newPassword: text })}
            placeholder={t('enter_your_new_password')}
            secureTextEntry
          />
        </View>

        {/* Confirm New Password */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t('confirm_new_password')}</Text>
          <TextInput
            style={styles.formInput}
            value={form.confirmNewPassword}
            onChangeText={(text) => setForm({ ...form, confirmNewPassword: text })}
            placeholder={t('confirm_your_new_password')}
            secureTextEntry
          />
        </View>

        {/* Success/Error Messages */}
        {success && <Text style={styles.successMessage}>{success}</Text>}
        {error && <Text style={styles.errorMessage}>{error}</Text>}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>{loading ? t('saving') : t('save')}</Text>
        </TouchableOpacity>
      </View>

      {/* 2FA Settings */}
      <SettingsContent onToggle2FA={onToggle2FA} onLogout={onLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#017b3e',
    marginBottom: 15,
  },
  settingsForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  formInput: {
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  successMessage: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#ff6b6b',
    marginTop: 10,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#017b3e',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsTab;

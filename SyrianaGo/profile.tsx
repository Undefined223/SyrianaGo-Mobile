import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  Switch,
  TextInput,
  Linking
} from 'react-native';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { updateUser, toggle2FA, verify2FA } from '@/api/https/auth.https';
import useUserBookings from '@/hooks/useUserBookings';
import BookingsList from '@/components/BookingsList';
import SettingsContent from '@/components/SettingsContent';
import SettingsTab from '@/components/SettingsTab';
import { useLanguage } from '../context/LanguageContext';

export default function Profile() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { t } = useLanguage();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Reset animation values
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.9);

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logout_confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: () => authContext?.logout()
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(t('edit_profile'), t('edit_profile_message'));
  };

  const handleChangePassword = () => {
    Alert.alert(t('change_password'), t('change_password_message'));
  };

  const tabs = [
    { id: 'profile', label: t('profile'), icon: '👤' },
    { id: 'bookings', label: t('bookings'), icon: '📅' },
    { id: 'settings', label: t('settings'), icon: '⚙️' }
  ];

  const [form, setForm] = useState({
    name: authContext?.user?.name || '',
    email: authContext?.user?.email || '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { bookings, loading: loadingBookings, error: bookingsError } = useUserBookings();

  useEffect(() => {
    // Trigger re-render when user data changes
    setForm({
      name: authContext?.user?.name || '',
      email: authContext?.user?.email || '',
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  }, [authContext?.user]);

  useEffect(() => {
    console.log('AuthContext user updated:', authContext?.user);
  }, [authContext?.user]);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess('');
    setError('');

    if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      };
      console.log('Submitting payload:', payload);
      const updatedUser = await updateUser(payload);

      // Update user in AuthContext
      console.log('Updated user:', updatedUser);
      authContext?.setUser?.(updatedUser);

      setSuccess('Profile updated successfully!');
      setForm({
        ...form,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err: unknown) {
      console.error('Update error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Update failed');
      }
      if (
        err instanceof Error &&
        'response' in err &&
        err.response !== null &&
        typeof err.response === 'object' &&
        'status' in err.response &&
        err.response.status === 401
      ) {
        console.log('Error 401: Unauthorized access', err.response);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      const response = await toggle2FA();
      Alert.alert('Success', response.message || '2FA toggled successfully');
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to toggle 2FA');
    }
  };

  const handleVerify2FA = async (code: string) => {
    if (!authContext?.user?.email) {
      Alert.alert('Error', 'Email is required to verify 2FA.');
      return;
    }

    try {
      const response = await verify2FA({ email: authContext.user.email, code });
      Alert.alert('Success', response.message || '2FA verified successfully');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to verify 2FA');
    }
  };

  const renderBookings = () => (
    <BookingsList
      bookings={bookings}
      loading={loadingBookings}
      error={bookingsError}
    />
  );

  const renderSettingsContent = () => (
    <SettingsContent
      onToggle2FA={handleToggle2FA}
      onLogout={handleLogout}
    />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <View style={styles.tabContent}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>

              </View>
              <Text style={styles.userName}>{authContext?.user?.name || 'John Doe'}</Text>
              <Text style={styles.userEmail}>{authContext?.user?.email || 'john.doe@example.com'}</Text>
            </View>

            {/* User Stats */}
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>{t('bookings')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>{t('favorites')}</Text>
              </View>
            </View>

            {/* Account Information */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>{t('account_information')}</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t('full_name')}</Text>
                <Text style={styles.infoValue}>{authContext?.user?.name || t('default_name')}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t('email')}</Text>
                <Text style={styles.infoValue}>{authContext?.user?.email || t('default_email')}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t('member_since')}</Text>
                <Text style={styles.infoValue}>{t('member_since_date', { date: 'January 2024' })}</Text>
              </View>
            </View>


          </View>
        );

      case 'bookings':
        return (
          <ScrollView style={styles.tabContent}>
            {renderBookings()}
          </ScrollView>
        );

      case 'settings':
        return (
          <SettingsTab
            form={form}
            setForm={setForm}
            success={success}
            error={error}
            loading={loading}
            onSubmit={handleSubmit}
            onToggle2FA={handleToggle2FA}
            onLogout={handleLogout}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <LinearGradient
        colors={["#f5f5f5", "#e8f5e9", "#919291ff"]}
        style={styles.backgroundGradient}
      />

      {authContext?.user ? (
        <Animated.View
          style={[
            styles.authenticatedContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          {/* Tab Navigation */}
          <View style={styles.tabNavigation}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  activeTab === tab.id && styles.activeTabButton
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.activeTabLabel
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderTabContent()}
          </ScrollView>
        </Animated.View>
      ) : (
        // Login/Register options for unauthenticated users
        <Animated.View
          style={[
            styles.welcomeContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          <View style={styles.welcomeIcon}>
            <Text style={styles.welcomeEmoji}>👋</Text>
          </View>
          <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
          <Text style={styles.welcomeSubtitle}>{t('sign_in_to_access_profile')}</Text>

          <View style={styles.welcomeButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.primaryButtonText}>{t('sign_in')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.secondaryButtonText}>{t('create_account')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  authenticatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // Tab Navigation
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginTop: 50,
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#017b3e',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeTabLabel: {
    color: '#ffffff',
  },

  // Tab Content
  tabContent: {
    padding: 20,
  },

  // Profile Tab
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#017b3e',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#017b3e',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#017b3e',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  userStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#017b3e',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#017b3e',
    marginBottom: 15,
  },
  infoCard: {
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
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  editProfileButton: {
    backgroundColor: '#017b3e',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  editProfileButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Bookings Tab
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#017b3e',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonActiveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bookingsList: {
    gap: 15,
  },
  bookingCard: {
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
    marginBottom: 15,
  },
  bookingImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  bookingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  bookingDates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bookingGuests: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bookingStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#017b3e',
    marginBottom: 10,
  },
  bookingActionButton: {
    backgroundColor: '#017b3e',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookingActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Settings Tab
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
  settingDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  settingArrow: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Welcome Screen Styles (unchanged)
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeIcon: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeEmoji: {
    fontSize: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#017b3e',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#4e4e4e',
    textAlign: 'center',
    marginBottom: 40,
  },
  welcomeButtons: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    height: 50,
    backgroundColor: '#017b3e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#017b3e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#017b3e',
  },
  secondaryButtonText: {
    color: '#017b3e',
    fontSize: 16,
    fontWeight: 'bold',
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
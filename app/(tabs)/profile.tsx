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
import { useWishlist } from '@/hooks/useWishlist';

export default function Profile() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { t } = useLanguage();
  const { wishlist } = useWishlist();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    // Animate tab indicator
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    Animated.spring(tabIndicatorAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  }, [activeTab]);

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
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {authContext?.user?.name?.charAt(0)?.toUpperCase() || 'J'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.editImageButton}>
                  <Text style={styles.editImageIcon}>📷</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{authContext?.user?.name || 'John Doe'}</Text>
              <Text style={styles.userEmail}>{authContext?.user?.email || 'john.doe@example.com'}</Text>
            </View>

            {/* User Stats */}
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{bookings?.length ?? 0}</Text>
                <Text style={styles.statLabel}>{t('bookings')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{wishlist?.length ?? 0}</Text>
                <Text style={styles.statLabel}>{t('favorites')}</Text>
              </View>
            </View>

            {/* Account Information */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>{t('account_information')}</Text>
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>👤</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('full_name')}</Text>
                  <Text style={styles.infoValue}>{authContext?.user?.name || t('default_name')}</Text>
                </View>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>📧</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('email')}</Text>
                  <Text style={styles.infoValue}>{authContext?.user?.email || t('default_email')}</Text>
                </View>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>📅</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('member_since')}</Text>
                  <Text style={styles.infoValue}>{t('member_since_date', { date: 'January 2024' })}</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton} onPress={() => setActiveTab('settings')}>
                <LinearGradient
                  colors={['#C8102E', '#E53E3E']}
                  style={styles.quickActionGradient}
                >
                  <Text style={styles.quickActionIcon}>✏️</Text>
                  <Text style={styles.quickActionText}>{t('edit_profile_button')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton} onPress={() => setActiveTab('settings')}>
                <LinearGradient
                  colors={['#007B3E', '#38A169']}
                  style={styles.quickActionGradient}
                >
                  <Text style={styles.quickActionIcon}>🔒</Text>
                  <Text style={styles.quickActionText}>{t('security_button')}</Text>
                </LinearGradient>
              </TouchableOpacity>
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
      
      {/* Beautiful Syrian-inspired background */}
      <LinearGradient
        colors={['#f8f9ff', '#ffffff', '#f4f6ff']}
        style={styles.backgroundGradient}
      />
      
      {/* Decorative elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

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
          {/* Enhanced Tab Navigation */}
          <View style={styles.tabNavigationContainer}>
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
                  <Text style={[
                    styles.tabIcon,
                    activeTab === tab.id && styles.activeTabIcon
                  ]}>{tab.icon}</Text>
                  <Text style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.activeTabLabel
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
        // Enhanced Welcome Screen
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
          <LinearGradient
            colors={['rgba(200, 16, 46, 0.1)', 'rgba(0, 123, 62, 0.1)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.welcomeIcon}
          >
            <Text style={styles.welcomeEmoji}>🇸🇾</Text>
          </LinearGradient>
          <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
          <Text style={styles.welcomeSubtitle}>{t('sign_in_to_access_profile')}</Text>

          <View style={styles.welcomeButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#007B3E', '#38A169']}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>{t('sign_in')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
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
    backgroundColor: '#f8f9ff',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(200, 16, 46, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 123, 62, 0.06)',
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

  // Enhanced Tab Navigation
  tabNavigationContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 0,
    alignItems: 'center',
    position: 'relative',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    width: '100%',
    zIndex: 2,
  },
  // Removed tabIndicator styles for static tab navigation
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    zIndex: 1,
  },
  activeTabButton: {
    backgroundColor: '#007B3E',
    borderRadius: 14,
    shadowColor: '#007B3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  activeTabLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Tab Content
  tabContent: {
    padding: 20,
  },

  // Enhanced Profile Tab
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007B3E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007B3E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#C8102E',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C8102E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  editImageIcon: {
    fontSize: 16,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007B3E',
    marginBottom: 6,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    opacity: 0.8,
  },
  userStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007B3E',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e8eaed',
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007B3E',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 62, 0.1)',
  },
  infoIcon: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f0f2f5',
    marginVertical: 8,
    marginLeft: 64,
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 15,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionGradient: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionIcon: {
    fontSize: 18,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Enhanced Welcome Screen
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeEmoji: {
    fontSize: 48,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007B3E',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
  },
  welcomeButtons: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#007B3E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007B3E',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButtonText: {
    color: '#007B3E',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Forms and other elements (keeping existing styles)
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  successMessage: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#C8102E',
    marginTop: 10,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007B3E',
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

  // Additional styles for other components (keeping existing)
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
    backgroundColor: '#007B3E',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 15,
  },
  bookingImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
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
});
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from './context/AuthProvider';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import { useRouter } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import { LanguageProvider } from './context/LanguageContext';
import RTLHandler from './context/RTLHandler';
import LanguageSwitcher from '@/components/LanguageSwitcher';


export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const router = useRouter();
  const authContext = useContext(AuthContext);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      // Async font loading only occurs in development.
      return;
    }
  }, [loaded]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <StripeProvider
        publishableKey={Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY}
      >
        <AuthProvider>
          <LanguageProvider>
            <RTLHandler>
              <LanguageSwitcher />
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />

                <Stack.Screen name="+not-found" />
              </Stack>
            </RTLHandler>

          </LanguageProvider>
          <StatusBar style="auto" />
        </AuthProvider>
      </StripeProvider>

    </ThemeProvider>
  );
}

import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { useEffect, useState } from 'react';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure auth state is properly initialized
    const timer = setTimeout(() => {
      setInitialCheckDone(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while checking authentication state
  if (isLoading || !initialCheckDone) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is authenticated, redirect to main app
  if (user) {
    console.log('User is authenticated, redirecting to tabs:', user);
    return <Redirect href="/(tabs)" />;
  }

  // User is not authenticated, show auth screens
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="login" 
        options={{
          gestureEnabled: false, // Prevent swipe back
        }}
      />
      <Stack.Screen 
        name="otp" 
        options={{
          gestureEnabled: false, // Prevent swipe back
        }}
      />
      <Stack.Screen 
        name="user" 
        options={{
          gestureEnabled: false, // Prevent swipe back
        }}
      />
    </Stack>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: COLORS.white,
  },
  loadingText: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    marginTop: SIZES.padding,
  },
};

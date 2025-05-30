import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Redirect } from 'expo-router';

export default function BookingLayout() {
  const { user } = useAuth();

  // If user is not authenticated, redirect to auth
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="service" />
      <Stack.Screen name="date-time" />
      <Stack.Screen name="location" />
      <Stack.Screen name="confirmation" />
    </Stack>
  );
}

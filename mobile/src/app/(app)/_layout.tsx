import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="student" />
      <Stack.Screen name="head" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}

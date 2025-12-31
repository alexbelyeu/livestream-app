import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function StreamLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="broadcast" />
    </Stack>
  );
}

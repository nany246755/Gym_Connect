import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';

import { useColorScheme } from 'react-native';

import {
  GymConnectProviders,
} from '../context/GymConnectProviders';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={
        colorScheme === 'dark'
          ? DarkTheme
          : DefaultTheme
      }
    >
      <GymConnectProviders>
        <Stack screenOptions={{ headerShown: false }} />
      </GymConnectProviders>
    </ThemeProvider>
  );
}
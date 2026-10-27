import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';

// Our hook: stays 'light' until the web page has loaded, so the server and browser match.
import { useColorScheme } from '@/hooks/use-color-scheme';

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
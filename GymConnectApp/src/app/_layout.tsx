<<<<<<< Updated upstream
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';

import { BranchProvider } from '@/context/BranchContext';
import { RestTimerProvider } from '@/context/RestTimerContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { applyAppearance } from '@/logic/appearance';
import { loadAppearance } from '@/services/appearance-storage';
=======
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';

import { useColorScheme } from 'react-native';
>>>>>>> Stashed changes

import {
  GymConnectProviders,
} from '../context/GymConnectProviders';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Preserve the Light/Dark choice saved by the Profile screen.
  useEffect(() => {
    loadAppearance().then(applyAppearance).catch(() => {});
  }, []);

  return (
<<<<<<< Updated upstream
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RestTimerProvider>
        <BranchProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </BranchProvider>
      </RestTimerProvider>
=======
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
>>>>>>> Stashed changes
    </ThemeProvider>
  );
}
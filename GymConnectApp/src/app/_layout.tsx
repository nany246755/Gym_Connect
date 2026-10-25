
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';

import { useColorScheme } from 'react-native';
import { BranchProvider } from '@/context/BranchContext';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { applyAppearance } from '@/logic/appearance';
import { loadAppearance } from '@/services/appearance-storage';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Re-apply the Light/Dark choice saved from the Profile screen.
  useEffect(() => {
    loadAppearance().then(applyAppearance).catch(() => {});
  }, []);

  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <BranchProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BranchProvider>
    </ThemeProvider>
  );
}

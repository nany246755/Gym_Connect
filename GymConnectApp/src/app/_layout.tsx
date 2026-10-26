import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';

import { BranchProvider } from '@/context/BranchContext';
import { RestTimerProvider } from '@/context/RestTimerContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { applyAppearance } from '@/logic/appearance';
import { loadAppearance } from '@/services/appearance-storage';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Preserve the Light/Dark choice saved by the Profile screen.
  useEffect(() => {
    loadAppearance().then(applyAppearance).catch(() => {});
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RestTimerProvider>
        <BranchProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </BranchProvider>
      </RestTimerProvider>
    </ThemeProvider>
  );
}


import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';

import { useColorScheme } from 'react-native';
import { BranchProvider } from '@/context/BranchContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

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

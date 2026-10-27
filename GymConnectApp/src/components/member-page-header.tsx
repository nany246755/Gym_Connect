import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { memberHeaderStyles } from '@/components/member-header-styles';

export function MemberPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[memberHeaderStyles.hero, {
      backgroundColor: theme.hero,
      paddingTop: insets.top + Spacing.three
    }]}>
      <StatusBar style="light" />
      <View style={memberHeaderStyles.inner}>
        <ThemedText type="smallBold" style={[memberHeaderStyles.brand, {
          color: theme.accent
        }]}>GYM CONNECT</ThemedText>
        <ThemedText type="subtitle" style={[styles.title, {
          color: theme.heroText
        }]}>{title}</ThemedText>
        <ThemedText type="small" style={[styles.description, {
          color: theme.heroSubtext
        }]}>{subtitle}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    alignSelf: 'flex-start',
    fontSize: 26,
    lineHeight: 34
  },
  description: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
    fontSize: 13,
    lineHeight: 19
  },
});

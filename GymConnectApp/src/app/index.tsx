
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/member/branch" />;
}
import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons, type IconName } from '@/constants/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// shortcut: temporary dev launcher so each team member can open their own screens while the app has
// no shared navigation yet. Replace this file with the real Home / tab shell once the team builds it.
// To add your screen: put one line in SCREENS below.
const SCREENS: { title: string; route: Href; owner: string; icon: IconName }[] = [
  { title: 'Rest Timer', route: '/member/timer', owner: 'Member 3 · Andro', icon: Icons.clock },
  { title: 'My Profile', route: '/member/profile', owner: 'Member 3 · Andro', icon: Icons.profile },
  { title: 'Admin · Equipment', route: '/admin', owner: 'Member 3 · Andro', icon: Icons.equipment },
];

export default function DevLauncherScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.five }}>
        <View style={[styles.hero, { backgroundColor: theme.hero, paddingTop: insets.top + Spacing.four }]}>
          <View style={styles.inner}>
            <ThemedText type="smallBold" style={[styles.brand, { color: theme.accent }]}>
              GYM CONNECT
            </ThemedText>
            <ThemedText type="subtitle" style={{ color: theme.heroText }}>
              Screens
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.heroSubtext }}>
              Temporary launcher until the app has its real navigation
            </ThemedText>
          </View>
        </View>

        <View style={[styles.inner, styles.list]}>
          {SCREENS.map((s) => (
            <Pressable
              key={s.title}
              accessibilityRole="button"
              accessibilityLabel={`Open ${s.title}`}
              onPress={() => router.push(s.route)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
              ]}>
              <View style={[styles.icon, { backgroundColor: theme.accentSoft }]}>
                <SymbolView name={s.icon} size={22} tintColor={theme.accent} />
              </View>
              <View style={styles.flex}>
                <ThemedText type="smallBold" style={styles.title}>
                  {s.title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {s.owner}
                </ThemedText>
              </View>
              <SymbolView name={Icons.next} size={16} tintColor={theme.textSecondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  inner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.three },
  hero: {
    paddingBottom: Spacing.five,
    borderBottomLeftRadius: Spacing.five,
    borderBottomRightRadius: Spacing.five,
  },
  brand: { letterSpacing: 3, marginBottom: Spacing.two },
  list: { gap: Spacing.three, marginTop: Spacing.four },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 72,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  icon: { width: 44, height: 44, borderRadius: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17 },
});

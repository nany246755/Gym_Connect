
import type { ComponentProps } from 'react';

import {
  router,
  type Href,
} from 'expo-router';

import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Colors,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';

import { useTheme } from '@/hooks/use-theme';

// Icon type supported by Ionicons
type IconName = ComponentProps<typeof Ionicons>['name'];

// Temporary development launcher.
// Allows teammates to test their screens independently
// until the final Member Dashboard is completed.

type ScreenItem = {
  title: string;
  route: string;
  owner: string;
  icon: IconName;
};

const SCREENS: ScreenItem[] = [
  {
    title: 'Branch Selection & Check In',
    route: '/member/branch',
    owner: 'Branch Selection',
    icon: 'business-outline',
  },
  {
    title: 'Rest Timer',
    route: '/member/timer',
    owner: 'Member 3 - Andro',
    icon: 'timer-outline',
  },
  {
    title: 'My Profile',
    route: '/member/profile',
    owner: 'Member 3 - Andro',
    icon: 'person-circle-outline',
  },
  {
    title: 'Admin - Equipment',
    route: '/admin',
    owner: 'Member 3 - Andro',
    icon: 'construct-outline',
  },
];

export default function DevLauncherScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const isDark =
    colors.background === Colors.dark.background;

  const handleNavigation = (route: string) => {
    router.push(route as Href);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.five,
        }}
      >
        {/* Header */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.navy,
              paddingTop: insets.top + Spacing.four,
            },
          ]}
        >
          <View style={styles.inner}>
            <Text
              style={[
                styles.brand,
                { color: colors.marigold },
              ]}
            >
              GYM CONNECT
            </Text>

            <Text style={styles.heroTitle}>
              Screens
            </Text>

            <Text style={styles.heroSubtitle}>
              Temporary development launcher for the
              Gym Connect team
            </Text>
          </View>
        </View>

        {/* Screen List */}
        <View style={[styles.inner, styles.list]}>
          {SCREENS.map((screen) => (
            <Pressable
              key={screen.route}
              accessibilityRole="button"
              accessibilityLabel={`Open ${screen.title}`}
              onPress={() =>
                handleNavigation(screen.route)
              }
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor:
                    colors.backgroundElement,

                  borderColor:
                    colors.backgroundSelected,

                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              {/* Screen Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      colors.backgroundSelected,
                  },
                ]}
              >
                <Ionicons
                  name={screen.icon}
                  size={23}
                  color={colors.marigold}
                />
              </View>

              {/* Screen Information */}
              <View style={styles.screenInfo}>
                <Text
                  style={[
                    styles.screenTitle,
                    { color: colors.text },
                  ]}
                >
                  {screen.title}
                </Text>

                <Text
                  style={[
                    styles.screenOwner,
                    { color: colors.textSecondary },
                  ]}
                >
                  {screen.owner}
                </Text>
              </View>

              {/* Navigation Arrow */}
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  hero: {
    paddingBottom: Spacing.five,
    borderBottomLeftRadius: Spacing.five,
    borderBottomRightRadius: Spacing.five,
  },

  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },

  brand: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: Spacing.two,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.two,
  },

  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#C9D1DD',
  },

  list: {
    gap: Spacing.three,
    marginTop: Spacing.four,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 76,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: 16,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  screenInfo: {
    flex: 1,
    gap: 5,
  },

  screenTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  screenOwner: {
    fontSize: 12,
  },
});

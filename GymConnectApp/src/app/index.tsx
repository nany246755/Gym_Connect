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

// ==========================================
// TYPES
// ==========================================

type IconName = ComponentProps<typeof Ionicons>['name'];

type ScreenItem = {
  title: string;
  route: Href;
  owner: string;
  icon: IconName;
};

// ==========================================
// DEVELOPMENT SCREENS
// ==========================================

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

  // ======================================
  // YOUR SCREENS — FR05 TO FR08
  // ======================================

  {
    title: 'Spotting Requests',
    route: '/member/spotting',
    owner: 'FR05 & FR06 - Spotting Requests',
    icon: 'shield-checkmark-outline',
  },
  {
    title: 'Workout Partners',
    route: '/member/partners',
    owner: 'FR07 - Find Workout Partners',
    icon: 'people-outline',
  },
  {
    title: 'Messages',
    route: '/member/messages',
    owner: 'FR08 - Conversations & Chat',
    icon: 'chatbubbles-outline',
  },
];

// ==========================================
// DEVELOPMENT LAUNCHER
// ==========================================

export default function DevLauncherScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const isDark =
    colors.background === Colors.dark.background;

  const cardBackground = isDark
    ? '#1C2A42'
    : '#FFFFFF';

  const cardBorder = isDark
    ? '#34435B'
    : '#E7EAF0';

  const primaryText = isDark
    ? '#FFFFFF'
    : '#14213D';

  const secondaryText = isDark
    ? '#B8C3D4'
    : '#718096';

  const iconBackground = isDark
    ? '#283852'
    : '#F0F2F6';

  function handleNavigation(route: Href) {
    router.push(route);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar
        style={isDark ? 'light' : 'dark'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.five,
        }}
      >
        {/* ==================================
            HEADER
        ================================== */}

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
                {
                  color: colors.marigold,
                },
              ]}
            >
              GYM CONNECT
            </Text>

            <Text style={styles.heroTitle}>
              Screens
            </Text>

            <Text style={styles.heroSubtitle}>
              Temporary development launcher for the Gym Connect team
            </Text>
          </View>
        </View>

        {/* ==================================
            SCREEN CARDS
        ================================== */}

        <View style={styles.inner}>
          <View style={styles.list}>
            {SCREENS.map(screen => (
              <Pressable
                key={screen.title}
                accessibilityRole="button"
                accessibilityLabel={`Open ${screen.title}`}
                onPress={() =>
                  handleNavigation(screen.route)
                }
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: cardBackground,
                    borderColor: cardBorder,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: iconBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name={screen.icon}
                    size={25}
                    color={colors.marigold}
                  />
                </View>

                {/* Screen information */}
                <View style={styles.screenInfo}>
                  <Text
                    style={[
                      styles.screenTitle,
                      {
                        color: primaryText,
                      },
                    ]}
                  >
                    {screen.title}
                  </Text>

                  <Text
                    style={[
                      styles.screenOwner,
                      {
                        color: secondaryText,
                      },
                    ]}
                  >
                    {screen.owner}
                  </Text>
                </View>

                {/* Arrow */}
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={secondaryText}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  hero: {
    paddingBottom: Spacing.five,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
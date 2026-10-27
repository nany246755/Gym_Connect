import { router, usePathname, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Icons, type IconName } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type MemberTab = 'home' | 'equipment' | 'spotter' | 'partners' | 'profile';

// Spotter has no symbol: it draws its own SpotterIcon. `path` is the screen each tab shows.
const TABS: { key: MemberTab; label: string; path: string; icon?: IconName }[] = [
  { key: 'home', label: 'Home', path: '/member/dashboard', icon: Icons.home },
  { key: 'equipment', label: 'Equipment', path: '/member/equipment', icon: Icons.equipment },
  { key: 'spotter', label: 'Spotter', path: '/member/spotting' },
  { key: 'partners', label: 'Partners', path: '/member/partners', icon: Icons.partners },
  { key: 'profile', label: 'Profile', path: '/member/profile', icon: Icons.profile },
];

// Shape of the bar: the active tab's circle floats DROP px above the bar's top edge, and the
// bar dips around its bottom with a GAP px ring of space.
const CIRCLE = 62;
const GAP = 6;
const DROP = 14;
const TOP = 32; // bar top edge, measured from the top of this component
const BAR = 64; // bar height above the safe area
const CORNER = 22;
const SLIDE = { duration: 320, easing: Easing.out(Easing.cubic) };

// Bar outline with a smooth notch under the circle at x = cx. Near a screen edge the notch
// eats into the rounded corner, so the corner shrinks to fit. Runs on the UI thread while the
// notch slides.
function barPath(w: number, h: number, cx: number): string {
  'worklet';
  const r = CIRCLE / 2 + GAP;
  const edge = Math.sqrt(r * r - DROP * DROP); // where the notch meets the top edge
  const lip = 5; // how far down the notch the rounded shoulder ends
  const lipX = Math.sqrt(r * r - (DROP + lip) * (DROP + lip));
  const start = cx - edge - 10;
  const end = cx + edge + 10;
  const left = Math.min(CORNER, Math.max(0, start));
  const right = Math.min(CORNER, Math.max(0, w - end));
  return [
    `M0 ${TOP + left}`,
    `Q0 ${TOP} ${left} ${TOP}`,
    `H${Math.max(start, left)}`,
    `Q${cx - edge} ${TOP} ${cx - lipX} ${TOP + lip}`,
    `A${r} ${r} 0 0 0 ${cx + lipX} ${TOP + lip}`,
    `Q${cx + edge} ${TOP} ${Math.min(end, w - right)} ${TOP}`,
    `H${w - right}`,
    `Q${w} ${TOP} ${w} ${TOP + right}`,
    `V${h}`,
    'H0',
    'Z',
  ].join(' ');
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Shield with a plus, held in two open hands.
function SpotterIcon({ color, accent, size }: { color: string; accent: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d="M16 2.5l6 2.2v4.8c0 3.8-2.5 6.6-6 7.9-3.5-1.3-6-4.1-6-7.9V4.7z" fill={color} />
      <Path d="M16 6.4v6M13 9.4h6" stroke={accent} strokeWidth={2} strokeLinecap="round" />
      <Path
        d="M3.2 14.8v6.6c0 1.7.9 3.2 2.4 4l5.8 3.3c1.3.7 2.9-.2 2.9-1.7v-3.3c0-.9-.5-1.7-1.3-2.1l-3.2-1.6M7.4 17.6l2.9 3.4M28.8 14.8v6.6c0 1.7-.9 3.2-2.4 4l-5.8 3.3c-1.3.7-2.9-.2-2.9-1.7v-3.3c0-.9.5-1.7 1.3-2.1l3.2-1.6M24.6 17.6l-2.9 3.4"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Where each tab goes. Home goes back to the dashboard instead of stacking a new one.
// Equipment is cast because its screen (src/app/member/equipment/index.tsx) is still being merged.
const OPEN: Record<MemberTab, () => void> = {
  home: () => router.dismissTo('/member/dashboard'),
  equipment: () => router.push('/member/equipment' as Href),
  spotter: () => router.push('/member/spotting'),
  partners: () => router.push('/member/partners'),
  profile: () => router.push('/member/profile'),
};

// Lets a screen hide the bar for a while (Profile's Save bar takes its place).
const HideContext = createContext<(hidden: boolean) => void>(() => {});

export function useHideMemberTabBar(hidden: boolean) {
  const setHidden = useContext(HideContext);
  useEffect(() => {
    setHidden(hidden);
    return () => setHidden(false);
  }, [hidden, setHidden]);
}

// Wraps the member screens and draws one shared bar over the tab screens, so the bar stays put
// (and its circle slides) while the screens change underneath it.
export function MemberTabLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const active = TABS.find((t) => t.path === pathname)?.key;
  return (
    <HideContext.Provider value={setHidden}>
      <View style={styles.flex}>
        {children}
        {active && !hidden && <MemberTabBar active={active} />}
      </View>
    </HideContext.Provider>
  );
}

// Member bottom navigation: the active tab's icon floats in the marigold circle, and the circle
// and the bar's notch slide together to a newly picked tab.
function MemberTabBar({ active }: { active: MemberTab }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const height = TOP + BAR + insets.bottom;
  const index = Math.max(0, TABS.findIndex((t) => t.key === active));
  const current = TABS[index];

  // Centre of the circle. Jumps on first layout, slides on every tab change after that.
  const cx = useSharedValue(0);
  const laidOutWidth = useRef(0);
  useEffect(() => {
    if (!width) return;
    const target = (index + 0.5) * (width / TABS.length);
    if (laidOutWidth.current !== width || reduceMotion) {
      laidOutWidth.current = width;
      cx.value = target;
    } else {
      cx.value = withTiming(target, SLIDE);
    }
  }, [index, width, reduceMotion, cx]);

  const notch = useAnimatedProps(() => ({ d: barPath(width, height, cx.value) }));
  const circle = useAnimatedStyle(() => ({ transform: [{ translateX: cx.value - CIRCLE / 2 }] }));

  const icon = (t: (typeof TABS)[number], color: string, accent: string, size: number) =>
    t.icon ? (
      <SymbolView name={t.icon} size={size} tintColor={color} />
    ) : (
      <SpotterIcon color={color} accent={accent} size={size + 4} />
    );

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="tablist">
      {width > 0 && (
        <>
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <AnimatedPath animatedProps={notch} fill={theme.navy} />
          </Svg>
          <Animated.View style={[styles.circle, { backgroundColor: theme.marigold, shadowColor: theme.navy }, circle]}>
            {icon(current, theme.navy, theme.marigold, 28)}
          </Animated.View>
        </>
      )}
      <View style={[styles.row, { top: TOP, paddingBottom: insets.bottom }]}>
        {TABS.map((t) => {
          const on = t.key === active;
          return (
            <Pressable
              key={t.key}
              style={styles.tab}
              onPress={on ? undefined : OPEN[t.key]}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t.label}>
              {/* The active tab's icon is drawn in the floating circle instead; the one it
                  leaves fades back in as the circle slides away. */}
              <View style={styles.iconSlot}>
                {!on && (
                  <Animated.View entering={FadeIn.duration(220)}>
                    {icon(t, theme.heroSubtext, theme.navy, 24)}
                  </Animated.View>
                )}
              </View>
              <ThemedText
                type={on ? 'smallBold' : 'small'}
                style={[styles.label, { color: on ? theme.marigold : theme.heroSubtext }]}>
                {t.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Space a scrolling screen leaves at the bottom so its last item clears the bar.
export const MEMBER_TAB_BAR_SPACE = TOP + BAR + Spacing.three;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  circle: {
    position: 'absolute',
    left: 0,
    top: TOP - DROP - CIRCLE / 2,
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 1,
  },
  row: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'flex-end' },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.one, paddingBottom: Spacing.three },
  iconSlot: { height: 28, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, lineHeight: 16 },
});

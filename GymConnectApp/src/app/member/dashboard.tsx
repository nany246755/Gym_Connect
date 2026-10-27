import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { MEMBER_TAB_BAR_SPACE } from '@/components/member-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons, type IconName } from '@/constants/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useMemberDashboard } from '@/logic/use-member-dashboard';
import type { ActivityKind } from '@/types/branch-activity';

// Member Dashboard: greeting, check-in, equipment availability and live branch activity.
export default function MemberDashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data, loading, error } = useMemberDashboard();

  if (loading || !data.branch || !data.counts) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        {error ? <ThemedText themeColor="textSecondary">{error}</ThemedText> : <ActivityIndicator color={theme.accent} />}
      </ThemedView>
    );
  }

  const { branch, counts } = data;
  const shortName = branch.name.replace(/ Branch$/, '');

  const tiles: { label: string; count: number; icon: IconName; fg: string; bg: string }[] = [
    { label: 'Available', count: counts.Available, icon: Icons.available, fg: theme.success, bg: theme.successSoft },
    { label: 'Occupied', count: counts.Occupied, icon: Icons.occupied, fg: theme.danger, bg: theme.dangerSoft },
    { label: 'Soon', count: counts.AvailableSoon, icon: Icons.soon, fg: theme.accentText, bg: theme.accentSoft },
  ];

  const activityIcon: Record<ActivityKind, { icon: IconName; color: string }> = {
    SpotRequest: { icon: Icons.partners, color: theme.accent },
    EquipmentFree: { icon: Icons.available, color: theme.success },
    CheckIn: { icon: Icons.checkIn, color: theme.success },
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: MEMBER_TAB_BAR_SPACE + insets.bottom }}>
        <View style={[styles.hero, { backgroundColor: theme.hero, paddingTop: insets.top + Spacing.four }]}>
          <View style={styles.inner}>
            <View style={styles.row}>
              <ThemedText type="smallBold" style={[styles.flex, styles.caps, { color: theme.accent }]}>
                GYM CONNECT
              </ThemedText>
              <View style={[styles.avatar, { backgroundColor: theme.accent }]} accessibilityLabel="Your profile">
                <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                  {data.initials}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="subtitle" style={[styles.title, { color: theme.heroText }]}>
              {data.greeting}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.heroSubtext }}>
              {data.schedule}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.inner, styles.body]}>
          {data.checkedIn ? (
            <Card>
              <View style={styles.row}>
                {branch.image && <Image source={branch.image} style={styles.branchImage} resizeMode="cover" />}
                <View style={styles.flex}>
                  <View style={styles.row}>
                    <View style={[styles.dot, { backgroundColor: theme.success }]} />
                    <ThemedText type="smallBold" style={styles.cardTitle}>
                      Checked in · {shortName}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    Since {data.checkedInSince} · {branch.checkedInCount} members here
                  </ThemedText>
                </View>
              </View>
              <Button variant="secondary" title="Check out" onPress={() => router.push('/member/branch')} />
            </Card>
          ) : (
            <View style={[styles.card, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
              <View>
                <ThemedText type="smallBold" style={styles.cardTitle}>
                  You&apos;re not checked in
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Check in to mark equipment and ask for a spotter.
                </ThemedText>
              </View>
              <Button title={`Check in to ${shortName}`} onPress={() => router.push('/member/branch')} />
            </View>
          )}

          {error && (
            <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
              {error}
            </ThemedText>
          )}

          <View style={styles.section}>
            <View style={styles.row}>
              <ThemedText type="smallBold" style={[styles.flex, styles.sectionTitle]}>
                Equipment availability
              </ThemedText>
              {/* shortcut: UI only until the Equipment Availability screen is merged. */}
              <Pressable accessibilityRole="button" accessibilityLabel="View all equipment" hitSlop={Spacing.three} style={styles.viewAll}>
                <ThemedText type="small" themeColor="textSecondary">
                  View all
                </ThemedText>
                <SymbolView name={Icons.next} size={14} tintColor={theme.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.tiles}>
              {tiles.map((t) => (
                <View key={t.label} style={[styles.tile, { backgroundColor: t.bg }]} accessibilityLabel={`${t.count} ${t.label}`}>
                  <View style={styles.row}>
                    <SymbolView name={t.icon} size={18} tintColor={t.fg} />
                    <ThemedText style={[styles.tileCount, { color: t.fg }]}>{t.count}</ThemedText>
                  </View>
                  <ThemedText type="smallBold" style={{ color: t.fg }}>
                    {t.label}
                  </ThemedText>
                </View>
              ))}
            </View>
            <View style={styles.actions}>
              {/* shortcut: UI only until the Equipment and Spotting screens are merged. */}
              <ActionCard icon={Icons.search} title="Find equipment" note="See live availability on the gym floor" />
              <ActionCard
                icon={Icons.partners}
                title="Spot me"
                note={data.checkedIn ? 'Request a spot from nearby members' : 'Check-in required'}
                locked={!data.checkedIn}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Branch activity
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Live at {branch.name}
              </ThemedText>
            </View>
            <Card>
              {data.activity.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Nothing new at this branch yet.
                </ThemedText>
              ) : (
                <View>
                  {data.activity.map((a, i) => (
                    <View
                      key={a.id}
                      style={[styles.row, styles.feedRow, i > 0 && { borderTopWidth: 1, borderColor: theme.border }]}>
                      <SymbolView name={activityIcon[a.kind].icon} size={18} tintColor={activityIcon[a.kind].color} />
                      <ThemedText type="small" style={[styles.flex, styles.feedText]}>
                        {a.text}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {a.ago}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Card({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>{children}</View>
  );
}

// A shortcut card. No onPress yet: it becomes a link when the target screen is merged.
function ActionCard({ icon, title, note, locked }: { icon: IconName; title: string; note: string; locked?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${note}`}
      style={[styles.card, styles.action, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <SymbolView name={icon} size={24} tintColor={theme.danger} />
      <ThemedText type="smallBold" style={styles.cardTitle}>
        {title}
      </ThemedText>
      <View style={styles.row}>
        <ThemedText
          type={locked ? 'smallBold' : 'small'}
          themeColor={locked ? undefined : 'textSecondary'}
          style={[styles.flex, locked && { color: theme.accentText }]}>
          {note}
        </ThemedText>
        <SymbolView name={Icons.next} size={14} tintColor={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  inner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.three },
  caps: { letterSpacing: 1 },
  hero: { paddingBottom: Spacing.four, borderBottomLeftRadius: Spacing.five, borderBottomRightRadius: Spacing.five },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, lineHeight: 34, marginTop: Spacing.two },
  body: { gap: Spacing.four, marginTop: Spacing.three },
  card: { borderWidth: 1, borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.three },
  cardTitle: { fontSize: 16 },
  branchImage: { width: 54, height: 54, borderRadius: Spacing.two + Spacing.one },
  dot: { width: 8, height: 8, borderRadius: 4 },
  section: { gap: Spacing.two + Spacing.one },
  sectionTitle: { fontSize: 18 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: Spacing.half, minHeight: 44 },
  tiles: { flexDirection: 'row', gap: Spacing.two },
  tile: { flex: 1, borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.one },
  tileCount: { fontSize: 22, lineHeight: 28, fontWeight: 800 },
  actions: { flexDirection: 'row', gap: Spacing.two + Spacing.one },
  action: { flex: 1, gap: Spacing.two },
  feedRow: { paddingVertical: Spacing.two + Spacing.one },
  feedText: { fontSize: 15 },
});

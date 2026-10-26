
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/bottom-sheet';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons as ICONS, type IconName } from '@/constants/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isBranchOpen } from '@/logic/branchAvailability';
import {
  formatTime,
  initials,
  isLaterTime,
  memberSince,
  SCHEDULE_SLOTS,
  sessionLength,
} from '@/logic/profile';
import { useProfile } from '@/logic/use-profile';
import type { Branch } from '@/types/branch';
import { APPEARANCE_MODES } from '@/types/settings';
import { FITNESS_LEVELS, TRAINING_STYLES, WEEK_DAYS } from '@/types/user';

const AVATAR_SIZE = 88;
const LAST_SLOT = SCHEDULE_SLOTS[SCHEDULE_SLOTS.length - 1];

// Keep Profile's short display names while sharing the complete branch names.
const shortBranchName = (name: string) => name.replace(/ Branch$/, '');

// Screen 8 — Member Profile (FR-9).
export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [sheet, setSheet] = useState<'branch' | 'from' | 'to' | null>(null);
  const timeScroll = useRef<ComponentRef<typeof ScrollView>>(null);

  const {
    data,
    loading,
    error,
    setFitnessLevel,
    toggleTrainingStyle,
    toggleDay,
    setScheduleFrom,
    setScheduleTo,
    setHomeBranch,
    setVisibleInSearch,
    pickAvatar,
    setAppearance,
    save,
    discard,
  } = useProfile();

  const user = data.user;

  if (loading || !user) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : (
          <ThemedText themeColor="textSecondary">{error}</ThemedText>
        )}
      </ThemedView>
    );
  }

  const { errors } = data;
  const branch = data.branches.find((b) => b.id === user.homeBranchId);
  const pickingTime = sheet === 'from' || sheet === 'to';
  const selectedSlot = sheet === 'from' ? user.scheduleFrom : user.scheduleTo;

  // End times must be later than the start.
  const slotEnabled = (slot: string) =>
    sheet === 'to'
      ? isLaterTime(slot, user.scheduleFrom)
      : slot !== LAST_SLOT;

  const scrollTarget = slotEnabled(selectedSlot)
    ? selectedSlot
    : SCHEDULE_SLOTS.find(slotEnabled);

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Header */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.hero,
              paddingTop: insets.top + Spacing.three,
            },
          ]}
        >
          <View style={styles.heroInner}>
            <ThemedText
              type="smallBold"
              style={[styles.brand, { color: theme.accent }]}
            >
              GYM CONNECT
            </ThemedText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              onPress={pickAvatar}
              style={[
                styles.avatar,
                {
                  borderColor: theme.accent,
                  backgroundColor: theme.heroChip,
                },
              ]}
            >
              {user.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <ThemedText
                  type="subtitle"
                  style={{ color: theme.heroText }}
                >
                  {initials(user.fullName)}
                </ThemedText>
              )}

              <View
                style={[
                  styles.cameraBadge,
                  {
                    backgroundColor: theme.accent,
                    borderColor: theme.hero,
                  },
                ]}
              >
                <SymbolView
                  name={ICONS.camera}
                  size={14}
                  tintColor={theme.onAccent}
                />
              </View>
            </Pressable>

            <ThemedText
              type="subtitle"
              style={[styles.name, { color: theme.heroText }]}
              numberOfLines={1}
            >
              {user.fullName}
            </ThemedText>

            <ThemedText
              type="small"
              style={{ color: theme.heroSubtext }}
              numberOfLines={1}
            >
              {user.email}
            </ThemedText>

            <View style={styles.pills}>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: theme.accent },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={{ color: theme.onAccent }}
                >
                  {user.fitnessLevel}
                </ThemedText>
              </View>

              {branch && (
                <View
                  style={[
                    styles.pill,
                    { backgroundColor: theme.heroChip },
                  ]}
                >
                  <SymbolView
                    name={ICONS.branch}
                    size={14}
                    tintColor={theme.heroText}
                  />

                  <ThemedText
                    type="small"
                    style={{ color: theme.heroText }}
                  >
                    {shortBranchName(branch.name)}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Profile Body */}
        <View style={styles.body}>
          <View
            style={[
              styles.stats,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            {[
              [String(user.scheduleDays.length), 'days / week'],
              [
                sessionLength(user.scheduleFrom, user.scheduleTo),
                'per session',
              ],
              [memberSince(user.createdAt), 'member since'],
            ].map(([value, label], i) => (
              <View
                key={label}
                style={[
                  styles.stat,
                  i > 0 && {
                    borderLeftWidth: 1,
                    borderColor: theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={styles.statValue}
                >
                  {value}
                </ThemedText>

                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                >
                  {label}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Training */}
          <Card icon={ICONS.training} title="Training">
            <FieldLabel>Fitness level</FieldLabel>

            <SegmentedControl
              accessibilityLabel="Fitness level"
              options={FITNESS_LEVELS}
              value={user.fitnessLevel}
              onChange={setFitnessLevel}
            />

            <FieldLabel>Training styles</FieldLabel>

            <View style={styles.wrap}>
              {TRAINING_STYLES.map((style) => (
                <Chip
                  key={style}
                  tone="primary"
                  multiple
                  label={style}
                  selected={user.trainingStyles.includes(style)}
                  onPress={() => toggleTrainingStyle(style)}
                />
              ))}
            </View>

            <FieldError message={errors.trainingStyles} />
          </Card>

          {/* Schedule */}
          <Card icon={ICONS.schedule} title="Schedule">
            <View style={styles.days}>
              {WEEK_DAYS.map((day) => (
                <Chip
                  key={day}
                  tone="primary"
                  multiple
                  check={false}
                  label={day[0]}
                  accessibilityLabel={day}
                  selected={user.scheduleDays.includes(day)}
                  onPress={() => toggleDay(day)}
                  style={styles.day}
                />
              ))}
            </View>

            <View style={styles.row}>
              {(
                [
                  ['from', 'From', user.scheduleFrom],
                  ['to', 'To', user.scheduleTo],
                ] as const
              ).map(([key, label, value]) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={`${label} ${formatTime(value)}, change`}
                  onPress={() => setSheet(key)}
                  style={[
                    styles.timeBox,
                    {
                      borderColor:
                        key === 'to' && errors.scheduleTime
                          ? theme.danger
                          : theme.border,
                    },
                  ]}
                >
                  <View style={styles.flex}>
                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                    >
                      {label}
                    </ThemedText>

                    <ThemedText type="smallBold">
                      {formatTime(value)}
                    </ThemedText>
                  </View>

                  <SymbolView
                    name={ICONS.clock}
                    size={18}
                    tintColor={theme.textSecondary}
                  />
                </Pressable>
              ))}
            </View>

            <FieldError
              message={errors.scheduleDays ?? errors.scheduleTime}
            />
          </Card>

          {/* Home Branch */}
          <Card icon={ICONS.branch} title="Home branch">
            {branch && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Home branch ${shortBranchName(
                  branch.name
                )}, change`}
                onPress={() => setSheet('branch')}
                style={[
                  styles.branchBox,
                  { borderColor: theme.accent },
                ]}
              >
                <BranchInfo branch={branch} />

                <ThemedText
                  type="smallBold"
                  style={{ color: theme.accentText }}
                >
                  Change
                </ThemedText>
              </Pressable>
            )}

            <View
              style={[
                styles.row,
                styles.divider,
                { borderColor: theme.border },
              ]}
            >
              <View style={styles.flex}>
                <ThemedText type="smallBold">
                  Show me in partner search
                </ThemedText>

                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                >
                  Members at{' '}
                  {branch
                    ? shortBranchName(branch.name)
                    : 'your branch'}{' '}
                  can find you
                </ThemedText>
              </View>

              <Switch
                accessibilityLabel="Show me in partner search"
                value={user.visibleInSearch}
                onValueChange={setVisibleInSearch}
                trackColor={{
                  true: theme.primary,
                  false: theme.border,
                }}
                thumbColor={theme.backgroundElement}
                ios_backgroundColor={theme.border}
              />
            </View>
          </Card>

          {/* Theme */}
          <Card icon={ICONS.theme} title="Theme">
            <SegmentedControl
              accessibilityLabel="Theme"
              options={APPEARANCE_MODES}
              value={data.appearance}
              onChange={setAppearance}
            />
          </Card>

          {/* General Error */}
          {error && (
            <ThemedText
              type="small"
              style={[
                styles.center,
                { color: theme.danger },
              ]}
              accessibilityRole="alert"
            >
              {error}
            </ThemedText>
          )}

          {/* Log Out */}
          <Pressable
            accessibilityRole="button"
            // Sign-in is not yet implemented.
            onPress={() =>
              Alert.alert(
                'Log out',
                'Sign-in isn’t built yet, so there is nothing to log out of.'
              )
            }
            style={({ pressed }) => [
              styles.logout,
              {
                borderColor: theme.border,
                backgroundColor: theme.backgroundElement,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <SymbolView
              name={ICONS.logout}
              size={18}
              tintColor={theme.danger}
            />

            <ThemedText
              type="smallBold"
              style={{ color: theme.danger }}
            >
              Log out
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      {/* Save / Discard Bar */}
      {(data.dirty || data.justSaved) && (
        <View
          style={[
            styles.saveBar,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              paddingBottom: insets.bottom + Spacing.three,
            },
          ]}
        >
          {data.dirty ? (
            <>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.flex}
              >
                Unsaved changes
              </ThemedText>

              <Button
                variant="secondary"
                title="Discard"
                onPress={discard}
              />

              <Button
                title={data.saving ? 'Saving…' : 'Save profile'}
                onPress={save}
                disabled={data.saving}
              />
            </>
          ) : (
            <View
              style={styles.savedRow}
              accessibilityRole="alert"
            >
              <SymbolView
                name={ICONS.saved}
                size={18}
                tintColor={theme.text}
              />

              <ThemedText type="smallBold">
                Profile saved
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Choose Home Branch */}
      <BottomSheet
        visible={sheet === 'branch'}
        title="Choose your home branch"
        onClose={() => setSheet(null)}
      >
        {data.branches.map((b) => {
          const selected = b.id === user.homeBranchId;

          return (
            <Pressable
              key={b.id}
              accessibilityRole="radio"
              aria-checked={selected}
              onPress={() => {
                setHomeBranch(b.id);
                setSheet(null);
              }}
              style={[
                styles.branchBox,
                {
                  borderColor: selected
                    ? theme.accent
                    : theme.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <BranchInfo branch={b} />
            </Pressable>
          );
        })}
      </BottomSheet>

      {/* Time Picker */}
      <BottomSheet
        visible={pickingTime}
        title={
          sheet === 'from'
            ? 'Start time'
            : `End time · after ${formatTime(user.scheduleFrom)}`
        }
        onClose={() => setSheet(null)}
        scrollRef={timeScroll}
      >
        <View key={sheet} style={styles.wrap}>
          {SCHEDULE_SLOTS.map((slot) => (
            <Chip
              key={slot}
              tone="primary"
              label={formatTime(slot)}
              selected={slot === selectedSlot}
              disabled={!slotEnabled(slot)}
              onLayout={
                slot === scrollTarget
                  ? (e) =>
                      timeScroll.current?.scrollTo({
                        y: Math.max(
                          0,
                          e.nativeEvent.layout.y - Spacing.five
                        ),
                        animated: false,
                      })
                  : undefined
              }
              onPress={() => {
                if (sheet === 'from') {
                  setScheduleFrom(slot);

                  setSheet(
                    isLaterTime(user.scheduleTo, slot)
                      ? null
                      : 'to'
                  );
                } else {
                  setScheduleTo(slot);
                  setSheet(null);
                }
              }}
              style={styles.slot}
            />
          ))}
        </View>
      </BottomSheet>
    </ThemedView>
  );
}

// Shared profile card
function Card({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.cardIcon,
            { backgroundColor: theme.accentSoft },
          ]}
        >
          <SymbolView
            name={icon}
            size={18}
            tintColor={theme.accent}
          />
        </View>

        <ThemedText
          type="smallBold"
          style={styles.cardTitle}
        >
          {title}
        </ThemedText>
      </View>

      {children}
    </View>
  );
}

// Shared branch information using the same availability
// calculation as the Branch Selection screen.
function BranchInfo({ branch }: { branch: Branch }) {
  const theme = useTheme();

  const open = isBranchOpen(
    branch.openingTime,
    branch.closingTime,
    new Date()
  );

  return (
    <View style={styles.flex}>
      <ThemedText type="smallBold">
        {shortBranchName(branch.name)}
      </ThemedText>

      <ThemedText
        type="small"
        themeColor="textSecondary"
      >
        {branch.address}
      </ThemedText>

      <View style={styles.hoursRow}>
        <SymbolView
          name={ICONS.clock}
          size={14}
          tintColor={theme.textSecondary}
        />

        <ThemedText
          type="small"
          themeColor="textSecondary"
        >
          {formatTime(branch.openingTime)} –{' '}
          {formatTime(branch.closingTime)}
        </ThemedText>

        <ThemedText
          type="smallBold"
          style={{
            color: open
              ? theme.success
              : theme.danger,
          }}
        >
          {open ? 'Open' : 'Closed'}
        </ThemedText>
      </View>
    </View>
  );
}

// Field label
function FieldLabel({
  children,
}: {
  children: string;
}) {
  return (
    <ThemedText
      type="small"
      themeColor="textSecondary"
    >
      {children}
    </ThemedText>
  );
}

// Validation error
function FieldError({
  message,
}: {
  message?: string;
}) {
  const theme = useTheme();

  if (!message) {
    return null;
  }

  return (
    <ThemedText
      type="small"
      style={{ color: theme.danger }}
      accessibilityRole="alert"
    >
      {message}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingBottom: Spacing.five,
  },

  flex: {
    flex: 1,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },

  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },

  center: {
    textAlign: 'center',
  },

  hero: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    borderBottomLeftRadius: Spacing.five,
    borderBottomRightRadius: Spacing.five,
  },

  heroInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    alignItems: 'center',
  },

  brand: {
    alignSelf: 'flex-start',
    letterSpacing: 3,
    marginBottom: Spacing.three,
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: AVATAR_SIZE - 6,
    height: AVATAR_SIZE - 6,
    borderRadius: AVATAR_SIZE / 2,
  },

  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: {
    fontSize: 22,
    lineHeight: 30,
    marginTop: Spacing.three,
  },

  pills: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },

  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },

  stats: {
    flexDirection: 'row',
    marginTop: -Spacing.five,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },

  statValue: {
    fontSize: 18,
    lineHeight: 26,
  },

  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },

  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    fontSize: 17,
  },

  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },

  day: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 48,
    borderRadius: 24,
    paddingHorizontal: 0,
    minWidth: 0,
  },

  timeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },

  branchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 2,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },

  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.half,
  },

  divider: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
  },

  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },

  saveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },

  savedRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },

  slot: {
    width: '30%',
    paddingHorizontal: 0,
  },
});

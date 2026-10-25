import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { ProgressRing } from '@/features/timer/progress-ring';
import { useTheme } from '@/hooks/use-theme';
import { ADJUST_SEC, formatClock, PRESETS_SEC } from '@/logic/rest-timer';
import { useRestTimer } from '@/logic/use-rest-timer';

const RING_SIZE = 260;

const STATUS_LABEL = { idle: 'Ready', running: 'Remaining', paused: 'Paused' } as const;

// Screen 7 — Rest Timer (FR-4). Optional `?exercise=Bench Press` comes from Equipment Details.
export default function RestTimerScreen() {
  const theme = useTheme();
  const { exercise } = useLocalSearchParams<{ exercise?: string }>();
  const { data, loading, error, start, pause, reset, adjust, selectPreset, toggleVibrate, resetSets } =
    useRestTimer();

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.accent} />
      </ThemedView>
    );
  }

  const running = data.status === 'running';
  const clock = formatClock(data.remainingMs);
  const [minutes, seconds] = clock.split(':').map(Number);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
              GYM CONNECT
            </ThemedText>
            <ThemedText type="subtitle">Rest timer</ThemedText>
            <ThemedText themeColor="textSecondary">
              {exercise ? `${exercise} · rest between your sets` : 'Rest between your working sets'}
            </ThemedText>
          </View>

          <View style={styles.setRow}>
            <View style={[styles.setPill, { backgroundColor: theme.backgroundElement, borderColor: theme.accent }]}>
              <ThemedText type="smallBold">Set {data.setNumber}</ThemedText>
            </View>
            {data.setNumber > 1 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start sets over from 1"
                onPress={resetSets}
                hitSlop={Spacing.two}
                style={styles.textButton}>
                <ThemedText type="small" themeColor="textSecondary">
                  Start over
                </ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.ringRow}>
            <ProgressRing
              size={RING_SIZE}
              strokeWidth={14}
              progress={data.progress}
              color={theme.accent}
              trackColor={theme.backgroundSelected}>
              <ThemedText
                accessibilityRole="timer"
                accessibilityLabel={`${minutes} minutes ${seconds} seconds, ${STATUS_LABEL[data.status]}`}
                style={styles.clock}>
                {clock}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {STATUS_LABEL[data.status]}
              </ThemedText>
            </ProgressRing>
          </View>

          <View style={styles.row}>
            <Button
              variant="secondary"
              title={`−${ADJUST_SEC}s`}
              accessibilityLabel={`Remove ${ADJUST_SEC} seconds`}
              onPress={() => adjust(-ADJUST_SEC)}
              style={styles.flex}
            />
            <Button
              variant="secondary"
              title={`+${ADJUST_SEC}s`}
              accessibilityLabel={`Add ${ADJUST_SEC} seconds`}
              onPress={() => adjust(ADJUST_SEC)}
              style={styles.flex}
            />
          </View>

          <View style={styles.row} accessibilityRole="radiogroup">
            {PRESETS_SEC.map((sec) => (
              <Chip
                key={sec}
                label={`${sec}s`}
                selected={data.durationSec === sec}
                accessibilityLabel={`${sec} seconds rest`}
                onPress={() => selectPreset(sec)}
                style={styles.flex}
              />
            ))}
          </View>

          <View style={styles.row}>
            <Button
              title={running ? 'Pause' : data.status === 'paused' ? 'Resume' : 'Start'}
              onPress={running ? pause : start}
              style={styles.mainButton}
            />
            <Button
              variant="secondary"
              title="Reset"
              onPress={reset}
              disabled={data.status === 'idle'}
              style={styles.flex}
            />
          </View>

          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
            <View style={styles.flex}>
              <ThemedText type="smallBold">Vibrate when finished</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Taps on the last 3 seconds, a buzz at zero
              </ThemedText>
            </View>
            <Switch
              accessibilityLabel="Vibrate when finished"
              value={data.vibrate}
              onValueChange={toggleVibrate}
              trackColor={{ true: theme.accent, false: theme.border }}
              thumbColor={theme.backgroundElement}
              ios_backgroundColor={theme.border}
            />
          </ThemedView>

          {error && (
            <ThemedText type="small" themeColor="textSecondary" accessibilityRole="alert">
              {error}
            </ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  header: { gap: Spacing.one },
  eyebrow: { letterSpacing: 1 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  setPill: {
    borderLeftWidth: 4,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  textButton: { minHeight: 44, justifyContent: 'center' },
  ringRow: { alignItems: 'center', paddingVertical: Spacing.two },
  clock: { fontSize: 64, lineHeight: 72, fontWeight: 700, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  mainButton: { flex: 2 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
});

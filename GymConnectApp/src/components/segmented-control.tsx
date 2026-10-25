import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

// One-of-N picker shown as a single track; the selected segment is filled Midnight (Marigold in dark).
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="radio"
            aria-checked={selected}
            onPress={() => onChange(option)}
            style={[styles.segment, selected && { backgroundColor: theme.primary }]}>
            <ThemedText type="smallBold" style={{ color: selected ? theme.onPrimary : theme.text }}>
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderWidth: 1, borderRadius: Spacing.three, padding: Spacing.half },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: Spacing.three - Spacing.half,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

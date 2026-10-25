import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  selected: boolean;
  multiple?: boolean; // checkbox-style (many can be on) instead of radio-style
  check?: boolean; // show a check mark when selected; defaults to on for multiple
  tone?: 'accent' | 'primary'; // soft Marigold (timer presets) or neutral with Midnight when selected (forms)
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected, multiple, check = multiple, tone = 'accent', style, ...rest }: ChipProps) {
  const theme = useTheme();
  const colors =
    tone === 'accent'
      ? { bg: selected ? theme.accent : theme.accentSoft, fg: selected ? theme.onAccent : theme.accentText }
      : { bg: selected ? theme.primary : theme.backgroundSelected, fg: selected ? theme.onPrimary : theme.text };

  return (
    <Pressable
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      aria-checked={selected}
      aria-disabled={!!rest.disabled}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: colors.bg, opacity: rest.disabled ? 0.35 : pressed ? 0.8 : 1 },
        style,
      ]}
      {...rest}>
      {check && selected && (
        <SymbolView
          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
          size={14}
          weight="bold"
          tintColor={colors.fg}
        />
      )}
      <ThemedText type="smallBold" style={{ color: colors.fg }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { SymbolView } from 'expo-symbols';

import { ThemedText } from './themed-text';

import type { IconName } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: IconName; // shown before the title
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, variant = 'primary', icon, style, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();
  const fill = {
    primary: theme.primary,
    danger: theme.danger,
    secondary: theme.backgroundElement
  }[variant];
  const text = {
    primary: theme.onPrimary,
    danger: theme.onDanger,
    secondary: theme.text
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled: !!disabled
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: fill,
          borderColor: variant === 'secondary' ? theme.border : fill,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}
      {...rest}>
      {icon && <SymbolView name={icon} size={18} tintColor={text} />}
      <ThemedText type="smallBold" style={{
        color: text
      }}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

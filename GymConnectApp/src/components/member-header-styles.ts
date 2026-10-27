import { StyleSheet } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';

// Shared by Profile, Partners and Spotter.
export const memberHeaderStyles = StyleSheet.create({
  hero: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    borderBottomLeftRadius: Spacing.five,
    borderBottomRightRadius: Spacing.five,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  brand: {
    alignSelf: 'flex-start',
    letterSpacing: 3,
    marginBottom: Spacing.three,
  },
});

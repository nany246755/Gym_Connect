import type { SymbolViewProps } from 'expo-symbols';

// Every icon the app uses, as SF Symbol (iOS) + Material Symbol (Android, web) names for <SymbolView>.
export const Icons = {
  equipment: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
  training: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
  schedule: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  branch: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  theme: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' },
  camera: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  saved: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  remove: { ios: 'trash', android: 'delete', web: 'delete' },
  warning: { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' },
  reset: { ios: 'arrow.counterclockwise', android: 'refresh', web: 'refresh' },
  add: { ios: 'plus', android: 'add', web: 'add' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  profile: { ios: 'person.crop.circle', android: 'person', web: 'person' },
  next: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
} satisfies Record<string, SymbolViewProps['name']>;

export type IconName = SymbolViewProps['name'];

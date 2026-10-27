import type { Colors } from '@/constants/theme';
import type { EquipmentStatus } from '@/types/equipment';

export function equipmentStatusColors(theme: typeof Colors.light | typeof Colors.dark, status: EquipmentStatus) {
  const colors = {
    Available: {
      foreground: theme.success,
      background: theme.successSoft
    },
    Occupied: {
      foreground: theme.danger,
      background: theme.dangerSoft
    },
    AvailableSoon: {
      foreground: theme.accentText,
      background: theme.accentSoft
    },
    Maintenance: {
      foreground: theme.textSecondary,
      background: theme.backgroundSelected
    },
  };
  return colors[status];
}

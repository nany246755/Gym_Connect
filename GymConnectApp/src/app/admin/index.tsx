
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/bottom-sheet';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/constants/icons';
import { MaxContentWidth, NoWebOutline, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { equipmentImage, isStuck, MUSCLE_LABEL, occupiedFor, STATUS_LABEL, type StatusFilter } from '@/logic/equipment';
import { useEquipmentInventory } from '@/logic/use-equipment-inventory';
import { EQUIPMENT_STATUSES, type Equipment, type EquipmentStatus } from '@/types/equipment';

const FILTERS: StatusFilter[] = ['All', ...EQUIPMENT_STATUSES];

// Screen 9 — Admin Equipment Management: inventory (FR-10).
export default function EquipmentInventoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<'branch' | Equipment | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const { data, loading, error, setBranch, setStatus, setQuery, reset, remove } = useEquipmentInventory();

  // Word + colour for every status (never colour alone).
  const statusColor: Record<EquipmentStatus, { fg: string; bg: string }> = {
    Available: {
      fg: theme.success,
      bg: theme.successSoft
    },
    Occupied: {
      fg: theme.danger,
      bg: theme.dangerSoft
    },
    AvailableSoon: {
      fg: theme.accentText,
      bg: theme.accentSoft
    },
    Maintenance: {
      fg: theme.textSecondary,
      bg: theme.backgroundSelected
    },
  };

  const branch = data.branch;
  const removing = sheet && sheet !== 'branch' ? sheet : null;

  const header = (
    <>
      <View style={[styles.hero, {
        backgroundColor: theme.hero,
        paddingTop: insets.top + Spacing.three
      }]}>
        <View style={styles.inner}>
          <View style={styles.row}>
            <SymbolView name={Icons.equipment} size={16} tintColor={theme.accent} />
            <ThemedText type="smallBold" style={{
              color: theme.heroText
            }}>
              GYM CONNECT / ADMIN
            </ThemedText>
          </View>
          <View style={[styles.row, styles.titleRow]}>
            <ThemedText type="subtitle" style={[styles.flex, {
              color: theme.heroText
            }]}>
              Equipment
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Branch ${branch?.name ?? ''}, change`}
              onPress={() => setSheet('branch')}
              style={[styles.branchPill, {
                backgroundColor: theme.heroText
              }]}>
              <SymbolView name={Icons.branch} size={16} tintColor={theme.hero} />
              <ThemedText type="smallBold" style={{
                color: theme.hero
              }}>
                {branch?.name ?? '…'}
              </ThemedText>
              <SymbolView name={Icons.chevronDown} size={14} tintColor={theme.hero} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.inner}>
        <View style={[styles.card, styles.overview, {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border
        }]}>
          <View style={[styles.row, styles.overviewHeader]}>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={[styles.flex, styles.caps, styles.overviewHeading]}
              numberOfLines={1}>
              {branch?.name} overview
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.overviewCount} numberOfLines={1}>
              {data.total} items
            </ThemedText>
          </View>
          <View style={styles.statsRow}>
            {EQUIPMENT_STATUSES.map((s) => (
              <View key={s} style={styles.stat}>
                <ThemedText type="subtitle" style={[styles.statValue, {
                  color: theme.textSecondary
                }]} numberOfLines={1}>
                  {data.counts[s]}
                </ThemedText>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.statLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}>
                  {STATUS_LABEL[s]}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.search,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: searchFocused ? theme.textSecondary : theme.border
            },
          ]}>
          <SymbolView name={Icons.search} size={18} tintColor={theme.textSecondary} />
          <TextInput
            value={data.query}
            onChangeText={setQuery}
            placeholder="Search equipment or station"
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="Search equipment or station"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={[styles.flex, styles.searchInput, NoWebOutline, {
              color: theme.text
            }]}
          />
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.caps}>
          Filter by status
        </ThemedText>
        <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="Filter by status">
          {FILTERS.map((f) => (
            <Chip
              key={f}
              tone="primary"
              check
              label={f === 'All' ? 'All' : STATUS_LABEL[f]}
              dot={f === 'All' ? undefined : statusColor[f].fg}
              selected={data.status === f}
              onPress={() => setStatus(f)}
              style={styles.filterChip}
            />
          ))}
        </View>

        <View style={styles.row}>
          <ThemedText type="smallBold" style={[styles.flex, styles.listTitle]}>
            {data.status === 'All' ? 'All equipment' : STATUS_LABEL[data.status]}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {data.items.length} items
          </ThemedText>
        </View>
        {error && (
          <ThemedText type="small" style={{
            color: theme.danger
          }} accessibilityRole="alert">
            {error}
          </ThemedText>
        )}
      </View>
    </>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={data.items}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={header}
        contentContainerStyle={[styles.list, {
          paddingBottom: insets.bottom + 96
        }]}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={[styles.inner, styles.empty]}>
            <ThemedText themeColor="textSecondary">No equipment matches.</ThemedText>
            <Button
              variant="secondary"
              title="Clear filters"
              onPress={() => {
                setStatus('All');
                setQuery('');
              }}
            />
          </View>
        }
        renderItem={({ item }) => {
          const stuck = isStuck(item, data.now);
          const color = statusColor[item.status];
          const image = equipmentImage(item);
          return (
            <View style={styles.inner}>
              <View
                style={[
                  styles.card,
                  styles.itemCard,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: stuck ? theme.accent : theme.border
                  },
                ]}>
                <View style={[styles.row, styles.itemTop]}>
                  <View style={[styles.thumb, {
                    backgroundColor: theme.accentSoft
                  }]}>
                    {image ? (
                      <Image source={image} style={styles.thumbImage} contentFit="cover" />
                    ) : (
                      <SymbolView name={Icons.equipment} size={22} tintColor={theme.accent} />
                    )}
                  </View>
                  <View style={styles.flex}>
                    <ThemedText type="smallBold" style={styles.itemName}>
                      {item.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.zone} zone · {item.station}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {MUSCLE_LABEL[item.muscleGroup]}
                    </ThemedText>
                  </View>
                  <View style={[styles.statusPill, {
                    backgroundColor: color.bg
                  }]}>
                    <View style={[styles.dot, {
                      backgroundColor: color.fg
                    }]} />
                    <ThemedText type="small" style={{
                      color: color.fg
                    }}>
                      {STATUS_LABEL[item.status]}
                    </ThemedText>
                  </View>
                </View>

                {stuck && (
                  <>
                    <View style={styles.row}>
                      <SymbolView name={Icons.warning} size={16} tintColor={theme.accentText} />
                      <ThemedText type="small" style={{
                        color: theme.accentText
                      }}>
                        Occupied for {occupiedFor(item, data.now)} · Check station
                      </ThemedText>
                    </View>
                    <Button icon={Icons.reset} title="Reset to Available" onPress={() => reset(item)} />
                  </>
                )}

                <View style={[styles.row, styles.actions, {
                  borderColor: theme.border
                }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${item.name}`}
                    onPress={() => router.push({
                      pathname: '/admin/edit',
                      params: {
                        id: item.id
                      }
                    })}
                    style={styles.action}>
                    <SymbolView name={Icons.edit} size={16} tintColor={theme.text} />
                    <ThemedText type="smallBold">Edit</ThemedText>
                  </Pressable>
                  <View style={[styles.actionDivider, {
                    backgroundColor: theme.border
                  }]} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.name}`}
                    onPress={() => setSheet(item)}
                    style={styles.action}>
                    <SymbolView name={Icons.remove} size={16} tintColor={theme.danger} />
                    <ThemedText type="smallBold" style={{
                      color: theme.danger
                    }}>
                      Remove
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add equipment"
        onPress={() => router.push({
          pathname: '/admin/edit',
          params: {
            branchId: branch?.id
          }
        })}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: insets.bottom + Spacing.four,
            opacity: pressed ? 0.85 : 1
          },
        ]}>
        {/* Marigold plus on Midnight; in dark mode the button itself is Marigold, so match the label. */}
        <SymbolView name={Icons.add} size={20} tintColor={theme.primary === theme.accent ? theme.onPrimary : theme.accent} />
        <ThemedText type="smallBold" style={{
          color: theme.onPrimary
        }}>
          Add equipment
        </ThemedText>
      </Pressable>

      <BottomSheet visible={sheet === 'branch'} title="Choose a branch" onClose={() => setSheet(null)}>
        {data.branches.map((b) => (
          <Chip
            key={b.id}
            tone="primary"
            check
            label={b.name}
            selected={b.id === branch?.id}
            onPress={() => {
              setBranch(b.id);
              setSheet(null);
            }}
            style={styles.sheetOption}
          />
        ))}
      </BottomSheet>

      <BottomSheet visible={!!removing} onClose={() => setSheet(null)}>
        {removing && (
          <View style={styles.removeSheet}>
            <View style={styles.row}>
              <View style={[styles.removeIcon, {
                backgroundColor: theme.dangerSoft
              }]}>
                <SymbolView name={Icons.remove} size={22} tintColor={theme.danger} />
              </View>
              <View style={styles.flex} />
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setSheet(null)} hitSlop={Spacing.three}>
                <SymbolView name={Icons.close} size={20} tintColor={theme.textSecondary} />
              </Pressable>
            </View>
            <ThemedText type="subtitle" style={styles.removeTitle}>
              Remove {removing.name}?
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              This removes {removing.name} from {branch?.name}’s inventory. Members will no longer see it. This action
              can’t be undone.
            </ThemedText>
            <View style={styles.row}>
              <SymbolView name={Icons.branch} size={14} tintColor={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {removing.zone} zone · {removing.station}
              </ThemedText>
            </View>
            <Button
              variant="danger"
              title="Remove equipment"
              onPress={() => {
                remove(removing);
                setSheet(null);
              }}
            />
            <Button variant="secondary" title="Keep equipment" onPress={() => setSheet(null)} />
          </View>
        )}
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  flex: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three
  },
  list: {
    gap: Spacing.three
  },
  caps: {
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  hero: {
    paddingBottom: Spacing.six,
    borderBottomLeftRadius: Spacing.five,
    borderBottomRightRadius: Spacing.five,
  },
  titleRow: {
    marginTop: Spacing.three
  },
  branchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
  },
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three
  },
  overview: {
    marginTop: -Spacing.five,
    gap: Spacing.two,
    marginBottom: Spacing.three,
    zIndex: 1
  },
  overviewHeader: {
    justifyContent: 'space-between'
  },
  overviewHeading: {
    minWidth: 0
  },
  overviewCount: {
    flexShrink: 0,
    textAlign: 'right'
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%'
  },
  stat: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center'
  },
  statLabel: {
    width: '100%',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    includeFontPadding: false
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    minHeight: 48,
    marginBottom: Spacing.three,
  },
  searchInput: {
    fontSize: 16,
    minHeight: 44
  },
  filterChip: {
    flexGrow: 1,
    flexBasis: '30%'
  },
  listTitle: {
    fontSize: 17,
    marginTop: Spacing.three
  },
  itemCard: {
    gap: Spacing.three
  },
  itemTop: {
    alignItems: 'flex-start'
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: 52,
    height: 52
  },
  itemName: {
    fontSize: 17
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.three,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  actions: {
    borderTopWidth: 1,
    paddingTop: Spacing.two
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    minHeight: 44
  },
  actionDivider: {
    width: 1,
    height: 24
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.five
  },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 52,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
  },
  sheetOption: {
    justifyContent: 'flex-start'
  },
  removeSheet: {
    gap: Spacing.three,
    paddingBottom: Spacing.two
  },
  removeIcon: {
    width: 48,
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center'
  },
  removeTitle: {
    fontSize: 24,
    lineHeight: 30
  },
});

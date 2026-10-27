
import {
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

import {
  createEquipmentFloorLayout,
  FLOOR_COLUMNS,
} from '@/logic/equipment-floor';

import type { Equipment } from '@/types/equipment';

// Compact height for one gym-floor row.
const CELL_HEIGHT = 104;

// Space between floor cells.
const GAP = 8;

// Padding inside the floor-plan frame.
const FLOOR_PADDING = 8;

type TileMode = 'floor' | 'regular';

type EquipmentFloorGridProps = {
  items: Equipment[];

  renderTile: (
    item: Equipment,
    mode: TileMode
  ) => ReactNode;
};

type EmptyCell = {
  row: number;
  column: number;
};

export default function EquipmentFloorGrid({
  items,
  renderTile,
}: EquipmentFloorGridProps) {
  const theme = useTheme();

  const [containerWidth, setContainerWidth] =
    useState(0);

  // Use saved Admin positions.
  const layout = useMemo(
    () => createEquipmentFloorLayout(items),
    [items]
  );

  // Find all cells not occupied by positioned equipment.
  const emptyCells = useMemo<EmptyCell[]>(() => {
    const occupiedCells = new Set<string>();

    for (const placedItem of layout.placed) {
      const {
        row,
        column,
        rowSpan,
        columnSpan,
      } = placedItem.position;

      for (
        let r = row;
        r < row + rowSpan;
        r++
      ) {
        for (
          let c = column;
          c < column + columnSpan;
          c++
        ) {
          occupiedCells.add(`${r}:${c}`);
        }
      }
    }

    const empty: EmptyCell[] = [];

    for (
      let row = 1;
      row <= layout.rowCount;
      row++
    ) {
      for (
        let column = 1;
        column <= FLOOR_COLUMNS;
        column++
      ) {
        if (
          !occupiedCells.has(
            `${row}:${column}`
          )
        ) {
          empty.push({
            row,
            column,
          });
        }
      }
    }

    return empty;
  }, [layout.placed, layout.rowCount]);

  // Group equipment with no assigned floor position.
  const unplacedZones = useMemo(() => {
    const groups = new Map<string, Equipment[]>();

    for (const item of layout.unplaced) {
      const group = groups.get(item.zone);

      if (group) {
        group.push(item);
      } else {
        groups.set(item.zone, [item]);
      }
    }

    return Array.from(
      groups,
      ([name, equipment]) => ({
        name,
        equipment,
      })
    );
  }, [layout.unplaced]);

  // Calculate four responsive column widths.
  const columnWidth =
    containerWidth > 0
      ? Math.max(
        0,
        (
          containerWidth -
          GAP * (FLOOR_COLUMNS - 1)
        ) / FLOOR_COLUMNS
      )
      : 0;

  // Compact height based on the last positioned row.
  const floorHeight =
    layout.rowCount * CELL_HEIGHT +
    Math.max(
      0,
      layout.rowCount - 1
    ) * GAP;

  function getCellCoordinates(
    row: number,
    column: number
  ) {
    return {
      left:
        (column - 1) *
        (columnWidth + GAP),

      top:
        (row - 1) *
        (CELL_HEIGHT + GAP),
    };
  }

  return (
    <View style={styles.container}>

      {/* Equipment with assigned floor positions */}
      {layout.placed.length > 0 && (
        <View style={styles.section}>

          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">
              Gym floor layout
            </ThemedText>

            <ThemedText
              type="small"
              themeColor="textSecondary"
            >
              {layout.placed.length} positioned
            </ThemedText>
          </View>


          <View
            style={[
              styles.floorFrame,
              {
                backgroundColor:
                  theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.floorCanvas,
                {
                  height: floorHeight,
                },
              ]}
              onLayout={(event) => {
                const width =
                  event.nativeEvent.layout.width;

                if (
                  Math.abs(
                    width - containerWidth
                  ) > 0.5
                ) {
                  setContainerWidth(width);
                }
              }}
            >

              {/* Unoccupied cells */}
              {columnWidth > 0 &&
                emptyCells.map((cell) => {
                  const coordinates =
                    getCellCoordinates(
                      cell.row,
                      cell.column
                    );

                  return (
                    <View
                      key={`empty-${cell.row}-${cell.column}`}
                      pointerEvents="none"
                      style={[
                        styles.emptyCell,
                        coordinates,
                        {
                          width: columnWidth,
                          height: CELL_HEIGHT,
                          backgroundColor:
                            theme.backgroundSelected,
                          borderColor:
                            theme.border,
                        },
                      ]}
                    />
                  );
                })}

              {/* Positioned equipment */}
              {columnWidth > 0 &&
                layout.placed.map(
                  ({
                    equipment,
                    position,
                  }) => {
                    const coordinates =
                      getCellCoordinates(
                        position.row,
                        position.column
                      );

                    const width =
                      position.columnSpan *
                      columnWidth +
                      (
                        position.columnSpan - 1
                      ) * GAP;

                    const height =
                      position.rowSpan *
                      CELL_HEIGHT +
                      (
                        position.rowSpan - 1
                      ) * GAP;

                    return (
                      <View
                        key={equipment.id}
                        style={[
                          styles.positionedTile,
                          coordinates,
                          {
                            width,
                            height,
                          },
                        ]}
                      >
                        {renderTile(
                          equipment,
                          'floor'
                        )}
                      </View>
                    );
                  }
                )}
            </View>
          </View>
        </View>
      )}

      {/* Equipment without assigned floor positions */}
      {unplacedZones.length > 0 && (
        <View style={styles.section}>

          {layout.placed.length > 0 && (
            <ThemedText
              type="small"
              themeColor="textSecondary"
            >
              Other equipment — positions not yet assigned
            </ThemedText>
          )}

          {unplacedZones.map((zone) => (
            <View
              key={zone.name}
              style={styles.zoneSection}
            >
              <View style={styles.sectionHeader}>
                <ThemedText type="smallBold">
                  {zone.name}
                </ThemedText>

                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                >
                  {zone.equipment.length} items
                </ThemedText>
              </View>

              <View style={styles.regularGrid}>
                {zone.equipment.map((item) => (
                  <View
                    key={item.id}
                    style={styles.regularTile}
                  >
                    {renderTile(
                      item,
                      'regular'
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },

  section: {
    gap: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  floorFrame: {
    width: '100%',
    padding: FLOOR_PADDING,
    borderWidth: 1,
    borderRadius: 16,
  },

  floorCanvas: {
    width: '100%',
    position: 'relative',
  },

  emptyCell: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
  },

  positionedTile: {
    position: 'absolute',
    zIndex: 1,
  },

  zoneSection: {
    gap: 12,
  },

  regularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  regularTile: {
    width: '31%',
  },
});

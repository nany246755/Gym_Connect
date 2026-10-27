
import type { Equipment } from '@/types/equipment';

// The reference layout uses four columns.
export const FLOOR_COLUMNS = 4;

// Limit layout dimensions to avoid malformed saved
// positions creating an extremely large screen.
const MAX_FLOOR_ROWS = 24;
const MAX_ROW_SPAN = 6;

export type FloorPosition = {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
};

export type PlacedEquipment = {
  equipment: Equipment;
  position: FloorPosition;
};

export type EquipmentFloorLayout = {
  placed: PlacedEquipment[];
  unplaced: Equipment[];
  rowCount: number;
};

// Convert equipment records into a valid floor layout.
//
// Invalid or overlapping positions are not discarded.
// The affected equipment remains in the unplaced list.
export function createEquipmentFloorLayout(
  equipment: Equipment[]
): EquipmentFloorLayout {
  const placed: PlacedEquipment[] = [];
  const unplaced: Equipment[] = [];

  const occupiedCells = new Set<string>();

  let rowCount = 0;

  for (const item of equipment) {
    const placement = item.floorPlacement;

    // Equipment has not been positioned yet.
    if (!placement) {
      unplaced.push(item);
      continue;
    }

    const position: FloorPosition = {
      row: placement.row,
      column: placement.column,
      rowSpan: placement.rowSpan ?? 1,
      columnSpan: placement.columnSpan ?? 1,
    };

    const {
      row,
      column,
      rowSpan,
      columnSpan,
    } = position;

    const valid =
      Number.isInteger(row) &&
      Number.isInteger(column) &&
      Number.isInteger(rowSpan) &&
      Number.isInteger(columnSpan) &&
      row >= 1 &&
      column >= 1 &&
      rowSpan >= 1 &&
      columnSpan >= 1 &&
      row + rowSpan - 1 <= MAX_FLOOR_ROWS &&
      rowSpan <= MAX_ROW_SPAN &&
      column + columnSpan - 1 <= FLOOR_COLUMNS;

    if (!valid) {
      unplaced.push(item);
      continue;
    }

    // Identify all cells occupied by this equipment.
    const cells: string[] = [];

    for (let r = row; r < row + rowSpan; r++) {
      for (
        let c = column;
        c < column + columnSpan;
        c++
      ) {
        cells.push(`${r}:${c}`);
      }
    }

    // Prevent equipment tiles from overlapping.
    const overlaps = cells.some(
      (cell) => occupiedCells.has(cell)
    );

    if (overlaps) {
      unplaced.push(item);
      continue;
    }

    // Reserve the cells.
    for (const cell of cells) {
      occupiedCells.add(cell);
    }

    placed.push({
      equipment: item,
      position,
    });

    rowCount = Math.max(
      rowCount,
      row + rowSpan - 1
    );
  }

  return {
    placed,
    unplaced,
    rowCount,
  };
}

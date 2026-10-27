
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getEquipment } from '@/services/equipment-service';

import type { EquipmentStatus } from '@/types/equipment';

// A member can report these three statuses.
// Maintenance remains controlled by Admin.
export type ReportableEquipmentStatus = Extract<
  EquipmentStatus,
  'Available' | 'Occupied' | 'AvailableSoon'
>;

// One submitted equipment status report.
export type EquipmentStatusReport = {
  id: string;
  equipmentId: string;
  branchId: string;

  reportedStatus: ReportableEquipmentStatus;

  // Optional message submitted by the member.
  note: string;

  reportedAt: string;

  // Reports await future Admin review.
  reviewStatus: 'Pending';
};

// Input required when submitting a report.
export type SubmitEquipmentReportInput = {
  equipmentId: string;
  reportedStatus: ReportableEquipmentStatus;
  note?: string;
};

// Separate storage from the equipment inventory.
const REPORTS_STORAGE_KEY = 'equipment_status_reports';

export const MAX_EQUIPMENT_REPORT_NOTE_LENGTH = 250;

// Load previously submitted reports.
export async function listEquipmentReports(
  equipmentId?: string
): Promise<EquipmentStatusReport[]> {
  const stored = await AsyncStorage.getItem(
    REPORTS_STORAGE_KEY
  );

  if (!stored) {
    return [];
  }

  const parsed: unknown = JSON.parse(stored);

  if (!Array.isArray(parsed)) {
    throw new Error(
      'Stored equipment reports are invalid.'
    );
  }

  const reports = parsed as EquipmentStatusReport[];

  if (!equipmentId) {
    return reports;
  }

  return reports.filter(
    (report) => report.equipmentId === equipmentId
  );
}

// Submit a member's observation about equipment.
//
// IMPORTANT:
// This saves a report, not an equipment status change.
// The Admin-controlled equipment record is not modified.
export async function submitEquipmentReport(
  input: SubmitEquipmentReportInput
): Promise<EquipmentStatusReport> {
  const equipmentId = input.equipmentId.trim();
  const note = (input.note ?? '').trim();

  // Validate equipment ID.
  if (!equipmentId) {
    throw new Error('No equipment was selected.');
  }

  // Validate the reported status.
  if (
    input.reportedStatus !== 'Available' &&
    input.reportedStatus !== 'Occupied' &&
    input.reportedStatus !== 'AvailableSoon'
  ) {
    throw new Error('Invalid equipment status.');
  }

  // Validate optional note.
  if (
    note.length > MAX_EQUIPMENT_REPORT_NOTE_LENGTH
  ) {
    throw new Error(
      `The note cannot exceed ${MAX_EQUIPMENT_REPORT_NOTE_LENGTH} characters.`
    );
  }

  // Verify that this machine exists in shared equipment data.
  const equipment = await getEquipment(equipmentId);

  if (!equipment) {
    throw new Error(
      'This equipment could not be found.'
    );
  }

  // Create the member report.
  const report: EquipmentStatusReport = {
    id: `report-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`,

    equipmentId: equipment.id,
    branchId: equipment.branchId,

    reportedStatus: input.reportedStatus,
    note,

    reportedAt: new Date().toISOString(),
    reviewStatus: 'Pending',
  };

  // Read existing reports.
  const existingReports =
    await listEquipmentReports();

  // Save the new report alongside older reports.
  await AsyncStorage.setItem(
    REPORTS_STORAGE_KEY,
    JSON.stringify([
      ...existingReports,
      report,
    ])
  );

  return report;
}

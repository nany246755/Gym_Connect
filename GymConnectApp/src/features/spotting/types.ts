
export type SpottingStatus =
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'expired'
  | 'cancelled';

export type CancellationReason =
  | 'No longer need assistance'
  | 'Spotter unavailable'
  | 'Leaving the gym'
  | 'Other';

export interface SpottingRequest {
  id: string;

  // Member information
  requesterId: string;
  requesterName: string;

  // Gym information
  branchId: string;
  exercise: string;
  equipmentId: string;
  location: string;
  weightKg?: number;

  // Timing
  createdAt: number;
  expiresAt: number;

  // Request management
  status: SpottingStatus;
  acceptedBy?: string;
  acceptedAt?: number;
  completedAt?: number;
  cancelledBy?: string;
  cancellationReason?: CancellationReason;
}

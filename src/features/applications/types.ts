/**
 * Application tracking domain types. Mirror the Laravel ApplicationResource
 * shape exactly — a backend field rename should fail the frontend build.
 *
 * The status enum mirrors App\Enums\ApplicationStatus (same six literals
 * as JobStatus; kept separate so this feature stays self-contained).
 */

export const APPLICATION_STATUSES = [
  'saved',
  'preparing',
  'applied',
  'interview',
  'offer',
  'rejected',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type Application = {
  id: number;
  job_id: number;
  status: ApplicationStatus;
  notes: string | null;
  applied_date: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateApplicationInput = {
  status?: ApplicationStatus;
  notes?: string;
  applied_date?: string;
};

export type UpdateApplicationInput = Partial<CreateApplicationInput>;

/**
 * Capture domain types. Mirror the Laravel JobCaptureResource shape —
 * plus the `meta.job` payload the controller attaches when inline AI
 * processing succeeds, so the client can redirect to the new job.
 */

export const CAPTURE_TYPES = ['text', 'pdf', 'image', 'url'] as const;

export type CaptureType = (typeof CAPTURE_TYPES)[number];

export type CaptureStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type JobCapture = {
  id: number;
  type: CaptureType;
  status: CaptureStatus;
  content: string | null;
  file_path: string | null;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
};

export type CaptureResult = {
  capture: JobCapture;
  /** Full job payload when inline processing succeeded; null on failure. */
  job: import('@/features/jobs/types').Job | null;
};

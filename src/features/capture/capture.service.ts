import { ensureCsrfCookie, http } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';
import type { Job } from '@/features/jobs/types';
import type {
  CaptureResult,
  CaptureType,
  JobCapture,
} from '@/features/capture/types';

/**
 * Capture service over POST /api/v1/job-captures.
 *
 * Text/URL submit JSON; PDF/image submit multipart/form-data.
 * The backend processes every type synchronously and returns
 * `meta.job` (the created Job) on success — the client reads that
 * for the redirect instead of guessing or polling.
 */

type CaptureEnvelope = ApiEnvelope<JobCapture> & {
  meta: ApiEnvelope<JobCapture>['meta'] & { job: Job | null };
};

function toResult(data: CaptureEnvelope): CaptureResult {
  return { capture: data.data, job: data.meta.job ?? null };
}

export async function createTextCapture(content: string): Promise<CaptureResult> {
  await ensureCsrfCookie();
  const { data } = await http.post<CaptureEnvelope>('/job-captures', {
    type: 'text',
    content,
  });

  return toResult(data);
}

export async function createUrlCapture(url: string): Promise<CaptureResult> {
  await ensureCsrfCookie();
  const { data } = await http.post<CaptureEnvelope>('/job-captures', {
    type: 'url',
    content: url,
  });

  return toResult(data);
}

export async function createFileCapture(
  type: Extract<CaptureType, 'pdf' | 'image'>,
  file: File,
  onUploadProgress?: (percent: number) => void,
): Promise<CaptureResult> {
  await ensureCsrfCookie();

  const form = new FormData();
  form.append('type', type);
  form.append('file', file, file.name);

  const { data } = await http.post<CaptureEnvelope>('/job-captures', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total && onUploadProgress) {
        onUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  return toResult(data);
}

import { http } from '@/lib/api';
import { AI_REQUEST_TIMEOUT_MS } from '@/services/http';
import type { ApiEnvelope } from '@/types/api';
import type { Resume, ResumeMatch } from '@/features/resume/types';

/**
 * Resume intelligence service over the Laravel Resumes API.
 *
 * Upload is multipart/form-data POST /resumes — the backend runs the
 * extraction + AI analysis pipeline synchronously and returns the final
 * status (completed | failed) in the same round trip.
 * Matching is a job-scoped POST that upserts the latest result.
 */

/** Envelope for upload responses — the backend adds `error` to meta. */
type ResumeEnvelope = ApiEnvelope<Resume> & {
  meta: ApiEnvelope<Resume>['meta'] & { error?: string | null };
};

export type UploadResumeResult = {
  resume: Resume;
  error: string | null;
};

export async function getResumes(): Promise<Resume[]> {
  const { data } = await http.get<ApiEnvelope<Resume[]>>('/resumes');

  return data.data;
}

export async function getResume(id: number): Promise<Resume> {
  const { data } = await http.get<ApiEnvelope<Resume>>(`/resumes/${id}`);

  return data.data;
}

export async function uploadResume(
  file: File,
  title?: string,
  onUploadProgress?: (percent: number) => void,
): Promise<UploadResumeResult> {
  const form = new FormData();
  form.append('file', file, file.name);
  if (title) {
    form.append('title', title);
  }

  const { data } = await http.post<ResumeEnvelope>('/resumes', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Upload plus a full resume extraction/analysis on the server.
    timeout: AI_REQUEST_TIMEOUT_MS,
    onUploadProgress: (event) => {
      if (event.total && onUploadProgress) {
        onUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  return { resume: data.data, error: data.meta.error ?? null };
}

export async function matchResumeToJob(
  jobId: number,
  resumeId: number,
): Promise<ResumeMatch> {
  const { data } = await http.post<ApiEnvelope<ResumeMatch>>(
    `/jobs/${jobId}/match-resume/${resumeId}`,
    undefined,
    { timeout: AI_REQUEST_TIMEOUT_MS },
  );

  return data.data;
}

import { http } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';
import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/features/applications/types';

/**
 * Application tracking service over the Laravel Applications API.
 *
 * Index/store are job-scoped (`/jobs/{job}/applications`); show/update/
 * delete are flat (`/applications/{application}`). Updates use PATCH
 * (partial update semantics).
 */

export async function getApplications(jobId: number): Promise<Application[]> {
  const { data } = await http.get<ApiEnvelope<Application[]>>(
    `/jobs/${jobId}/applications`,
  );

  return data.data;
}

export async function createApplication(
  jobId: number,
  input: CreateApplicationInput,
): Promise<Application> {
  const { data } = await http.post<ApiEnvelope<Application>>(
    `/jobs/${jobId}/applications`,
    input,
  );

  return data.data;
}

export async function updateApplication(
  id: number,
  input: UpdateApplicationInput,
): Promise<Application> {
  const { data } = await http.patch<ApiEnvelope<Application>>(
    `/applications/${id}`,
    input,
  );

  return data.data;
}

export async function deleteApplication(id: number): Promise<void> {
  await http.delete(`/applications/${id}`);
}

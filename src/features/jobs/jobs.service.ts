import { http } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';
import type {
  Job,
  JobsPagination,
  JobsQueryParams,
  UpdateJobInput,
} from '@/features/jobs/types';

/**
 * Job CRUD service over the Laravel Jobs API.
 *
 * Backend supports: status, company, location filters + pagination.
 * Free-text search (title/company/location) is applied client-side in
 * `hooks.ts` because the API has no `search` param — see `filterJobsBySearch`.
 *
 * NOTE: the API surface is PUT/PATCH for update, DELETE for destroy.
 * This module uses PATCH (partial update semantics).
 */

type PaginatedEnvelope = ApiEnvelope<Job[]> & {
  meta: { pagination: JobsPagination };
};

export async function getJobs(params: JobsQueryParams = {}) {
  const query: Record<string, string | number> = {};

  if (params.status && params.status !== 'all') {
    query.status = params.status;
  }
  if (params.company) {
    query.company = params.company;
  }
  if (params.location) {
    query.location = params.location;
  }
  if (params.page) {
    query.page = params.page;
  }
  if (params.per_page) {
    query.per_page = params.per_page;
  }

  const { data } = await http.get<PaginatedEnvelope>('/jobs', {
    params: query,
  });

  return {
    jobs: data.data,
    pagination: data.meta.pagination,
  };
}

export async function getJob(id: number): Promise<Job> {
  const { data } = await http.get<ApiEnvelope<Job>>(`/jobs/${id}`);

  return data.data;
}

export async function updateJob(
  id: number,
  input: UpdateJobInput,
): Promise<Job> {
  const { data } = await http.patch<ApiEnvelope<Job>>(`/jobs/${id}`, input);

  return data.data;
}

export async function deleteJob(id: number): Promise<void> {
  await http.delete(`/jobs/${id}`);
}

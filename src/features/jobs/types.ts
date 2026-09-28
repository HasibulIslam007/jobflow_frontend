/**
 * Job domain types. Mirror the Laravel JobResource shape exactly —
 * a backend field rename should fail the frontend build, not production.
 */

export const JOB_STATUSES = [
  'saved',
  'preparing',
  'applied',
  'interview',
  'offer',
  'rejected',
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export type JobSkill = {
  id: number;
  skill_name: string;
};

export type JobApplication = {
  id: number;
  status: string;
  notes: string | null;
  applied_date: string | null;
  created_at: string;
};

export type JobReminder = {
  id: number;
  notification_days: number | null;
  reminder_date: string;
  sent_at: string | null;
  status: string;
  created_at: string;
};

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  description: string | null;
  deadline: string | null;
  source_type: string;
  source_url: string | null;
  status: JobStatus;
  ai_confidence_score: number | null;
  job_quality_score: number | null;
  missing_fields: string[];
  skills?: JobSkill[];
  applications?: JobApplication[];
  reminders?: JobReminder[];
  created_at: string;
};

export type JobsQueryParams = {
  status?: JobStatus | 'all';
  search?: string;
  company?: string;
  location?: string;
  page?: number;
  per_page?: number;
};

export type JobsPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type JobsResponse = {
  jobs: Job[];
  pagination: JobsPagination;
};

export type UpdateJobInput = Partial<
  Pick<
    Job,
    | 'title'
    | 'company'
    | 'location'
    | 'salary'
    | 'description'
    | 'deadline'
    | 'source_type'
    | 'source_url'
    | 'status'
  >
>;

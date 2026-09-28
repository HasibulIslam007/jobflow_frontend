/**
 * Resume intelligence domain types. Mirror the Laravel ResumeResource /
 * ResumeMatchResource shapes exactly — a backend field rename should fail
 * the frontend build, not production.
 */

export const RESUME_STATUSES = [
  'uploaded',
  'processing',
  'completed',
  'failed',
] as const;

export type ResumeStatus = (typeof RESUME_STATUSES)[number];

export type ResumeExperienceItem = {
  title?: string;
  company?: string;
  period?: string;
  highlights?: string[];
};

export type ResumeEducationItem = {
  degree?: string;
  institution?: string;
  year?: string;
};

export type ResumeProjectItem = {
  name?: string;
  description?: string;
};

export type ResumeAnalysis = {
  summary: string;
  skills: string[];
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  projects: ResumeProjectItem[];
  missing_information: string[];
};

/** GET/POST /api/v1/resumes — ResumeResource (+ error in meta on failure). */
export type Resume = {
  id: number;
  title: string;
  file_type: string;
  status: ResumeStatus;
  ai_score: number | null;
  analysis: ResumeAnalysis | null;
  created_at: string;
};

/** POST /api/v1/jobs/{job}/match-resume/{resume} — ResumeMatchResource. */
export type ResumeMatch = {
  id: number;
  resume_id: number;
  job_id: number;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  created_at: string;
};

/** Resume upload UI states (local, during the multipart request). */
export type UploadState =
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'completed'
  | 'failed';

/**
 * AI Career Analytics domain types. Mirror GET /api/v1/analytics exactly — a
 * backend field rename should fail the frontend build, not production.
 *
 * Every field here is a real aggregate over the signed-in user's own records.
 * There are no projections, estimates or "trends": the API returns what the
 * database holds, and the UI is responsible for not implying more than that.
 */

export type CareerFactorKey = 'resume' | 'activity' | 'conversion' | 'matching';

export type CareerFactor = {
  key: CareerFactorKey;
  label: string;
  /** This factor's contribution before weighting, 0–100. */
  score: number;
  /** Share of the total score this factor carries, e.g. 30 for 30%. */
  weight: number;
};

export type CareerScore = {
  score: number;
  /** "Needs Improvement" | "Developing" | "Strong Candidate" | "Excellent". */
  label: string;
  /** Per-factor breakdown backing `score`; empty only if the API omitted it. */
  factors: CareerFactor[];
};

export type ApplicationMetrics = {
  total_applications: number;
  /** Percentage of applications an employer responded to at all. */
  response_rate: number;
  /** Percentage currently sitting at interview. */
  interview_rate: number;
  /** Percentage currently holding an offer. */
  offer_rate: number;
  /**
   * Mean days between `applied_date` and the last change to an application
   * that moved past `applied`.
   *
   * The API has no `responded_at` column, so this is a documented proxy
   * (applied_date → updated_at), and the UI labels it as such. `null` means
   * nothing has progressed far enough to measure — which is a different claim
   * from "0 days", and the two must never be conflated.
   */
  average_days_to_response: number | null;
};

/**
 * Stage tallies for the user's *tracked jobs* (`user_jobs.status`).
 *
 * IMPORTANT: this is a different population from `ApplicationMetrics`. A user
 * can hold 40 saved jobs and have sent 2 applications. The two blocks are kept
 * apart by the API and labelled apart by the UI, so the two "applied" numbers
 * on the analytics page never contradict each other.
 */
export type JobStage = {
  saved: number;
  preparing: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
};

export type SkillImportance = 'high' | 'medium' | 'low';

export type SkillGap = {
  /** Display casing exactly as the job listed it, e.g. "Node.js". */
  skill: string;
  /** How many of the user's saved jobs require it. */
  frequency: number;
  importance: SkillImportance;
  /** Percentage of the user's saved jobs that require it. */
  share: number;
};

export type TopRole = {
  /** Normalised role label, e.g. "Backend Engineer". */
  role: string;
  /** How many saved jobs fall into this bucket. */
  count: number;
  /** Percentage of saved jobs in this bucket. */
  share: number;
};

export type InsightType =
  | 'skill'
  | 'activity'
  | 'resume'
  | 'conversion'
  | 'role'
  | 'matching'
  | 'getting_started';

export type CareerInsight = {
  type: InsightType;
  /** Complete sentence, always quoting a real figure from the user's data. */
  message: string;
};

export type AnalyticsData = {
  career_score: CareerScore;
  application_metrics: ApplicationMetrics;
  /** Job-status pipeline — see JobStage. */
  pipeline: JobStage;
  skill_gaps: SkillGap[];
  top_roles: TopRole[];
  ai_insights: CareerInsight[];
};

/**
 * True when the user has nothing recorded yet.
 *
 * Drives the empty state: a brand-new account should be told what to do, not
 * shown a wall of zeroes that look like a failing grade.
 */
export function hasAnalyticsData(data: AnalyticsData): boolean {
  return (
    data.application_metrics.total_applications > 0 ||
    data.top_roles.length > 0 ||
    data.skill_gaps.length > 0 ||
    data.career_score.score > 0
  );
}

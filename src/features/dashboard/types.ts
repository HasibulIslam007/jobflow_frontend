/**
 * Dashboard domain types. Mirror GET /api/v1/dashboard exactly —
 * a backend field rename should fail the frontend build, not production.
 */

export type DashboardStats = {
  total_jobs: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
};

export type UpcomingDeadline = {
  id: number;
  title: string;
  company: string;
  deadline: string;
  status: string;
  days_remaining: number;
};

export type RecentCapture = {
  id: number;
  type: 'text' | 'pdf' | 'image' | 'url';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  content: string | null;
  file_path: string | null;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
};

export type AiInsights = {
  average_confidence: number | null;
  average_quality_score: number | null;
  missing_information_count: number;
};

export type DashboardData = {
  stats: DashboardStats;
  upcoming_deadlines: UpcomingDeadline[];
  recent_captures: RecentCapture[];
  ai_insights: AiInsights;
};

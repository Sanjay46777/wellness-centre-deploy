export type UserRole = 'student' | 'head_counsellor' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  student_id?: string | null;
  phone?: string | null;
  status: UserStatus;
  created_at?: string;
}

export interface Counsellor {
  id: number;
  name: string;
  designation?: string | null;
  specialization?: string | null;
  email?: string | null;
  is_active: boolean;
  team?: string | null;
}

export interface Feedback {
  id: number;
  counsellor_id: number;
  user_id?: number | null;
  submitted_at: string;
  q1_comfort?: number | null;
  q2_understood?: number | null;
  q3_time?: number | null;
  q4_quality?: number | null;
  q5_respected?: number | null;
  q6_supported?: number | null;
  q7_hopeful?: number | null;
  q8_safe?: number | null;
  q9_communication?: number | null;
  q10_overall?: number | null;
  recommendation?: 'Yes' | 'No' | 'Maybe' | null;
  comments?: string | null;
  is_anonymous: boolean;
  respondent_email?: string | null;
  counsellor_name?: string;
  designation?: string | null;
  team?: string | null;
  student_id?: string | null;
  student_name?: string | null;
  student_email?: string | null;
}

export type DateRange = 'week' | 'month' | 'all' | 'custom';

export const FEEDBACK_QUESTIONS = [
  { key: 'q1_comfort', label: 'Comfort expressing thoughts' },
  { key: 'q2_understood', label: 'Felt understood' },
  { key: 'q3_time', label: 'Given enough time' },
  { key: 'q4_quality', label: 'Overall quality of session' },
  { key: 'q5_respected', label: 'Felt respected' },
  { key: 'q6_supported', label: 'Felt emotionally supported' },
  { key: 'q7_hopeful', label: 'Felt hopeful after session' },
  { key: 'q8_safe', label: 'Environment felt safe' },
  { key: 'q9_communication', label: 'Communication was clear' },
  { key: 'q10_overall', label: 'Overall experience' },
] as const;

export interface AnalyticsSummary {
  total_feedback: number;
  avg_rating: number;
  recommendation: {
    counts: { Yes: number; No: number; Maybe: number };
    total: number;
    yesPct: number;
  };
  monthly_trend: { month: string; avg: number; count: number }[];
  question_averages: { label: string; value: number }[];
  feedback: Feedback[];
  flagged_counsellors?: {
    counsellor_id: number;
    name: string;
    designation: string | null;
    team: string | null;
    avg_rating: number;
    feedback_count: number;
  }[];
}

export interface LeaderboardEntry {
  counsellor_id: number;
  name: string;
  designation: string | null;
  team: string | null;
  avg_rating: number;
  feedback_count: number;
  recommendation_percentage: number;
}

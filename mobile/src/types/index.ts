export type UserRole = 'client' | 'student' | 'counsellor' | 'head_counsellor' | 'admin';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  student_id: string | null;
  phone: string | null;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type Counsellor = {
  id: string;
  profile_id: string | null;
  name: string;
  designation: string | null;
  specialization: string | null;
  email: string | null;
  photo_url: string | null;
  qr_code_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Feedback = {
  id: string;
  counsellor_id: string;
  user_id: string | null;
  submitted_at: string;
  q1_comfort: number | null;
  q2_understood: number | null;
  q3_time: number | null;
  q4_quality: number | null;
  q5_respected: number | null;
  q6_supported: number | null;
  q7_hopeful: number | null;
  q8_safe: number | null;
  q9_communication: number | null;
  q10_overall: number | null;
  recommendation: 'Yes' | 'No' | 'Maybe' | null;
  comments: string | null;
  is_anonymous: boolean;
  respondent_email: string | null;
  profiles?: {
    full_name: string | null;
    student_id: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

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

export type DateRange = 'week' | 'month' | 'all' | 'custom';

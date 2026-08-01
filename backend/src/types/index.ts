export type UserRole = 'student' | 'head_counsellor' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  student_id?: string | null;
  phone?: string | null;
  email_verified: boolean;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Counsellor {
  id: number;
  name: string;
  designation?: string | null;
  specialization?: string | null;
  email?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
}

export interface PublicUser {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  student_id?: string | null;
  phone?: string | null;
  status: UserStatus;
}

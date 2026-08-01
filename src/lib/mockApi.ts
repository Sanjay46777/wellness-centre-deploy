import { type Counsellor, type Feedback, type User } from '@/types';
import {
  averageRating,
  recommendationBreakdown,
  monthlyTrend,
  questionAveragesForChart,
  isInRange,
} from '@/lib/analytics';

const mockUsers: User[] = [
  { id: 1, email: 'wellness1@smail.iitm.ac.in', full_name: 'Saranraj R', role: 'admin', status: 'approved' },
  { id: 2, email: 'wo@smail.iitm.ac.in', full_name: 'Colonel R Balaji', role: 'head_counsellor', status: 'approved' },
];

const passwords: Record<string, string> = {
  'wellness1@smail.iitm.ac.in': '0&nMlqX3&yFkkHVx',
  'wo@smail.iitm.ac.in': '6hxkTs&1*CuE&ot@',
};

const mockCounsellors: Counsellor[] = [
  { id: 1, name: 'Ms. Raksha', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnesswc1@smail.iitm.ac.in', is_active: true, team: 'Team B' },
  { id: 2, name: 'Logeshwaran T', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnesswc2@smail.iitm.ac.in', is_active: true, team: 'Team B' },
  { id: 3, name: 'Geetanjali', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnesswc3@smail.iitm.ac.in', is_active: true, team: 'Team B' },
  { id: 4, name: 'Akshaya', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnesswc4@smail.iitm.ac.in', is_active: true, team: 'Team B' },
  { id: 5, name: 'Blessing Calvin', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnesswc5@smail.iitm.ac.in', is_active: true, team: 'Team B' },
  { id: 6, name: 'Durga Devi S', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnesswc6@smail.iitm.ac.in', is_active: true, team: 'Team A' },
  { id: 7, name: 'Karthick R', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnessc1@smail.iitm.ac.in', is_active: true, team: 'Team A' },
  { id: 8, name: 'Govardhan S', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnessc2@smail.iitm.ac.in', is_active: true, team: 'Team A' },
  { id: 9, name: 'Nirmalraj B', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnessc3@smail.iitm.ac.in', is_active: true, team: 'Team A' },
  { id: 10, name: 'Srinivasan E', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnessc4@smail.iitm.ac.in', is_active: true, team: 'Team A' },
  { id: 11, name: 'Aaarathy', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnessc5@smail.iitm.ac.in', is_active: true, team: 'Team A' },
  { id: 12, name: 'Revathy', designation: 'Counsellor', specialization: 'Wellness', email: 'wellnessc6@smail.iitm.ac.in', is_active: true, team: 'Team A' },
];

const mockFeedback: Feedback[] = [];

let currentUser: User | null = null;

interface MockResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used_at: string | null;
}

const mockTokens: MockResetToken[] = [];

function generateToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function withFeedbackDetails(items: Feedback[]) {
  return items.map((i) => {
    const user = i.user_id ? mockUsers.find((u) => u.id === i.user_id) : undefined;
    return {
      ...i,
      counsellor_name: mockCounsellors.find((c) => c.id === i.counsellor_id)?.name || 'Unknown',
      student_id: user?.student_id || null,
      student_name: user?.full_name || null,
      student_email: user?.email || null,
    };
  });
}

function filterItems(range: string, start?: string, end?: string, team?: string) {
  let items = mockFeedback;
  if (range && range !== 'all') {
    const customStart = range === 'custom' && start ? new Date(start) : undefined;
    const customEnd = range === 'custom' && end ? new Date(end) : undefined;
    items = items.filter((i) => isInRange(i.submitted_at, range as any, customStart, customEnd));
  }
  if (team) {
    items = items.filter((i) => {
      const c = mockCounsellors.find((c) => c.id === i.counsellor_id);
      return c?.team === team;
    });
  }
  return items;
}

function computeStats(items: Feedback[]) {
  return {
    total_feedback: items.length,
    avg_rating: Number(averageRating(items).toFixed(2)),
    recommendation: recommendationBreakdown(items),
    monthly_trend: monthlyTrend(items),
    question_averages: questionAveragesForChart(items),
  };
}

export const mockApi = {
  async get(url: string, _data?: any, params?: Record<string, any>) {
    const [path] = url.split('?');
    const searchParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
    const range = (params?.range || searchParams.get('range')) || 'all';
    const start = (params?.start || searchParams.get('start')) || undefined;
    const end = (params?.end || searchParams.get('end')) || undefined;
    const team = (params?.team || searchParams.get('team')) || undefined;

    if (path === '/auth/me') {
      if (!currentUser) throw new Error('Unauthorized');
      return { user: currentUser };
    }
    if (path === '/counsellors') {
      return { counsellors: mockCounsellors };
    }
    if (path.startsWith('/counsellors/')) {
      const id = Number(path.split('/')[2]);
      return { counsellor: mockCounsellors.find((c) => c.id === id) };
    }
    if (path === '/feedback/my-history') {
      const items = mockFeedback
        .filter((f) => f.user_id === currentUser?.id)
        .map((f) => ({ ...f, counsellor_name: mockCounsellors.find((c) => c.id === f.counsellor_id)?.name }));
      return { feedback: items };
    }
    if (path === '/analytics/institution') {
      const items = filterItems(range, start, end, team);
      const stats = computeStats(items);
      const grouped = new Map<number, { id: number; name: string; designation: string; team: string; items: Feedback[] }>();
      for (const item of items) {
        const c = mockCounsellors.find((c) => c.id === item.counsellor_id)!;
        let g = grouped.get(c.id);
        if (!g) {
          g = { id: c.id, name: c.name, designation: c.designation || '', team: c.team || '', items: [] };
          grouped.set(c.id, g);
        }
        g.items.push(item);
      }
      const flagged = Array.from(grouped.values())
        .map((g) => ({ counsellor_id: g.id, name: g.name, designation: g.designation, team: g.team, avg_rating: Number(averageRating(g.items).toFixed(2)), feedback_count: g.items.length }))
        .filter((g) => g.avg_rating < 3.2)
        .sort((a, b) => a.avg_rating - b.avg_rating);
      return { ...stats, feedback: withFeedbackDetails(items), flagged_counsellors: flagged };
    }
    if (path.startsWith('/analytics/counsellor/')) {
      const id = Number(path.split('/')[3]);
      const items = filterItems(range, start, end).filter((i) => i.counsellor_id === id);
      return { counsellor: mockCounsellors.find((c) => c.id === id), ...computeStats(items), feedback: withFeedbackDetails(items) };
    }
    if (path === '/analytics/leaderboard') {
      const items = filterItems(range, start, end, team);
      const grouped = new Map<number, { id: number; name: string; designation: string; team: string; items: Feedback[] }>();
      for (const item of items) {
        const c = mockCounsellors.find((c) => c.id === item.counsellor_id)!;
        let g = grouped.get(c.id);
        if (!g) {
          g = { id: c.id, name: c.name, designation: c.designation || '', team: c.team || '', items: [] };
          grouped.set(c.id, g);
        }
        g.items.push(item);
      }
      const leaderboard = Array.from(grouped.values())
        .map((g) => {
          const rec = recommendationBreakdown(g.items);
          return { counsellor_id: g.id, name: g.name, designation: g.designation, team: g.team, avg_rating: Number(averageRating(g.items).toFixed(2)), feedback_count: g.items.length, recommendation_percentage: rec.yesPct };
        })
        .sort((a, b) => b.avg_rating - a.avg_rating);
      return { leaderboard };
    }
    if (path === '/admin/pending-registrations') {
      if (currentUser?.role !== 'admin') throw new Error('Forbidden');
      return { registrations: mockUsers.filter((u) => u.role === 'head_counsellor' && u.status === 'pending') };
    }
    if (path.startsWith('/qr-code/')) {
      const id = path.split('/')[2];
      return { feedback_url: `${window.location.origin}/feedback?cid=${id}`, counsellor_id: id };
    }
    throw new Error(`Mock GET not implemented: ${url}`);
  },

  async delete(url: string, _data?: any, _params?: Record<string, any>) {
    const [path] = url.split('?');
    if (path.startsWith('/counsellors/')) {
      const id = Number(path.split('/')[2]);
      const idx = mockCounsellors.findIndex((c) => c.id === id);
      if (idx !== -1) {
        mockCounsellors.splice(idx, 1);
        // remove associated feedback
        for (let i = mockFeedback.length - 1; i >= 0; i--) {
          if (mockFeedback[i].counsellor_id === id) mockFeedback.splice(i, 1);
        }
      }
      return { message: 'Counsellor deleted' };
    }
    if (path.startsWith('/admin/students/')) {
      const id = Number(path.split('/')[3]);
      const idx = mockUsers.findIndex((u) => u.id === id && u.role === 'student');
      if (idx !== -1) mockUsers.splice(idx, 1);
      for (let i = mockFeedback.length - 1; i >= 0; i--) {
        if (mockFeedback[i].user_id === id) mockFeedback[i].user_id = null;
      }
      return { message: 'Student deleted' };
    }
    throw new Error(`Mock DELETE not implemented: ${url}`);
  },

  async post(url: string, data: any, _params?: Record<string, any>) {
    const [path] = url.split('?');
    if (path === '/auth/login') {
      const { email, password, role } = data;
      if (passwords[email] !== password) throw new Error('Invalid email or password');
      const user = mockUsers.find((u) => u.email === email && u.role === role);
      if (!user) throw new Error('Invalid email or password');
      if (user.status === 'pending') throw new Error('Your account is pending approval');
      if (user.status === 'rejected') throw new Error('Your registration was rejected');
      currentUser = user;
      return { token: 'mock-token', user };
    }
    if (path === '/auth/register/student') {
      const { email, password, full_name, student_id } = data;
      mockUsers.push({ id: mockUsers.length + 1, email, full_name, role: 'student', student_id, status: 'approved' });
      if (password) passwords[email] = password;
      return { message: 'Registration successful', user_id: mockUsers.length };
    }
    if (path === '/auth/register/head-counsellor') {
      const { email, password, full_name } = data;
      mockUsers.push({ id: mockUsers.length + 1, email, full_name, role: 'head_counsellor', status: 'pending' });
      if (password) passwords[email] = password;
      return { message: 'Registration submitted', user_id: mockUsers.length, status: 'pending' };
    }
    if (path === '/counsellors') {
      const c = { id: mockCounsellors.length + 1, ...data, is_active: true };
      mockCounsellors.push(c);
      return { message: 'Counsellor created', counsellor_id: c.id };
    }
    if (path.startsWith('/counsellors/')) {
      const id = Number(path.split('/')[2]);
      const idx = mockCounsellors.findIndex((c) => c.id === id);
      if (idx !== -1) mockCounsellors[idx] = { ...mockCounsellors[idx], ...data };
      return { message: 'Counsellor updated' };
    }
    if (path === '/feedback') {
      const f = {
        id: mockFeedback.length + 1,
        ...data,
        user_id: currentUser?.id ?? null,
        submitted_at: new Date().toISOString(),
      };
      mockFeedback.push(f);
      return { message: 'Feedback submitted', feedback_id: f.id };
    }
    if (path.startsWith('/admin/approve-registration/')) {
      if (currentUser?.role !== 'admin') throw new Error('Forbidden');
      const id = Number(path.split('/')[3]);
      const u = mockUsers.find((u) => u.id === id);
      if (u) u.status = 'approved';
      return { message: 'Registration approved' };
    }
    if (path.startsWith('/admin/reject-registration/')) {
      if (currentUser?.role !== 'admin') throw new Error('Forbidden');
      const id = Number(path.split('/')[3]);
      const u = mockUsers.find((u) => u.id === id);
      if (u) u.status = 'rejected';
      return { message: 'Registration rejected' };
    }
    if (path === '/auth/forgot-password') {
      const { email, role } = data;
      const user = mockUsers.find((u) => u.email === email && u.role === role);
      if (user) {
        const token = generateToken();
        mockTokens.push({
          id: mockTokens.length + 1,
          user_id: user.id,
          token,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          used_at: null,
        });
        const resetUrl = `${window.location.origin}/reset-password?token=${encodeURIComponent(token)}`;
        console.log('[MOCK EMAIL] Reset your password:', resetUrl);
      }
      return { message: 'If an account exists, a reset link has been sent to your email.' };
    }
    if (path === '/auth/reset-password') {
      const { token, password } = data;
      const record = mockTokens.find((t) => t.token === token);
      if (!record || record.used_at || new Date(record.expires_at) < new Date()) {
        throw new Error('Invalid or expired token');
      }
      const user = mockUsers.find((u) => u.id === record.user_id);
      if (user) {
        passwords[user.email] = password;
      }
      record.used_at = new Date().toISOString();
      return { message: 'Password reset successfully. Please sign in.' };
    }
    throw new Error(`Mock POST not implemented: ${url}`);
  },
};

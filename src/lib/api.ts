import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { mockApi } from '@/lib/mockApi';

const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

function resolveBaseUrl(): string | undefined {
  if (isMock) return undefined;
  const raw = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  if (!raw) return '/api';
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const serverMessage = (error.response?.data as { error?: string } | undefined)?.error;
    if (serverMessage) {
      error.message = serverMessage;
    }
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login?role=student';
    }
    return Promise.reject(error);
  }
);

async function maybeMock<T>(
  method: 'get' | 'post' | 'delete',
  url: string,
  data?: any,
  mockKey?: string,
  params?: Record<string, string | boolean | number | undefined>
): Promise<T> {
  if (isMock && mockKey) {
    return mockApi[method](url, data, params) as Promise<T>;
  }
  const response: AxiosResponse<T> =
    method === 'get'
      ? await apiClient.get(url, { params })
      : method === 'post'
      ? await apiClient.post(url, data)
      : await apiClient.delete(url);
  return response.data;
}

export const authApi = {
  login: (body: { email: string; password: string; role: string }) =>
    maybeMock<{ token: string; user: any }>('post', '/auth/login', body, 'login'),
  registerStudent: (body: any) =>
    maybeMock<{ message: string; user_id: number }>('post', '/auth/register/student', body, 'registerStudent'),
  registerHead: (body: any) =>
    maybeMock<{ message: string; user_id: number; status: string }>(
      'post',
      '/auth/register/head-counsellor',
      body,
      'registerHead'
    ),
  forgotPassword: (body: { email: string; role: string }) =>
    maybeMock<{ message: string }>('post', '/auth/forgot-password', body, 'forgotPassword'),
  resetPassword: (body: { token: string; password: string }) =>
    maybeMock<{ message: string }>('post', '/auth/reset-password', body, 'resetPassword'),
  me: () => maybeMock<{ user: any }>('get', '/auth/me', undefined, 'me'),
};

export const counsellorApi = {
  getAll: (params?: { active?: boolean; search?: string }) =>
    maybeMock<{ counsellors: any[] }>('get', '/counsellors', undefined, 'getCounsellors', params),
  get: (id: number) =>
    maybeMock<{ counsellor: any }>('get', `/counsellors/${id}`, undefined, 'getCounsellor'),
  create: (body: any) =>
    maybeMock<{ message: string; counsellor_id: number }>('post', '/counsellors', body, 'createCounsellor'),
  update: (id: number, body: any) =>
    maybeMock<{ message: string }>('post', `/counsellors/${id}`, body, 'updateCounsellor'),
  delete: (id: number) =>
    maybeMock<{ message: string }>('delete', `/counsellors/${id}`, undefined, 'deleteCounsellor'),
};

export const feedbackApi = {
  submit: (body: any) =>
    maybeMock<{ message: string; feedback_id: number }>('post', '/feedback', body, 'submitFeedback'),
  myHistory: () =>
    maybeMock<{ feedback: any[] }>('get', '/feedback/my-history', undefined, 'myHistory'),
};

export const analyticsApi = {
  institution: (params: { range: string; start?: string; end?: string; team?: string }) =>
    maybeMock<any>('get', '/analytics/institution', undefined, 'institutionAnalytics', params),
  counsellor: (id: number, params: { range: string; start?: string; end?: string }) =>
    maybeMock<any>('get', `/analytics/counsellor/${id}`, undefined, 'counsellorAnalytics', params),
  leaderboard: (params: { range: string; start?: string; end?: string; team?: string }) =>
    maybeMock<{ leaderboard: any[] }>('get', '/analytics/leaderboard', undefined, 'leaderboard', params),
};

export const adminApi = {
  pendingRegistrations: () =>
    maybeMock<{ registrations: any[] }>('get', '/admin/pending-registrations', undefined, 'pendingRegistrations'),
  approve: (userId: number) =>
    maybeMock<{ message: string }>('post', `/admin/approve-registration/${userId}`, {}, 'approve'),
  reject: (userId: number, reason?: string) =>
    maybeMock<{ message: string }>('post', `/admin/reject-registration/${userId}`, { reason }, 'reject'),
  getStudents: () =>
    maybeMock<{ students: any[] }>('get', '/admin/students', undefined, 'getStudents'),
  deleteStudent: (userId: number) =>
    maybeMock<{ message: string }>('delete', `/admin/students/${userId}`, undefined, 'deleteStudent'),
};

export const exportApi = {
  download: (params: { format: string; range: string; start?: string; end?: string; counsellor_id?: number; team?: string }) =>
    apiClient.get('/export', { params, responseType: 'blob' }),
};

export const qrApi = {
  get: (counsellorId: number) =>
    maybeMock<{ feedback_url: string }>('get', `/qr-code/${counsellorId}`, undefined, 'qrCode'),
};

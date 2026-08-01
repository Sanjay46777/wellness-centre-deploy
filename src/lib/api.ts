import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';

function resolveBaseUrl(): string | undefined {
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

export const authApi = {
  login: (body: { email: string; password: string; role: string }) =>
    apiPost<{ token: string; user: any }>('/auth/login', body),
  registerStudent: (body: any) =>
    apiPost<{ message: string; user_id: number }>('/auth/register/student', body),
  registerHead: (body: any) =>
    apiPost<{ message: string; user_id: number; status: string }>('/auth/register/head-counsellor', body),
  forgotPassword: (body: { email: string; role: string }) =>
    apiPost<{ message: string }>('/auth/forgot-password', body),
  resetPassword: (body: { token: string; password: string }) =>
    apiPost<{ message: string }>('/auth/reset-password', body),
  me: () => apiGet<{ user: any }>('/auth/me'),
};

export const counsellorApi = {
  getAll: (params?: { active?: boolean; search?: string }) =>
    apiGet<{ counsellors: any[] }>('/counsellors', params),
  get: (id: number) => apiGet<{ counsellor: any }>(`/counsellors/${id}`),
  create: (body: any) => apiPost<{ message: string; counsellor_id: number }>('/counsellors', body),
  update: (id: number, body: any) => apiPut<{ message: string }>(`/counsellors/${id}`, body),
  delete: (id: number) => apiDelete<{ message: string }>(`/counsellors/${id}`),
};

export const feedbackApi = {
  submit: (body: any) => apiPost<{ message: string; feedback_id: number }>('/feedback', body),
  myHistory: () => apiGet<{ feedback: any[] }>('/feedback/my-history'),
};

export const analyticsApi = {
  institution: (params: { range: string; start?: string; end?: string; team?: string }) =>
    apiGet<any>('/analytics/institution', params),
  counsellor: (id: number, params: { range: string; start?: string; end?: string }) =>
    apiGet<any>(`/analytics/counsellor/${id}`, params),
  leaderboard: (params: { range: string; start?: string; end?: string; team?: string }) =>
    apiGet<{ leaderboard: any[] }>('/analytics/leaderboard', params),
};

export const adminApi = {
  pendingRegistrations: () => apiGet<{ registrations: any[] }>('/admin/pending-registrations'),
  approve: (userId: number) => apiPost<{ message: string }>(`/admin/approve-registration/${userId}`, {}),
  reject: (userId: number, reason?: string) =>
    apiPost<{ message: string }>(`/admin/reject-registration/${userId}`, { reason }),
  getStudents: () => apiGet<{ students: any[] }>('/admin/students'),
  deleteStudent: (userId: number) => apiDelete<{ message: string }>(`/admin/students/${userId}`),
};

export const exportApi = {
  download: (params: { format: string; range: string; start?: string; end?: string; counsellor_id?: number; team?: string }) =>
    apiClient.get('/export', { params, responseType: 'blob' }),
};

export const qrApi = {
  get: (counsellorId: number) =>
    apiGet<{ feedback_url: string }>(`/qr-code/${counsellorId}`),
};

function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  return apiClient.get<T>(url, { params }).then((res: AxiosResponse<T>) => res.data);
}

function apiPost<T>(url: string, data?: unknown): Promise<T> {
  return apiClient.post<T>(url, data).then((res: AxiosResponse<T>) => res.data);
}

function apiPut<T>(url: string, data?: unknown): Promise<T> {
  return apiClient.put<T>(url, data).then((res: AxiosResponse<T>) => res.data);
}

function apiDelete<T>(url: string): Promise<T> {
  return apiClient.delete<T>(url).then((res: AxiosResponse<T>) => res.data);
}

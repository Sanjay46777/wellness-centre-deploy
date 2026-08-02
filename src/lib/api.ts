import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
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
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login?role=student';
    }
    return Promise.reject(error);
  }
);

async function get<T>(url: string, params?: Record<string, string | boolean | number | undefined>): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.get(url, { params });
  return response.data;
}

async function post<T>(url: string, data?: any): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.post(url, data);
  return response.data;
}

async function put<T>(url: string, data?: any): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.put(url, data);
  return response.data;
}

async function del<T>(url: string): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.delete(url);
  return response.data;
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; message?: string; details?: Array<{ path: (string | number)[]; message: string }> } | undefined;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (Array.isArray(data?.details) && data.details.length > 0) {
      return data.details.map((d) => `${d.path.join('.')}: ${d.message}`).join('; ');
    }
  }
  return fallback;
}

export const authApi = {
  login: (body: { email: string; password: string; role: string }) =>
    post<{ token: string; user: any }>('/auth/login', body),
  registerStudent: (body: any) => post<{ message: string; user_id: number }>('/auth/register/student', body),
  registerHead: (body: any) =>
    post<{ message: string; user_id: number; status: string }>('/auth/register/head-counsellor', body),
  forgotPassword: (body: { email: string; role: string }) =>
    post<{ message: string }>('/auth/forgot-password', body),
  resetPassword: (body: { token: string; password: string }) =>
    post<{ message: string }>('/auth/reset-password', body),
  me: () => get<{ user: any }>('/auth/me'),
};

export const counsellorApi = {
  getAll: (params?: { active?: boolean; search?: string }) =>
    get<{ counsellors: any[] }>('/counsellors', params),
  get: (id: number) => get<{ counsellor: any }>(`/counsellors/${id}`),
  create: (body: any) => post<{ message: string; counsellor_id: number }>('/counsellors', body),
  update: (id: number, body: any) => put<{ message: string }>(`/counsellors/${id}`, body),
  delete: (id: number) => del<{ message: string }>(`/counsellors/${id}`),
};

export const feedbackApi = {
  submit: (body: any) => post<{ message: string; feedback_id: number }>('/feedback', body),
  myHistory: () => get<{ feedback: any[] }>('/feedback/my-history'),
};

export const analyticsApi = {
  institution: (params: { range: string; start?: string; end?: string; team?: string }) =>
    get<any>('/analytics/institution', params),
  counsellor: (id: number, params: { range: string; start?: string; end?: string }) =>
    get<any>(`/analytics/counsellor/${id}`, params),
  leaderboard: (params: { range: string; start?: string; end?: string; team?: string }) =>
    get<{ leaderboard: any[] }>('/analytics/leaderboard', params),
};

export const adminApi = {
  pendingRegistrations: () => get<{ registrations: any[] }>('/admin/pending-registrations'),
  approve: (userId: number) => post<{ message: string }>(`/admin/approve-registration/${userId}`, {}),
  reject: (userId: number, reason?: string) =>
    post<{ message: string }>(`/admin/reject-registration/${userId}`, { reason }),
  getStudents: () => get<{ students: any[] }>('/admin/students'),
  deleteStudent: (userId: number) => del<{ message: string }>(`/admin/students/${userId}`),
};

export const exportApi = {
  download: (params: { format: string; range: string; start?: string; end?: string; counsellor_id?: number; team?: string }) =>
    apiClient.get('/export', { params, responseType: 'blob' }),
};

export const qrApi = {
  get: (counsellorId: number) => get<{ feedback_url: string }>(`/qr-code/${counsellorId}`),
};

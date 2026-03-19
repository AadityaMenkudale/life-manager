/**
 * api.ts  –  Drop this file into your frontend src/lib/ folder.
 *
 * Usage:
 *   import { api } from './lib/api';
 *   const { user } = await api.auth.login('alex@example.com', 'password123');
 *   const { tasks } = await api.tasks.getToday();
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Token Storage ────────────────────────────────────────────────────────────
let _token: string | null = localStorage.getItem('lm_token');

export const setToken = (token: string | null) => {
  _token = token;
  if (token) localStorage.setItem('lm_token', token);
  else localStorage.removeItem('lm_token');
};

export const getToken = () => _token;

// ─── Base Fetch ───────────────────────────────────────────────────────────────
async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

const get  = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) });
const patch = <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
const del  = <T>(path: string) => request<T>(path, { method: 'DELETE' });

// ─── API Namespaces ───────────────────────────────────────────────────────────
export const api = {

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    register: (data: { email: string; username: string; password: string; displayName: string }) =>
      post<{ token: string; user: unknown }>('/auth/register', data),

    login: (email: string, password: string) =>
      post<{ token: string; user: unknown }>('/auth/login', { email, password }),

    me: () => get<{ user: unknown }>('/auth/me'),

    refresh: () => post<{ token: string }>('/auth/refresh', {}),
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  users: {
    getProfile: () => get<{ user: unknown }>('/users/profile'),

    updateProfile: (data: { displayName?: string; avatarSeed?: string; dailyCalorieGoal?: number; dailyStepGoal?: number }) =>
      patch('/users/profile', data),

    changePassword: (currentPassword: string, newPassword: string) =>
      post('/users/change-password', { currentPassword, newPassword }),
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    get: () => get('/dashboard'),
  },

  // ── Tasks ─────────────────────────────────────────────────────────────────
  tasks: {
    getAll: (params?: { status?: string; priority?: string; date?: string; search?: string; page?: number }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return get(`/tasks${q ? `?${q}` : ''}`);
    },
    getToday: () => get('/tasks/today'),
    getById: (id: string) => get(`/tasks/${id}`),
    create: (data: { title: string; description?: string; priority?: string; dueDate?: string; dueTime?: string; tags?: string }) =>
      post('/tasks', data),
    update: (id: string, data: Partial<{ title: string; description: string; status: string; priority: string; dueDate: string }>) =>
      patch(`/tasks/${id}`, data),
    toggle: (id: string) => patch(`/tasks/${id}/toggle`, {}),
    delete: (id: string) => del(`/tasks/${id}`),
    clearCompleted: () => del('/tasks/bulk/completed'),
  },

  // ── Habits ────────────────────────────────────────────────────────────────
  habits: {
    getAll: (params?: { category?: string; isActive?: boolean }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return get(`/habits${q ? `?${q}` : ''}`);
    },
    getToday: () => get('/habits/today'),
    getById: (id: string) => get(`/habits/${id}`),
    create: (data: { name: string; icon?: string; color?: string; category?: string; reminderTime?: string }) =>
      post('/habits', data),
    update: (id: string, data: Partial<{ name: string; icon: string; color: string; isActive: boolean }>) =>
      patch(`/habits/${id}`, data),
    delete: (id: string) => del(`/habits/${id}`),
    log: (id: string, data?: { date?: string; note?: string }) => post(`/habits/${id}/log`, data || {}),
    unlog: (id: string, date?: string) => del(`/habits/${id}/log${date ? `?date=${date}` : ''}`),
  },

  // ── Workouts ──────────────────────────────────────────────────────────────
  workouts: {
    getAll: (params?: { type?: string; startDate?: string; endDate?: string; page?: number }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return get(`/workouts${q ? `?${q}` : ''}`);
    },
    getSummary: (period?: 'week' | 'month' | 'year') =>
      get(`/workouts/summary${period ? `?period=${period}` : ''}`),
    getById: (id: string) => get(`/workouts/${id}`),
    create: (data: { name: string; type: string; durationMins: number; caloriesBurned?: number; notes?: string }) =>
      post('/workouts', data),
    update: (id: string, data: Partial<{ name: string; durationMins: number; caloriesBurned: number; notes: string }>) =>
      patch(`/workouts/${id}`, data),
    delete: (id: string) => del(`/workouts/${id}`),
  },

  // ── Meals ─────────────────────────────────────────────────────────────────
  meals: {
    getAll: (params?: { date?: string; mealType?: string; page?: number }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return get(`/meals${q ? `?${q}` : ''}`);
    },
    getToday: () => get('/meals/today'),
    getById: (id: string) => get(`/meals/${id}`),
    create: (data: { name: string; mealType: string; calories: number; proteinG?: number; carbsG?: number; fatG?: number }) =>
      post('/meals', data),
    update: (id: string, data: Partial<{ name: string; calories: number; proteinG: number; carbsG: number; fatG: number }>) =>
      patch(`/meals/${id}`, data),
    delete: (id: string) => del(`/meals/${id}`),
  },

  // ── Reminders ─────────────────────────────────────────────────────────────
  reminders: {
    getAll: (params?: { isActive?: boolean; type?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return get(`/reminders${q ? `?${q}` : ''}`);
    },
    create: (data: { title: string; type?: string; time: string; days: string; description?: string }) =>
      post('/reminders', data),
    update: (id: string, data: Partial<{ title: string; time: string; days: string; isActive: boolean }>) =>
      patch(`/reminders/${id}`, data),
    toggle: (id: string) => patch(`/reminders/${id}/toggle`, {}),
    delete: (id: string) => del(`/reminders/${id}`),
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  analytics: {
    overview: (period?: 'week' | 'month' | 'year') =>
      get(`/analytics/overview${period ? `?period=${period}` : ''}`),
    tasksChart: (days?: number) =>
      get(`/analytics/tasks-chart${days ? `?days=${days}` : ''}`),
    habitsChart: (days?: number) =>
      get(`/analytics/habits-chart${days ? `?days=${days}` : ''}`),
    caloriesChart: (days?: number) =>
      get(`/analytics/calories-chart${days ? `?days=${days}` : ''}`),
    workoutChart: (days?: number) =>
      get(`/analytics/workout-chart${days ? `?days=${days}` : ''}`),
    timeline: (date?: string) =>
      get(`/analytics/timeline${date ? `?date=${date}` : ''}`),
    lifeScoreTrend: (days?: number) =>
      get(`/analytics/life-score-trend${days ? `?days=${days}` : ''}`),
  },
};

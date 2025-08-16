import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// With `adb reverse tcp:3001 tcp:3001`, the device can reach the host at http://localhost:3001
const BASE_URL = 'http://localhost:3001';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Simple token manager that slices can update
let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

export const tokenManager = {
  setTokens: (access: string | null, refresh?: string | null) => {
    accessToken = access;
    if (typeof refresh !== 'undefined') {
      refreshToken = refresh;
    }
  },
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  clear: () => {
    accessToken = null;
    refreshToken = null;
  },
};

// Optional: bind Redux store so we can read the latest token directly from state
let storeRef: { getState: () => any } | null = null;
export function bindStore(store: { getState: () => any }) {
  storeRef = store;
}

api.interceptors.request.use((config) => {
  const tokenFromStore = storeRef?.getState()?.auth?.token as string | null;
  const token = tokenFromStore ?? accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

async function refreshAccessToken() {
  if (!refreshToken) throw new Error('No refresh token');
  const res = await axios.post(
    `${BASE_URL}/api/auth/refresh`,
    { refreshToken },
    { timeout: 10000 },
  );
  const { accessToken: newAccess, refreshToken: newRefresh } = res.data?.data ?? res.data;
  tokenManager.setTokens(newAccess, newRefresh ?? refreshToken);
  return newAccess as string;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    if (status === 401 && !original._retry) {
      if (!refreshToken) return Promise.reject(error);
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then(() => {
            original.headers = original.headers ?? {};
            (original.headers as any).Authorization = `Bearer ${accessToken}`;
            original._retry = true;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        pendingQueue.forEach((p) => p.resolve(true));
        pendingQueue = [];
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        original._retry = true;
        return api(original);
      } catch (e) {
        pendingQueue.forEach((p) => p.reject(e));
        pendingQueue = [];
        tokenManager.clear();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

// ---- Auth API ----
export const authApi = {
  login: (payload: { email: string; password: string }) =>
    api.post('/api/auth/login', payload).then((r) => r.data),
  register: (payload: { name: string; email: string; password: string }) =>
    api.post('/api/auth/register', payload).then((r) => r.data),
  requestPasswordReset: (payload: { email: string }) =>
    api.post('/api/auth/request-password-reset', payload).then((r) => r.data),
};

// ---- Groups API ----
export const groupsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/api/groups', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/api/groups/${id}`).then((r) => r.data),
};

// ---- Tasks API ----
export const tasksApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/api/tasks', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/api/tasks/${id}`).then((r) => r.data),
};

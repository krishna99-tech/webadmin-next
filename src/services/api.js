/**
 * ThingsNXT - Core API Client
 * This file handles axios configuration, interceptors, and authentication tokens.
 */
import axios from 'axios';
import config from '../config';

const client = axios.create({
  baseURL: config.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request Interceptor: Attach Bearer Token
client.interceptors.request.use(
  (cfg) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

// Response Interceptor: Handle Refresh Token & 401s
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (typeof window !== 'undefined' && err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
          const { data } = await axios.post(`${config.API_BASE_URL}/refresh`, null, {
            params: { refresh_token: refresh },
          });
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
            original.headers['Authorization'] = `Bearer ${data.access_token}`;
            return client(original);
          }
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

/**
 * Standard data extractor for API responses
 */
export const unwrap = (res) => res.data?.data ?? (Array.isArray(res.data) ? res.data : res.data);

export default client;

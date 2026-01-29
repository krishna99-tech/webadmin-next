import axios from 'axios';
import config from '../config';

const api = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
    (config) => {
        // Safe check for browser environment
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration (401)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops and check environment
        if (typeof window !== 'undefined' && error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${config.API_BASE_URL}/refresh`, null, {
                        params: { refresh_token: refreshToken },
                    });

                    if (response.status === 200) {
                        const { access_token, refresh_token } = response.data;
                        localStorage.setItem('access_token', access_token);
                        if (refresh_token) {
                            localStorage.setItem('refresh_token', refresh_token);
                        }
                        // Retry the original request with the new token
                        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Refresh token invalid or expired, logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;

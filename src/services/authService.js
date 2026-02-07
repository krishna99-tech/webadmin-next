/**
 * Auth Service - Handles user security and session management
 */
import client from './api';

const authService = {
  /**
   * Login user and persist tokens
   */
  async login(username, password) {
    const form = new FormData();
    form.append('username', username);
    form.append('password', password);
    
    const res = await client.post('/token', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (res.data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  /**
   * Destroy session and clear local storage
   */
  async logout() {
    try {
      await client.post('/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
  },

  /**
   * Get current user from local storage
   */
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },
};

export default authService;

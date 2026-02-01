/**
 * Auth service - re-exports from unified api.js
 * Use: import authService from '@/services/authService'
 * Or: import { APIs } from '@/services/api'; APIs.auth.login()
 */
import { APIs } from './api';

export default {
  login: APIs.auth.login,
  logout: APIs.auth.logout,
  getCurrentUser: APIs.auth.getCurrentUser,
};

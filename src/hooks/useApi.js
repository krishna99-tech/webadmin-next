'use client';

/**
 * Global API hook - use unified APIs from a single import
 * Usage: const api = useApi(); api.admin.getUsers(); api.auth.login(u,p);
 */
import { APIs } from '@/services/api';

export default function useApi() {
  return APIs;
}

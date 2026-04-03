import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeId?: string;
  token: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'cms-auth' }
  )
);

// Role-based redirect map
export const roleRedirect: Record<UserRole, string> = {
  SUPER_ADMIN:    '/dashboard/super-admin',
  COLLEGE_ADMIN:  '/dashboard',
  TEACHER:        '/dashboard/attendance',
  STUDENT:        '/dashboard/student',
  PARENT:         '/dashboard/student',
};

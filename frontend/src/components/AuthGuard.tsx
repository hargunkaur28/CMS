'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, UserRole } from '@/store/authStore';

// Define which roles can access which path prefixes
const routePermissions: { prefix: string; roles: UserRole[] }[] = [
  { prefix: '/dashboard/super-admin', roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/student',     roles: ['STUDENT', 'PARENT'] },
  { prefix: '/dashboard/attendance',  roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'] },
  { prefix: '/dashboard/admissions',  roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN'] },
  { prefix: '/dashboard/finance',     roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN'] },
  { prefix: '/dashboard/exams',       roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'] },
  { prefix: '/dashboard/library',     roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN'] },
  { prefix: '/dashboard/placement',   roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN'] },
  // General dashboard — all authenticated roles
  { prefix: '/dashboard',             roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
];

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Not logged in → send to login
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    // Check permission for current route
    const matched = routePermissions.find(r => pathname.startsWith(r.prefix));
    if (matched && !matched.roles.includes(user.role)) {
      // Redirect to the user's allowed home
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, pathname, router]);

  // While checking, show nothing (avoids flash)
  if (!isAuthenticated || !user) return null;

  return <>{children}</>;
}

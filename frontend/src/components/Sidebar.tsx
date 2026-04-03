'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardCheck,
  FileText, CreditCard, Library, Briefcase, Bell, Settings,
  GraduationCap, LogOut, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, UserRole } from '@/store/authStore';

// Role-filtered navigation
const allNavItems = [
  { name: 'Dashboard',      href: '/dashboard',               icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Super Admin',    href: '/dashboard/super-admin',   icon: ShieldCheck,      roles: ['SUPER_ADMIN'] },
  { name: 'Admissions',     href: '/dashboard/admissions',    icon: GraduationCap,    roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN'] },
  { name: 'Students',       href: '/dashboard/students',      icon: Users,            roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'] },
  { name: 'Academics',      href: '/dashboard/academics',     icon: BookOpen,         roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'] },
  { name: 'Timetable',      href: '/dashboard/timetable',     icon: Calendar,         roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT'] },
  { name: 'Attendance',     href: '/dashboard/attendance',    icon: ClipboardCheck,   roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'] },
  { name: 'Exams',          href: '/dashboard/exams',         icon: FileText,         roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT'] },
  { name: 'Finance',        href: '/dashboard/finance',       icon: CreditCard,       roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN'] },
  { name: 'Library',        href: '/dashboard/library',       icon: Library,          roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'STUDENT'] },
  { name: 'Placement',      href: '/dashboard/placement',     icon: Briefcase,        roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'STUDENT'] },
  { name: 'Notifications',  href: '/dashboard/notifications', icon: Bell,             roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Settings',       href: '/dashboard/settings',      icon: Settings,         roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN'] },
];

const roleLabel: Record<UserRole, string> = {
  SUPER_ADMIN:   'Super Admin',
  COLLEGE_ADMIN: 'College Admin',
  TEACHER:       'Teacher',
  STUDENT:       'Student',
  PARENT:        'Parent',
};

const roleColor: Record<UserRole, string> = {
  SUPER_ADMIN:   'bg-purple-500/20 text-purple-300',
  COLLEGE_ADMIN: 'bg-indigo-500/20 text-indigo-300',
  TEACHER:       'bg-emerald-500/20 text-emerald-300',
  STUDENT:       'bg-amber-500/20 text-amber-300',
  PARENT:        'bg-slate-500/20 text-slate-300',
};

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();

  const navItems = allNavItems.filter(item =>
    !user || item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col z-10">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-indigo-400">NgCMS ERP</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">AI Powered ERP</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400')} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', roleColor[user.role])}>
                {roleLabel[user.role]}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

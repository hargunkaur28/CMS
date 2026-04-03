'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Users, GraduationCap, ClipboardCheck, CreditCard,
  TrendingUp, AlertTriangle, BookOpen, Calendar
} from 'lucide-react';

const kpis = [
  { label: 'Total Students',    value: '1,284', change: '+24 this month', icon: GraduationCap, color: 'from-indigo-500 to-indigo-600' },
  { label: 'Faculty Members',   value: '87',    change: '+2 this month',  icon: Users,         color: 'from-purple-500 to-purple-600' },
  { label: 'Attendance Today',  value: '81%',   change: '↑ 3% vs last week', icon: ClipboardCheck, color: 'from-emerald-500 to-emerald-600' },
  { label: 'Fee Collection',    value: '₹18.4L', change: '↑ 12% vs last month', icon: CreditCard,  color: 'from-amber-500 to-amber-600' },
];

const alerts = [
  { label: '5 students below 75% attendance', type: 'warning' },
  { label: '12 pending admission applications', type: 'info' },
  { label: '3 exam results awaiting publication', type: 'info' },
];

export default function DashboardHome() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Super admin should land on /dashboard/super-admin
  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      router.replace('/dashboard/super-admin');
    }
  }, [user, router]);

  if (user?.role === 'SUPER_ADMIN') return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Here's what's happening at your college today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-4`}>
              <kpi.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-slate-400 mt-1">{kpi.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
      >
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Action Items
        </h2>
        <div className="space-y-2.5">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
              a.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${a.type === 'warning' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
              {a.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Nav */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Admissions',  href: '/dashboard/admissions', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Attendance',  href: '/dashboard/attendance', icon: ClipboardCheck, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Academics',   href: '/dashboard/academics',  icon: BookOpen,       color: 'bg-purple-50 text-purple-600' },
          { label: 'Timetable',   href: '/dashboard/timetable',  icon: Calendar,       color: 'bg-amber-50 text-amber-600' },
        ].map((item, i) => (
          <a
            key={i}
            href={item.href}
            className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-start gap-3 hover:border-indigo-200 hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{item.label}</p>
          </a>
        ))}
      </motion.div>
    </div>
  );
}

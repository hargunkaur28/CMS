'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, GraduationCap, TrendingUp,
  ShieldCheck, Globe, Activity, Plus, MoreHorizontal,
  CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

// ── Mock Data ────────────────────────────────────────────────────────────────
const colleges = [
  { id: '1', name: 'Global Institute of Technology', location: 'New Delhi', students: 3420, faculty: 210, status: 'active', plan: 'Enterprise' },
  { id: '2', name: 'Sunrise Business School',        location: 'Mumbai',    students: 1850, faculty: 98,  status: 'active', plan: 'Professional' },
  { id: '3', name: 'Apex Medical College',           location: 'Pune',      students: 920,  faculty: 74,  status: 'trial',  plan: 'Trial' },
];

const globalStats = [
  { label: 'Total Colleges',  value: '3',    change: '+1 this month', icon: Building2,    color: 'from-indigo-500 to-indigo-600' },
  { label: 'Total Students',  value: '6,190', change: '+340 this month', icon: GraduationCap, color: 'from-purple-500 to-purple-600' },
  { label: 'Total Faculty',   value: '382',   change: '+12 this month', icon: Users,        color: 'from-emerald-500 to-emerald-600' },
  { label: 'Platform Uptime', value: '99.9%', change: 'Last 30 days',   icon: Activity,     color: 'from-amber-500 to-amber-600' },
];

const recentActivity = [
  { action: 'New college onboarded', detail: 'Apex Medical College', time: '2h ago', type: 'success' },
  { action: 'Student enrolled',      detail: 'GIT — Batch 2024-28',  time: '4h ago', type: 'info'    },
  { action: 'Fee payment received',  detail: '₹2,40,000 — Sunrise',  time: '6h ago', type: 'success' },
  { action: 'Trial expiring soon',   detail: 'Apex Medical — 5 days', time: '1d ago', type: 'warning' },
];

const activityIcon = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  info:    <Activity className="w-4 h-4 text-indigo-500" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-500" />,
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const { user } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-bold text-purple-600 uppercase tracking-widest">Super Admin Console</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. Manage all colleges and platform settings.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New College
        </button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {globalStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colleges Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-slate-800">Registered Colleges</h2>
            </div>
            <span className="text-sm text-slate-400 font-medium">{colleges.length} total</span>
          </div>
          <div className="divide-y divide-slate-50">
            {colleges.map((college, idx) => (
              <motion.div
                key={college.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + idx * 0.06 }}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center">
                    {college.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{college.name}</p>
                    <p className="text-xs text-slate-400">{college.location} · {college.students.toLocaleString()} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    college.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    college.status === 'trial'  ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {college.plan}
                  </span>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
            <Link href="/dashboard/super-admin/colleges" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              View all colleges →
            </Link>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="px-5 py-3.5 flex gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="mt-0.5 shrink-0">{activityIcon[item.type as keyof typeof activityIcon]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{item.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{item.detail}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Manage Colleges',  href: '/dashboard/super-admin/colleges',  icon: Building2,    color: 'bg-indigo-50 text-indigo-600' },
          { label: 'All Students',     href: '/dashboard/students',               icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
          { label: 'Platform Settings', href: '/dashboard/settings',             icon: ShieldCheck,   color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Analytics',        href: '/dashboard',                        icon: TrendingUp,    color: 'bg-amber-50 text-amber-600' },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-start gap-3 hover:border-indigo-200 hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{item.label}</p>
          </Link>
        ))}
      </motion.div>

      {/* Add College Modal (basic) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add New College</h2>
            <div className="space-y-4">
              {['College Name', 'Location', 'Admin Email', 'Phone'].map(field => (
                <div key={field}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{field}</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder={field}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">Create College</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

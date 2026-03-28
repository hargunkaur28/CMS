"use client";

import React, { useState, useEffect } from 'react';
import AttendanceMarker from '@/components/attendance/AttendanceMarker';
import ShortageAlertsPanel from '@/components/attendance/ShortageAlertsPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Brain, BarChart2 } from 'lucide-react';
import { getHubStats } from '@/lib/api/attendance';

const tabs = [
  { id: 'mark',     label: 'Mark Attendance', icon: ClipboardCheck },
  { id: 'ai',       label: 'AI Shortage Alerts', icon: Brain },
];

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('mark');
  const [stats, setStats] = useState({ avgAttendance: 0, pendingLeaves: 0, shortageCount: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getHubStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to load hub stats");
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance Matrices</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">
            Presence Tracking & Predictive Diagnostics
          </p>
        </div>

        {/* Live Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-sm">
            <BarChart2 size={16} />
            <span>Avg: {stats.avgAttendance || 0}%</span>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-sm">
            <Brain size={16} />
            <span>{stats.shortageCount || 0} At-Risk Nodes</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-white shadow-sm p-1.5 rounded-2xl border border-slate-200 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === tab.id ? 'text-white shadow-md shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="attendance-tab"
                className="absolute inset-0 bg-indigo-600 rounded-xl"
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon size={16} />
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'mark' && <AttendanceMarker />}
            {activeTab === 'ai' && <ShortageAlertsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

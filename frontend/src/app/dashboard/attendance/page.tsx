'use client';

import React, { useState } from 'react';
import AttendanceMarker from '@/components/attendance/AttendanceMarker';
import ShortageAlertsPanel from '@/components/attendance/ShortageAlertsPanel';
import { motion } from 'framer-motion';
import { ClipboardCheck, Brain, BarChart2 } from 'lucide-react';

const tabs = [
  { id: 'mark',     label: 'Mark Attendance', icon: ClipboardCheck },
  { id: 'ai',       label: 'AI Shortage Alerts', icon: Brain },
];

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('mark');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance Management</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Mark daily attendance and track student shortage alerts with AI predictions.
          </p>
        </div>

        {/* Live Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold">
            <BarChart2 className="w-4 h-4" />
            <span>Avg: 81%</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold">
            <Brain className="w-4 h-4" />
            <span>5 At-Risk Students</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 rounded-2xl p-1 w-fit gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="attendance-tab"
                className="absolute inset-0 bg-white shadow-sm rounded-xl"
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </span>
            {tab.id === 'ai' && (
              <span className="relative z-10 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">5</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'mark' && <AttendanceMarker />}
        {activeTab === 'ai' && <ShortageAlertsPanel />}
      </motion.div>
    </div>
  );
}

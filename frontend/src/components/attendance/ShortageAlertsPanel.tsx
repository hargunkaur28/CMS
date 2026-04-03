'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Flame, Info } from 'lucide-react';

interface ShortageAlert {
  studentId: string;
  rollNumber: string;
  studentName: string;
  subjectName: string;
  percentage: number;
  total: number;
  present: number;
  classesNeededToRecover: number;
  riskLevel: 'critical' | 'high' | 'medium';
}

// Mock shortage data for demo
const mockAlerts: ShortageAlert[] = [
  { studentId: '1', rollNumber: 'GIT-2024-1003', studentName: 'Rahul Verma',   subjectName: 'Computer Networks',    percentage: 48, total: 25, present: 12, classesNeededToRecover: 14, riskLevel: 'critical' },
  { studentId: '2', rollNumber: 'GIT-2024-1005', studentName: 'Vikram Singh',  subjectName: 'Data Structures',       percentage: 58, total: 24, present: 14, classesNeededToRecover: 10, riskLevel: 'high' },
  { studentId: '3', rollNumber: 'GIT-2024-1006', studentName: 'Ananya Kumar', subjectName: 'Database Management',   percentage: 62, total: 24, present: 15, classesNeededToRecover: 8,  riskLevel: 'high' },
  { studentId: '4', rollNumber: 'GIT-2024-1001', studentName: 'Arjun Sharma',  subjectName: 'Computer Networks',    percentage: 68, total: 22, present: 15, classesNeededToRecover: 5,  riskLevel: 'medium' },
  { studentId: '5', rollNumber: 'GIT-2024-1002', studentName: 'Priya Patel',   subjectName: 'Database Management',  percentage: 70, total: 20, present: 14, classesNeededToRecover: 3,  riskLevel: 'medium' },
];

const riskConfig = {
  critical: { label: 'Critical',  bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',    bar: 'bg-red-500',    icon: <Flame className="w-4 h-4 text-red-500" /> },
  high:     { label: 'High Risk', bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500',  icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
  medium:   { label: 'Medium',    bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   bar: 'bg-blue-400',   icon: <TrendingDown className="w-4 h-4 text-blue-500" /> },
};

export default function ShortageAlertsPanel() {
  const critical = mockAlerts.filter(a => a.riskLevel === 'critical').length;
  const high = mockAlerts.filter(a => a.riskLevel === 'high').length;

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical (<50%)', count: critical, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          { label: 'High Risk (<65%)', count: high, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Medium (<75%)', count: mockAlerts.length - critical - high, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${stat.bg} ${stat.border} border rounded-2xl p-4 text-center`}
          >
            <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Note */}
      <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
        <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-700 font-medium leading-relaxed">
          <strong>AI Shortage Prediction</strong> — Students below the 75% threshold are listed here. &quot;Classes needed&quot; is calculated based on current trajectory to predict recovery requirements.
        </p>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {mockAlerts.map((alert, idx) => {
          const risk = riskConfig[alert.riskLevel];
          return (
            <motion.div
              key={alert.studentId + alert.subjectName}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={`${risk.bg} ${risk.border} border rounded-2xl p-4`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {risk.icon}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm">{alert.studentName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${risk.badge}`}>{risk.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{alert.rollNumber} · {alert.subjectName}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black text-slate-800">{alert.percentage}%</p>
                  <p className="text-[10px] text-slate-400">{alert.present}/{alert.total} classes</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${risk.bar} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${alert.percentage}%` }}
                    transition={{ delay: idx * 0.06 + 0.2, duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-[10px] text-slate-400">Current: {alert.percentage}%</p>
                  <p className="text-[10px] font-semibold text-slate-500">
                    Needs <span className="font-black text-slate-700">{alert.classesNeededToRecover}</span> more classes to recover
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

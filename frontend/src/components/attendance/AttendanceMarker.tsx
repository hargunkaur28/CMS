'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Save, ChevronDown, Calendar } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentRecord {
  id: string;
  name: string;
  rollNumber: string;
  status: AttendanceStatus | null;
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const mockBatches = [
  { _id: 'b1', name: 'CS Batch A (2024-28)' },
  { _id: 'b2', name: 'CS Batch B (2024-28)' },
  { _id: 'b3', name: 'Data Science (2024-27)' },
];

const mockSubjects = [
  { _id: 's1', name: 'Data Structures' },
  { _id: 's2', name: 'Computer Networks' },
  { _id: 's3', name: 'Database Management' },
];

const mockStudents: StudentRecord[] = [
  { id: '1', name: 'Arjun Sharma', rollNumber: 'GIT-2024-1001', status: null },
  { id: '2', name: 'Priya Patel', rollNumber: 'GIT-2024-1002', status: null },
  { id: '3', name: 'Rahul Verma', rollNumber: 'GIT-2024-1003', status: null },
  { id: '4', name: 'Sneha Reddy', rollNumber: 'GIT-2024-1004', status: null },
  { id: '5', name: 'Vikram Singh', rollNumber: 'GIT-2024-1005', status: null },
  { id: '6', name: 'Ananya Kumar', rollNumber: 'GIT-2024-1006', status: null },
];

// ── Status Button Component ────────────────────────────────────────────────
function StatusButton({
  value, current, onChange,
}: { value: AttendanceStatus; current: AttendanceStatus | null; onChange: (v: AttendanceStatus) => void }) {
  const config = {
    present: { icon: <Check className="w-4 h-4" />, label: 'P', active: 'bg-emerald-500 text-white border-emerald-500', idle: 'border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-500' },
    absent:  { icon: <X className="w-4 h-4" />,     label: 'A', active: 'bg-red-500 text-white border-red-500',     idle: 'border-slate-200 text-slate-400 hover:border-red-400 hover:text-red-500' },
    late:    { icon: <Clock className="w-4 h-4" />,  label: 'L', active: 'bg-amber-500 text-white border-amber-500',  idle: 'border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500' },
  };
  const c = config[value];
  const isActive = current === value;
  return (
    <button
      onClick={() => onChange(value)}
      className={`w-9 h-9 rounded-xl border-2 font-bold text-xs flex items-center justify-center transition-all ${isActive ? c.active : c.idle}`}
      title={value}
    >
      {c.label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AttendanceMarker() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentRecord[]>(mockStudents);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isConfigured = selectedBatch && selectedSubject && selectedDate;
  const total = students.length;
  const marked = students.filter(s => s.status !== null).length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const lateCount = students.filter(s => s.status === 'late').length;

  const markAll = (status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const updateStudentStatus = (id: string, status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSave = async () => {
    if (marked < total) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* ── Config Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Batch */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch</label>
          <div className="relative">
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="">Select batch...</option>
              {mockBatches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="">Select subject...</option>
              {mockSubjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Attendance Sheet ── */}
      <AnimatePresence>
        {isConfigured && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Sheet Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-6 text-sm">
                <span className="font-bold text-slate-700">{marked}/{total} marked</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-500" />{presentCount} Present</span>
                <span className="flex items-center gap-1.5 text-red-500 font-semibold"><span className="w-2 h-2 rounded-full bg-red-500" />{absentCount} Absent</span>
                <span className="flex items-center gap-1.5 text-amber-500 font-semibold"><span className="w-2 h-2 rounded-full bg-amber-500" />{lateCount} Late</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => markAll('present')} className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">All Present</button>
                <button onClick={() => markAll('absent')} className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">All Absent</button>
              </div>
            </div>

            {/* Student Rows */}
            <div className="divide-y divide-slate-50">
              {students.map((student, idx) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors ${
                    student.status === 'present' ? 'border-l-2 border-emerald-400' :
                    student.status === 'absent'  ? 'border-l-2 border-red-400' :
                    student.status === 'late'    ? 'border-l-2 border-amber-400' :
                    'border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{student.rollNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <StatusButton value="present" current={student.status} onChange={s => updateStudentStatus(student.id, s)} />
                    <StatusButton value="late"    current={student.status} onChange={s => updateStudentStatus(student.id, s)} />
                    <StatusButton value="absent"  current={student.status} onChange={s => updateStudentStatus(student.id, s)} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              {/* Progress bar */}
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Completion</span><span>{marked}/{total}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-500 rounded-full"
                    animate={{ width: `${(marked / total) * 100}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={marked < total || isSaving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  isSaved
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20 disabled:opacity-40'
                }`}
              >
                {isSaving ? (
                  <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Saving...</>
                ) : isSaved ? (
                  <><Check className="w-4 h-4" />Saved!</>
                ) : (
                  <><Save className="w-4 h-4" />Submit Attendance</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isConfigured && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-12 h-12 text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">Select a batch, subject, and date to begin marking attendance.</p>
        </div>
      )}
    </div>
  );
}

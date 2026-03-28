"use client";

import React, { useState } from "react";
import { User, Save, CheckCircle2, AlertCircle } from "lucide-react";
import GradeBadge from "./GradeBadge";
import { cn } from "@/lib/utils";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
}

interface MarksEntryTableProps {
  students: Student[];
  onSaveRow: (studentId: string, marks: number, remarks: string) => Promise<void>;
  onBulkSubmit: (data: { studentId: string, marks: number, remarks: string }[]) => Promise<void>;
  maxMarks: number;
}

export default function MarksEntryTable({ students, onSaveRow, onBulkSubmit, maxMarks }: MarksEntryTableProps) {
  const [entries, setEntries] = useState<Record<string, { marks: string, remarks: string, status: 'idle' | 'saving' | 'saved' | 'error' }>>(() => {
    const initial: any = {};
    students.forEach(s => {
      initial[s._id] = { marks: "", remarks: "", status: 'idle' };
    });
    return initial;
  });

  const handleInputChange = (studentId: string, field: 'marks' | 'remarks', value: string) => {
    setEntries(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value, status: 'idle' }
    }));
  };

  const calculateGrade = (marks: string) => {
    const m = parseFloat(marks);
    if (isNaN(m)) return null;
    const percentage = (m / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const saveRow = async (studentId: string) => {
    const entry = entries[studentId];
    if (!entry.marks) return;
    
    setEntries(prev => ({ ...prev, [studentId]: { ...prev[studentId], status: 'saving' } }));
    try {
      await onSaveRow(studentId, parseFloat(entry.marks), entry.remarks);
      setEntries(prev => ({ ...prev, [studentId]: { ...prev[studentId], status: 'saved' } }));
    } catch (err) {
      setEntries(prev => ({ ...prev, [studentId]: { ...prev[studentId], status: 'error' } }));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest w-16">#</th>
            <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
            <th className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest w-32">Marks ({maxMarks})</th>
            <th className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest w-24">Grade</th>
            <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Remarks</th>
            <th className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest w-24">Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const entry = entries[student._id];
            const grade = calculateGrade(entry.marks);
            const isError = parseFloat(entry.marks) > maxMarks;

            return (
              <tr key={student._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-bold text-slate-400">{index + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{student.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{student.rollNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={entry.marks}
                      onChange={(e) => handleInputChange(student._id, 'marks', e.target.value)}
                      placeholder="00"
                      className={cn(
                        "w-full px-3 py-2 text-center text-sm font-bold border rounded-xl focus:ring-2 outline-none transition-all",
                        isError 
                          ? "border-red-300 bg-red-50 text-red-600 focus:ring-red-100" 
                          : "border-slate-200 focus:border-slate-900 focus:ring-slate-100"
                      )}
                    />
                    {isError && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                         Exceeds Max!
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-center">
                  {grade && <GradeBadge grade={grade} />}
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={entry.remarks}
                    onChange={(e) => handleInputChange(student._id, 'remarks', e.target.value)}
                    placeholder="Add brief remarks..."
                    className="w-full px-3 py-2 text-sm border-b border-transparent hover:border-slate-200 focus:border-slate-900 focus:bg-slate-50/50 outline-none transition-all bg-transparent"
                  />
                </td>
                <td className="p-4 text-center">
                   <button
                     onClick={() => saveRow(student._id)}
                     disabled={entry.status === 'saving' || !entry.marks || isError}
                     className={cn(
                       "p-2 rounded-lg transition-all",
                       entry.status === 'saved' 
                         ? "text-green-600 bg-green-50" 
                         : entry.status === 'error'
                         ? "text-red-600 bg-red-50"
                         : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                     )}
                   >
                     {entry.status === 'saving' ? (
                        <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                     ) : entry.status === 'saved' ? (
                        <CheckCircle2 size={18} />
                     ) : entry.status === 'error' ? (
                        <AlertCircle size={18} />
                     ) : (
                        <Save size={18} />
                     )}
                   </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

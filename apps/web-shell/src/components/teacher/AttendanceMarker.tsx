"use client";

import React, { useState } from "react";
import { User, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'Present' | 'Absent' | 'Leave';
}

interface AttendanceMarkerProps {
  students: Student[];
  onSubmit: (records: AttendanceRecord[]) => void;
  isSubmitting?: boolean;
}

export default function AttendanceMarker({ students, onSubmit, isSubmitting }: AttendanceMarkerProps) {
  const [records, setRecords] = useState<Record<string, 'Present' | 'Absent' | 'Leave'>>(() => {
    const initial: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
    students.forEach(s => {
      initial[s._id] = 'Present'; // Default to Present
    });
    return initial;
  });

  const toggleStatus = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: 'Present' | 'Absent' | 'Leave') => {
    const next: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
    students.forEach(s => {
      next[s._id] = status;
    });
    setRecords(next);
  };

  const reset = () => {
    markAll('Present');
  };

  const handleSubmit = () => {
    const formattedRecords = Object.entries(records).map(([studentId, status]) => ({
      studentId,
      status
    }));
    onSubmit(formattedRecords);
  };

  const presentCount = Object.values(records).filter(s => s === 'Present').length;
  const absentCount = Object.values(records).filter(s => s === 'Absent').length;
  const leaveCount = Object.values(records).filter(s => s === 'Leave').length;

  return (
    <div className="space-y-6">
      {/* Summary Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
           <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Students</span>
              <span className="text-2xl font-bold text-slate-900">{students.length}</span>
           </div>
           <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
           <div className="flex items-center gap-4">
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Present</span>
                 <span className="text-lg font-bold text-green-600">{presentCount}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Absent</span>
                 <span className="text-lg font-bold text-red-600">{absentCount}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Leave</span>
                 <span className="text-lg font-bold text-amber-600">{leaveCount}</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={() => markAll('Present')}
             className="px-4 py-2 text-xs font-bold bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
           >
             Mark All Present
           </button>
           <button 
             onClick={reset}
             className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all"
           >
             Reset
           </button>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest w-16">#</th>
              <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Student Details</th>
              <th className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest w-64">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => {
              const status = records[student._id];
              return (
                <tr key={student._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-400">
                    {index + 1}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{student.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{student.rollNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-50 rounded-xl w-fit mx-auto border border-slate-100">
                      <button
                        onClick={() => toggleStatus(student._id, 'Present')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                          status === 'Present' 
                            ? "bg-green-600 text-white shadow-sm" 
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <CheckCircle size={14} />
                        Present
                      </button>
                      <button
                        onClick={() => toggleStatus(student._id, 'Absent')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                          status === 'Absent' 
                            ? "bg-red-600 text-white shadow-sm" 
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <XCircle size={14} />
                        Absent
                      </button>
                      <button
                        onClick={() => toggleStatus(student._id, 'Leave')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                          status === 'Leave' 
                            ? "bg-amber-500 text-white shadow-sm" 
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <Clock size={14} />
                        Leave
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end p-2">
         <button
           onClick={handleSubmit}
           disabled={isSubmitting || students.length === 0}
           className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {isSubmitting ? "Submitting..." : "Submit Attendance"}
         </button>
      </div>
    </div>
  );
}

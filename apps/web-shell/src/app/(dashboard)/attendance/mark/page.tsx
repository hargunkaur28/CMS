// FILE: apps/web-shell/src/app/(dashboard)/attendance/mark/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Save, Loader2, Calendar as CalIcon, Filter } from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import AttendanceMarkingGrid from "@/components/attendance/AttendanceMarkingGrid";
import { getStudents } from "@/lib/api/students";
import { markBulkAttendance } from "@/lib/api/attendance";

export default function MarkAttendancePage() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selection, setSelection] = useState({
    course: "B.Tech CSE",
    batch: "2024-2028",
    subject: "Data Structures",
    date: new Date().toISOString().split('T')[0]
  });

  const [records, setRecords] = useState<Record<string, string>>({});

  useEffect(() => {
    loadStudents();
  }, [selection.batch]);

  const loadStudents = async () => {
    const res = await getStudents({ batch: selection.batch });
    if (res.success) {
      setStudents(res.data);
      // Initialize records
      const initial: any = {};
      res.data.forEach((s: any) => initial[s._id] = "present");
      setRecords(initial);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formattedRecords = Object.entries(records).map(([studentId, status]) => ({
        studentId,
        status,
        remarks: ""
      }));

      const res = await markBulkAttendance({
        batchId: selection.batch,
        courseId: selection.course,
        subjectId: selection.subject,
        teacherId: "current-user-id", // Should come from auth context
        date: selection.date,
        records: formattedRecords
      });

      if (res.success) alert("Attendance saved successfully!");
      else alert(res.message);
    } catch (err) {
      alert("Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <Link href="/attendance" className="flex items-center gap-2 text-[10px] font-bold text-on-surface/30 uppercase tracking-widest mb-2 hover:text-primary-indigo transition-colors">
             <ChevronLeft size={14} /> Back to Hub
           </Link>
           <h1 className="text-2xl font-display font-bold text-on-surface tracking-tight">Mark Attendance</h1>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-primary-indigo text-white px-8 py-3 rounded-xl font-bold text-sm shadow-indigo-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Attendance
        </button>
      </header>

      {/* Configuration Bar */}
      <Card className="p-2 bg-surface-container-low/50 border-none flex flex-wrap items-center gap-2">
         <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-outline-variant/20">
            <Filter size={14} className="text-primary-indigo" />
            <span className="text-xs font-bold text-on-surface/60">{selection.course} • {selection.batch}</span>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-outline-variant/20">
            <span className="text-xs font-bold text-on-surface/60">{selection.subject}</span>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-outline-variant/20">
            <CalIcon size={14} className="text-primary-indigo" />
            <input 
              type="date" 
              className="text-xs font-bold text-on-surface outline-none bg-transparent" 
              value={selection.date}
              onChange={(e) => setSelection({...selection, date: e.target.value})}
            />
         </div>
      </Card>

      <AttendanceMarkingGrid 
        students={students} 
        records={records} 
        onUpdate={(id, status) => setRecords({...records, [id]: status})} 
      />
    </div>
  );
}

// FILE: apps/web-shell/src/app/(dashboard)/attendance/reports/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Download, Search, Filter, Loader2, FileSpreadsheet, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { getShortageList } from "@/lib/api/attendance";

export default function AttendanceReports() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [batch, setBatch] = useState("BTECH-CSE-2024");

  useEffect(() => {
    loadReport();
  }, [batch]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await getShortageList(batch);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error("Report load failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-display font-bold text-on-surface tracking-tight">Attendance Analytics</h1>
           <p className="text-sm text-on-surface/40 mt-1">Institutional reports for compliance and auditing.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-low text-on-surface/60 hover:text-on-surface border border-outline-variant/30 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">
             <FileSpreadsheet size={16} /> CSV
           </button>
           <button className="flex items-center gap-2 px-6 py-2.5 bg-primary-indigo text-white rounded-xl shadow-indigo-lg transition-all font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-95">
             <Download size={16} /> Export PDF
           </button>
        </div>
      </header>

      {/* Filter Bar */}
      <Card className="p-4 bg-surface-container-lowest border-none shadow-ambient flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[300px] flex items-center gap-4 bg-surface-container-low px-4 py-2.5 rounded-xl group border border-transparent focus-within:border-primary-indigo/30 transition-all">
           <Search size={18} className="text-on-surface/20 group-focus-within:text-primary-indigo transition-colors" />
           <input type="text" placeholder="Search by student name or roll number..." className="bg-transparent border-none outline-none text-sm font-bold text-on-surface w-full placeholder:text-on-surface/20" />
        </div>
        
        <select 
          className="bg-surface-container-low px-6 py-2.5 rounded-xl text-xs font-bold text-on-surface outline-none border border-transparent focus:border-primary-indigo/30 transition-all appearance-none cursor-pointer"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        >
          <option value="BTECH-CSE-2024">B.Tech CSE 2024</option>
          <option value="BTECH-ECE-2024">B.Tech ECE 2024</option>
          <option value="BBA-2024">BBA 2024</option>
        </select>

        <button className="p-2.5 bg-surface-container-low rounded-xl text-on-surface/40 hover:text-primary-indigo transition-all">
          <Filter size={18} />
        </button>
      </Card>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center bg-surface-container-low/30 rounded-3xl border-2 border-dashed border-outline-variant text-on-surface/20 italic text-sm gap-4">
           <Loader2 size={32} className="animate-spin text-primary-indigo" />
           Preparing data...
        </div>
      ) : (
        <Card className="overflow-hidden border-none bg-surface-container-lowest shadow-ambient">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface/30">Student</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface/30">Unique ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface/30">Classes</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface/30">Present</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface/30">Percentage</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface/30">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {data.map((student) => (
                <tr key={student.studentId} className="hover:bg-primary-indigo/5 transition-colors group">
                  <td className="px-6 py-4 font-bold text-on-surface text-sm">{student.name}</td>
                  <td className="px-6 py-4 font-bold text-on-surface/40 text-xs">{student.uniqueId}</td>
                  <td className="px-6 py-4 font-bold text-on-surface text-sm">{student.totalClasses}</td>
                  <td className="px-6 py-4 font-bold text-emerald-500 text-sm">{student.presentCount}</td>
                  <td className="px-6 py-4">
                     <span className={`font-bold text-sm ${student.isShortage ? "text-red-500" : "text-emerald-500"}`}>
                       {student.percentage}%
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     {student.isShortage ? (
                       <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-bold uppercase">Shortage</span>
                     ) : (
                       <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">Regular</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-on-surface/20 group-hover:text-primary-indigo transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

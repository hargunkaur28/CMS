"use client";

import React, { useEffect, useState } from "react";
import { fetchShortageList, fetchAttendanceOverview } from "@/lib/api/admin";
import AttendanceReports from "@/components/admin/AttendanceReports";
import { Calendar, Filter, Download, Activity } from "lucide-react";

export default function AttendancePage() {
  const [shortages, setShortages] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const [shortRes, overRes] = await Promise.all([
        fetchShortageList(),
        fetchAttendanceOverview()
      ]);
      
      if (shortRes.success) setShortages(shortRes.data);
      if (overRes.success) setOverview(overRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Attendance Oversight</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Campus Monitoring & Compliance Registry</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Download size={14} /> Comprehensive Export
           </button>
           <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2">
              <Activity size={14} /> Live Stats
           </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
           <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auditing Presence Data...</p>
        </div>
      ) : (
        <AttendanceReports shortages={shortages} />
      )}
    </div>
  );
}

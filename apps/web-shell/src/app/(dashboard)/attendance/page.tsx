// FILE: apps/web-shell/src/app/(dashboard)/attendance/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle, 
  FileText, 
  CheckCircle, 
  ChevronRight,
  BookOpen,
  Loader2,
  RefreshCw,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { getHubStats, getTodaySchedule } from "@/lib/api/attendance";

export default function AttendanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayMarked: 0,
    shortageCount: 0,
    pendingLeaves: 0,
    avgAttendance: 0
  });
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    loadHubData();
  }, []);

  const loadHubData = async () => {
    setLoading(true);
    try {
      const [statsRes, scheduleRes] = await Promise.all([
        getHubStats(),
        getTodaySchedule()
      ]);
      
      if (statsRes.success) setStats(statsRes.data);
      if (scheduleRes.success) setSchedule(scheduleRes.data);
    } catch (err) {
      console.error("Hub data load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { label: "Today's Marked", value: stats.todayMarked, icon: <Calendar />, color: "text-primary-indigo", bg: "bg-primary-indigo/5" },
    { label: "Below 75%", value: stats.shortageCount, icon: <AlertCircle />, color: "text-amber-500", bg: "bg-amber-500/5" },
    { label: "Pending Leaves", value: stats.pendingLeaves, icon: <FileText />, color: "text-purple-500", bg: "bg-purple-500/5" },
    { label: "Avg. Attendance", value: `${stats.avgAttendance}%`, icon: <CheckCircle />, color: "text-emerald-500", bg: "bg-emerald-500/5" },
  ];

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
         <Loader2 size={48} className="animate-spin text-primary-indigo/20" />
         <p className="font-display font-medium text-on-surface/20 uppercase tracking-[0.3em] text-[10px]">Loading institutional data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex items-center justify-between group">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface tracking-tight">Attendance Management</h1>
          <p className="text-sm text-on-surface/40 mt-1">Real-time tracking, shortage alerts, and leave processing.</p>
        </div>
        <button 
          onClick={loadHubData}
          className="p-3 bg-surface-container-low rounded-2xl text-on-surface/20 hover:text-primary-indigo transition-all hover:rotate-180 duration-700"
        >
          <RefreshCw size={20} />
        </button>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-6 bg-surface-container-lowest border-none shadow-ambient group transition-all hover:bg-secondary-container/5">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500`}>
                {React.cloneElement(kpi.icon as React.ReactElement, { size: 28 })}
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface/30 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                <p className="text-2xl font-display font-bold text-on-surface leading-none">{kpi.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Quick Mark Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-primary-indigo rounded-full" />
               <h3 className="text-lg font-display font-bold text-on-surface">Quick Mark</h3>
             </div>
             <Link href="/attendance/reports" className="text-xs font-bold text-primary-indigo hover:underline flex items-center gap-1 group">
               View All Batches <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map((item, i) => (
              <Link 
                key={i} 
                href={`/attendance/mark?batchId=${item.batchId}&subjectId=${item.subjectId}`}
              >
                <Card className="p-5 bg-surface-container-lowest border-none shadow-ambient group transition-all hover:bg-primary-indigo hover:-translate-y-1 duration-500 cursor-pointer overflow-hidden relative">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface group-hover:bg-white/10 group-hover:text-white transition-colors">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface group-hover:text-white transition-colors">{item.subjectId}</h4>
                        <p className="text-[11px] text-on-surface/40 font-medium group-hover:text-white/60 transition-colors uppercase tracking-wider">{item.batchId}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                       <p className="text-[10px] font-bold text-emerald-500 group-hover:text-white tracking-widest uppercase mb-1">{item.avgAttendance}%</p>
                       <div className="w-16 h-1 bg-surface-container-low rounded-full overflow-hidden group-hover:bg-white/10">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-1000 group-hover:bg-white" 
                            style={{ width: `${item.avgAttendance}%` }} 
                          />
                       </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-0 right-0 p-2 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Clock size={40} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="p-8 bg-surface-container-low/40 rounded-[2rem] border border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface/20 mb-4 border border-white/5 shadow-sm">
                <LayoutGrid size={32} />
             </div>
             <p className="text-sm font-display font-medium text-on-surface/40">Select a class to start marking attendance for today.</p>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
           <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
             <h3 className="text-lg font-display font-bold text-on-surface">Leave Requests</h3>
           </div>
           
           <Card className="p-6 bg-surface-container-lowest border-none shadow-ambient hover:bg-purple-500 group transition-all duration-500 cursor-pointer overflow-hidden relative">
              <Link href="/attendance/leaves" className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-white/10 group-hover:text-white">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface group-hover:text-white transition-colors">Review Leaves</h4>
                    <p className="text-[11px] text-on-surface/40 group-hover:text-white/60 transition-colors">Process pending applications</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-on-surface/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
              <FileText size={80} className="absolute -bottom-6 -right-6 text-purple-500/5 group-hover:text-white/5 transition-colors" />
           </Card>

           <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-blue-blur transition-transform group-hover:rotate-12">
                   <AlertCircle size={20} />
                 </div>
                 <h4 className="font-bold text-sm text-blue-900">Compliance Check</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800/60 mb-4">
                Institutional policies require 75% minimum attendance for final exams. Automated notifications are sent to parents weekly.
              </p>
              <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm">
                Generate AI Insights
              </button>
              <AlertCircle size={100} className="absolute -bottom-10 -right-10 text-blue-500/5 rotate-12" />
           </div>
        </div>
      </div>
    </div>
  );
}

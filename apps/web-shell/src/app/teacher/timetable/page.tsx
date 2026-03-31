"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Users, 
  LayoutDashboard,
  Loader2,
  ChevronRight,
  TrendingUp,
  History,
  ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL, getHeaders } from "@/lib/api/academics";
import Link from 'next/link';

interface TimetableEntry {
  _id: string;
  dayOfWeek: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectId: { _id?: string; name: string; code: string };
  batchId: { _id?: string; name: string };
  room: string;
  section: string;
  isUpcoming?: boolean;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = [
  { id: 1, range: "09:00 - 10:00" },
  { id: 2, range: "10:00 - 11:00" },
  { id: 3, range: "11:15 - 12:15" },
  { id: 4, range: "12:15 - 01:15" },
  { id: 5, range: "02:00 - 03:00" },
  { id: 6, range: "03:00 - 04:00" },
  { id: 7, range: "04:00 - 05:00" },
  { id: 8, range: "05:00 - 06:00" },
];

const getSubjectColor = (name: string) => {
  const colors = [
    { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", accent: "bg-indigo-500" },
    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", accent: "bg-emerald-500" },
    { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", accent: "bg-amber-500" },
    { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", accent: "bg-rose-500" },
    { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-100", accent: "bg-sky-500" },
    { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", accent: "bg-violet-500" },
    { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100", accent: "bg-teal-500" },
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export default function TeacherTimetablePage() {
  const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>({});
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const currentHour = now.getHours();
  const todayName = days[now.getDay() - 1] || "Sunday";

  useEffect(() => {
    fetchTimetableData();
  }, []);

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      const [timeRes, todayRes] = await Promise.all([
        fetch(`${API_URL}/teacher/timetable`, { headers: getHeaders() }),
        fetch(`${API_URL}/teacher/timetable/today`, { headers: getHeaders() })
      ]);

      const [timeData, todayData] = await Promise.all([
        timeRes.json(),
        todayRes.json()
      ]);

      if (timeData.success) setTimetable(timeData.data);
      if (todayData.success) setTodaySchedule(todayData.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight leading-none">
            Academic <span className="text-indigo-600/40">Schedule</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Weekly institutional timeframe for teacher modules</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm pr-6">
           <div className="w-12 h-12 bg-indigo-600 rounded-[1.4rem] flex items-center justify-center text-white shadow-lg shadow-indigo-200">
             <Calendar size={20} />
           </div>
           <div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{todayName}</span>
             <span className="block text-sm font-black text-slate-900 leading-none">{now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[1200px] p-8 lg:p-10">
                {/* Header: Periods */}
                <div className="grid grid-cols-[120px_repeat(8,1fr)] gap-4 mb-8">
                  <div className="flex items-center justify-center">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] rotate-180 [writing-mode:vertical-lr] py-4 h-full">Timeline</span>
                  </div>
                  {periods.map(p => (
                    <div key={p.id} className="text-center space-y-1.5 py-4 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">P {p.id}</span>
                      <span className="text-[9px] font-bold text-slate-400/60 leading-none tabular-nums">{p.range}</span>
                    </div>
                  ))}
                </div>

                {/* Grid Content */}
                <div className="space-y-4">
                  {days.map(day => (
                    <div key={day} className="grid grid-cols-[120px_repeat(8,1fr)] gap-4 group">
                      {/* Day Label */}
                      <div className={cn(
                        "flex flex-col justify-center items-center rounded-[2rem] p-4 transition-all duration-500",
                        day === todayName ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105 z-10" : "bg-slate-50 text-slate-400"
                      )}>
                        <span className="text-sm font-black uppercase tracking-widest">{day.slice(0,3)}</span>
                        {day === todayName && <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 opacity-60">Today</span>}
                      </div>
                      
                      {/* Periods Cells */}
                      {periods.map(p => {
                        const entries = (timetable[day] || {} as any)[p.id] || [];
                        const entry = entries[0];
                        const isToday = day === todayName;
                        
                        if (entry) {
                          const bId = entry.batchId._id || (entry as any).batchId;
                          const sId = entry.subjectId._id || (entry as any).subjectId; 
                          const color = getSubjectColor(entry.subjectId.name);
                          
                          return (
                            <div 
                              key={p.id} 
                              className={cn(
                                "relative group/card rounded-[2rem] h-40 transition-all duration-300 p-5 border overflow-hidden",
                                color.bg, color.border,
                                "hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 cursor-pointer"
                              )}
                            >
                              {/* Top Accent Bar */}
                              <div className={cn("absolute top-0 left-0 w-full h-1.5", color.accent)}></div>

                              <div className="flex flex-col h-full">
                                <div className="space-y-1">
                                  <span className={cn("text-[9px] font-black uppercase tracking-widest", color.text, "opacity-70")}>
                                    {entry.subjectId.code}
                                  </span>
                                  <h4 className="text-xs xl:text-sm font-black text-slate-900 leading-tight line-clamp-2">
                                    {entry.subjectId.name}
                                  </h4>
                                </div>
                                
                                <div className="mt-auto space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                                      <Users size={10} className="text-slate-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-700 truncate">{entry.batchId.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                                      <MapPin size={10} className="text-slate-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-700 truncate">RM {entry.room}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Overlay */}
                              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover/card:translate-y-0 transition-transform duration-300">
                                <Link 
                                    href={`/teacher/attendance?batchId=${bId}&subjectId=${sId}&date=${new Date().toISOString()}&lecture=${p.id}`}
                                    className="w-full bg-slate-900 text-white rounded-[1.2rem] py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl shadow-black/20"
                                >
                                  Mark Matrix <ChevronRight size={14} />
                                </Link>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div key={p.id} className={cn(
                              "rounded-[2rem] h-40 border-2 border-dashed flex items-center justify-center transition-all duration-300",
                              isToday ? "border-indigo-100 bg-indigo-50/20" : "border-slate-50 bg-slate-50/10"
                            )}>
                              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
                                <span className="font-black text-xs">—</span>
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule Sidebar */}
        <div className="w-full xl:w-80 space-y-6 shrink-0">
          <div className="bg-slate-950 rounded-[3rem] shadow-2xl shadow-indigo-100 p-8 space-y-8 sticky top-8 text-white border border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                <LayoutDashboard size={20} className="text-indigo-400" />
                Next Up
              </h3>
              <div className="px-2 py-1 bg-emerald-500/10 rounded-lg">
                <TrendingUp size={14} className="text-emerald-400" />
              </div>
            </div>

            <div className="space-y-4">
              {todaySchedule.length > 0 ? todaySchedule.map((session, idx) => {
                const bId = session.batchId._id || (session as any).batchId;
                const sId = session.subjectId._id || (session as any).subjectId;

                return (
                  <div key={idx} className={cn(
                    "p-6 rounded-[2rem] border transition-all duration-300 group",
                    session.isUpcoming 
                      ? "bg-white/10 border-white/10 hover:bg-white/15 cursor-default" 
                      : "bg-black/20 border-transparent opacity-40 grayscale"
                  )}>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-300/60">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              session.isUpcoming ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-slate-500"
                            )}></span>
                            {session.startTime} - {session.endTime}
                          </div>
                          <h4 className="text-sm font-black text-white leading-tight">
                            {session.subjectId.name}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {session.batchId.name} • RM {session.room}
                          </p>
                        </div>
                      </div>
                      
                      {session.isUpcoming && (
                        <Link 
                          href={`/teacher/attendance?batchId=${bId}&subjectId=${sId}&date=${new Date().toISOString()}&lecture=${session.period}`} 
                          className="w-full py-4 rounded-2xl bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/20"
                        >
                          <ClipboardCheck size={16} /> Open Matrix
                        </Link>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <Calendar size={32} className="text-white/20" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40">No pending sessions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

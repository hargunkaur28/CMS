"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  LayoutDashboard,
  CheckCircle2,
  Loader2,
  ChevronRight,
  TrendingUp,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL, getHeaders } from "@/lib/api/academics";

interface TimetableEntry {
  _id: string;
  dayOfWeek: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectId: { name: string; code: string };
  batchId: { name: string };
  room: string;
  section: string;
  isUpcoming?: boolean;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TeacherTimetablePage() {
  const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>({});
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const todayName = days[now.getDay() - 1] || "Sunday"; // Sunday is 0

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
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Academic <span className="text-slate-400">Schedule</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage your teaching availability and sessions</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white border border-slate-200 rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-sm font-black text-slate-800">{todayName}, {now.toLocaleDateString()}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Weekly Grid */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200 w-36">
                      Day / Period
                    </th>
                    {periods.map(p => (
                      <th key={p} className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200 min-w-[180px]">
                        Period {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day} className={cn(
                      "border-b border-slate-100 last:border-0",
                      day === todayName ? "bg-indigo-50/10" : "bg-white"
                    )}>
                      <td className={cn(
                        "p-6 font-black text-slate-700 border-r border-slate-200",
                        day === todayName ? "text-indigo-600 bg-indigo-50/30" : "bg-slate-50/40"
                      )}>
                        {day}
                        {day === todayName && <div className="text-[9px] text-indigo-400 mt-1 font-black uppercase tracking-widest">Today</div>}
                      </td>
                      {periods.map(p => {
                        const entry = (timetable[day] || []).find(e => e.period === p);
                        return (
                          <td key={p} className={cn(
                            "p-2 border-r border-slate-100 last:border-r-0 h-40 align-top transition-colors",
                            day === todayName ? "bg-indigo-50/5" : "hover:bg-slate-50/20"
                          )}>
                            {entry ? (
                              <div className="h-full bg-slate-900 text-white rounded-[1.5rem] p-4 space-y-3 shadow-lg shadow-slate-900/10 relative overflow-hidden group hover:scale-[1.02] transition-all">
                                 {/* Accent Line */}
                                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-50"></div>
                                 
                                 <div className="flex flex-col h-full justify-between">
                                    <div>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block truncate">
                                        {entry.subjectId.code}
                                      </span>
                                      <h4 className="text-xs font-black truncate mt-1 leading-tight group-hover:text-indigo-300 transition-colors uppercase">
                                        {entry.subjectId.name}
                                      </h4>
                                    </div>
                                    
                                    <div className="space-y-2 pt-2">
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <Users size={12} className="text-slate-500" />
                                        <span>{entry.batchId.name} ({entry.section})</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <MapPin size={12} className="text-slate-500" />
                                        <span>Room {entry.room}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 bg-indigo-500/10 rounded-lg px-2 py-1 w-fit">
                                        <Clock size={12} />
                                        <span>{entry.startTime} - {entry.endTime}</span>
                                      </div>
                                    </div>
                                 </div>
                              </div>
                            ) : (
                              <div className="h-full border border-dashed border-slate-200 rounded-[1.5rem] flex items-center justify-center text-slate-300 group/empty hover:border-slate-300 transition-all">
                                 <span className="text-[10px] uppercase font-black tracking-[0.2em] italic opacity-30 group-hover/empty:opacity-60">No Session</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Today's Schedule Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 space-y-6 sticky top-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <LayoutDashboard size={20} className="text-slate-400" />
                Next Up
              </h3>
              <TrendingUp size={16} className="text-indigo-500" />
            </div>

            <div className="space-y-4">
              {todaySchedule.length > 0 ? todaySchedule.map((session, idx) => (
                <div key={idx} className={cn(
                  "p-5 rounded-3xl border transition-all hover:shadow-md group",
                  session.isUpcoming 
                    ? "bg-white border-slate-100 ring-1 ring-slate-50 shadow-sm" 
                    : "bg-slate-50/50 border-transparent opacity-60"
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          session.isUpcoming ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                        )}></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          {session.startTime}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                        {session.subjectId.name}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500">
                        {session.batchId.name} • RM {session.room}
                      </p>
                    </div>
                    {session.isUpcoming ? (
                      <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-indigo-100 flex items-center gap-1">
                        Up
                        <ChevronRight size={10} />
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-slate-200 flex items-center gap-1">
                        Done
                        <History size={10} />
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center space-y-4 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                  <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
                    <Calendar size={20} className="text-slate-300" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No classes today</p>
                </div>
              )}
            </div>

            <button className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-slate-100 flex items-center justify-center gap-2">
              View Analytics
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

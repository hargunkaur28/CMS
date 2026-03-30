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

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Weekly Grid - NO SCROLL, Fit exactly */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className="w-full h-full">
              {/* Grid Layout definition */}
              <div className="grid grid-cols-[100px_repeat(8,minmax(0,1fr))] gap-2 mb-2">
                <div></div> {/* Corner empty cell */}
                {periods.map(p => (
                  <div key={p} className="text-center font-black pb-2 border-b border-slate-100 flex flex-col justify-end">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none">P {p}</span>
                  </div>
                ))}
              </div>

              {days.map(day => (
                <div key={day} className="grid grid-cols-[100px_repeat(8,minmax(0,1fr))] gap-2 mb-2 group">
                  <div className={cn(
                    "flex flex-col justify-center rounded-2xl p-2",
                    day === todayName ? "bg-indigo-50" : ""
                  )}>
                    <span className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      day === todayName ? "text-indigo-600" : "text-slate-600"
                    )}>{day.slice(0,3)}</span>
                    {day === todayName && <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Today</span>}
                  </div>
                  
                  {periods.map(p => {
                    const entry = (timetable[day] || {} as any)[p]?.[0];
                    
                    if (entry) {
                      // Validate if we have batch and subject IDs for routing
                      const bId = entry.batchId._id || (entry as any).batchId; // Fallbacks depending on populate structure
                      const sId = entry.subjectId._id || (entry as any).subjectId; 
                      
                      return (
                        <div key={p} className={cn(
                          "relative rounded-[1.2rem] h-28 xl:h-32 p-3 space-y-1 overflow-hidden transition-all group/card",
                          day === todayName 
                            ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:-translate-y-1" 
                            : "bg-slate-50 border border-slate-100 hover:border-slate-300 hover:shadow-md hover:-translate-y-1"
                        )}>
                          {day === todayName && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-50"></div>
                          )}
                          
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              <p className={cn("text-[9px] font-black uppercase tracking-widest truncate", day === todayName ? "text-slate-400" : "text-slate-500")}>
                                {entry.subjectId.code}
                              </p>
                              <p className="text-[10px] xl:text-xs font-black leading-tight truncate mt-0.5">
                                {entry.subjectId.name}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className={cn("text-[9px] font-bold truncate flex items-center gap-1", day === todayName ? "text-slate-300" : "text-slate-500")}>
                                <Users size={10} /> {entry.batchId.name}
                              </p>
                              <p className={cn("text-[9px] font-bold flex items-center gap-1", day === todayName ? "text-slate-300" : "text-slate-500")}>
                                <MapPin size={10} /> {entry.room}
                              </p>
                            </div>
                            
                            {/* Hover Overlay Button */}
                            <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 rounded-[1.2rem]">
                              <p className="text-[10px] font-black text-white mb-2 tracking-widest uppercase">P {entry.period}</p>
                              <Link 
                                href={`/teacher/attendance?batchId=${bId}&subjectId=${sId}&lecture=${entry.period}`}
                                className="w-full bg-white text-indigo-600 text-[9px] font-black uppercase tracking-widest py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-slate-50 transition-colors shadow-lg shadow-black/20"
                              >
                                Mark <ChevronRight size={10} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={p} className={cn(
                          "rounded-[1.2rem] h-28 xl:h-32 border border-dashed flex items-center justify-center",
                          day === todayName ? "border-slate-200 bg-slate-50/50" : "border-slate-100 opacity-50"
                        )}>
                          <span className="text-[8px] xl:text-[9px] font-bold text-slate-300 uppercase tracking-widest">Free</span>
                        </div>
                      );
                    }
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Schedule Sidebar */}
        <div className="w-full xl:w-80 space-y-6 shrink-0">
          <div className="bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-900/10 p-6 xl:p-8 space-y-6 sticky top-8 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
                <LayoutDashboard size={20} className="text-slate-400" />
                Next Up
              </h3>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>

            <div className="space-y-3">
              {todaySchedule.length > 0 ? todaySchedule.map((session, idx) => {
                const bId = session.batchId._id || (session as any).batchId;
                const sId = session.subjectId._id || (session as any).subjectId;

                return (
                  <div key={idx} className={cn(
                    "p-5 rounded-3xl border transition-all",
                    session.isUpcoming 
                      ? "bg-white/10 border-white/20 hover:bg-white/15 cursor-default group" 
                      : "bg-black/20 border-transparent opacity-60"
                  )}>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full inline-block",
                              session.isUpcoming ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                            )}></span>
                            {session.startTime} - {session.endTime}
                          </div>
                          <h4 className="text-sm font-black text-white leading-tight pr-4">
                            {session.subjectId.name}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {session.batchId.name} • RM {session.room}
                          </p>
                        </div>
                        
                        <div className="shrink-0 mt-1">
                          {session.isUpcoming ? (
                            <span className="bg-indigo-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-500/20">Up</span>
                          ) : (
                            <span className="bg-white/10 text-white/50 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Done</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Action */}
                      <Link 
                        href={`/teacher/attendance?batchId=${bId}&subjectId=${sId}&lecture=${session.period}`} 
                        className={cn(
                          "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all group-hover:bg-white group-hover:text-slate-900 border border-white/10",
                          session.isUpcoming ? "bg-white/5 text-white" : "hidden"
                        )}
                      >
                        <ClipboardCheck size={14} /> Open Matrix
                      </Link>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-12 text-center text-slate-500">
                  <Calendar size={28} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">No classes today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

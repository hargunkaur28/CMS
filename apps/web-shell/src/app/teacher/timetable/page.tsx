"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Loader2,
  ChevronRight,
  ClipboardCheck,
  BookOpen,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL, getHeaders } from "@/lib/api/academics";
import Link from "next/link";

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
  { id: 1, range: "09:00–10:00" },
  { id: 2, range: "10:00–11:00" },
  { id: 3, range: "11:15–12:15" },
  { id: 4, range: "12:15–13:15" },
  { id: 5, range: "14:00–15:00" },
  { id: 6, range: "15:00–16:00" },
  { id: 7, range: "16:00–17:00" },
];

const SUBJECT_PALETTES = [
  { bg: "bg-violet-100", text: "text-violet-700", bar: "bg-violet-500", badge: "bg-violet-500/10 text-violet-600" },
  { bg: "bg-sky-100",    text: "text-sky-700",    bar: "bg-sky-500",    badge: "bg-sky-500/10 text-sky-600" },
  { bg: "bg-emerald-100",text: "text-emerald-700",bar: "bg-emerald-500",badge: "bg-emerald-500/10 text-emerald-600" },
  { bg: "bg-amber-100",  text: "text-amber-700",  bar: "bg-amber-500",  badge: "bg-amber-500/10 text-amber-600" },
  { bg: "bg-rose-100",   text: "text-rose-700",   bar: "bg-rose-500",   badge: "bg-rose-500/10 text-rose-600" },
  { bg: "bg-teal-100",   text: "text-teal-700",   bar: "bg-teal-500",   badge: "bg-teal-500/10 text-teal-600" },
  { bg: "bg-orange-100", text: "text-orange-700", bar: "bg-orange-500", badge: "bg-orange-500/10 text-orange-600" },
];

const getColor = (name: string) =>
  SUBJECT_PALETTES[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % SUBJECT_PALETTES.length];

export default function TeacherTimetablePage() {
  const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>({});
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const todayName = days[now.getDay() - 1] ?? "Sunday";
  const dateLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timeRes, todayRes] = await Promise.all([
        fetch(`${API_URL}/teacher/timetable`, { headers: getHeaders() }),
        fetch(`${API_URL}/teacher/timetable/today`, { headers: getHeaders() }),
      ]);
      const [timeData, todayData] = await Promise.all([timeRes.json(), todayRes.json()]);
      if (timeData.success) setTimetable(timeData.data);
      if (todayData.success) setTodaySchedule(todayData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Derived stats
  const totalWeekClasses = days.reduce((sum, d) =>
    sum + Object.values((timetable[d] || {}) as Record<string, TimetableEntry[]>).flat().length, 0);
  const todayTotal = todaySchedule.length;
  const upcomingCount = todaySchedule.filter(s => s.isUpcoming).length;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 xl:p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-1">Academic Hub</p>
          <h1 className="text-3xl xl:text-4xl font-black text-slate-950 tracking-tight leading-none">
            Weekly <span className="text-slate-300">Schedule</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-2">{dateLabel}</p>
        </div>

        {/* Stat Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BookOpen size={13} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none">This Week</p>
              <p className="text-sm font-black text-slate-900 leading-none mt-0.5">{totalWeekClasses} classes</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Zap size={13} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none">Today</p>
              <p className="text-sm font-black text-slate-900 leading-none mt-0.5">{todayTotal} sessions</p>
            </div>
          </div>

          {upcomingCount > 0 && (
            <div className="flex items-center gap-2 bg-indigo-600 rounded-2xl px-4 py-2.5 shadow-lg shadow-indigo-200">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white">{upcomingCount} upcoming</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-col xl:flex-row gap-6">

        {/* ── Timetable Grid ── */}
        <div className="flex-1 min-w-0 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/60 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">

              {/* Period Header Row */}
              <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-slate-100">
                <div className="p-4 flex items-center justify-center">
                  <Clock size={14} className="text-slate-300" />
                </div>
                {periods.map(p => (
                  <div key={p.id} className="p-4 border-l border-slate-100 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">P{p.id}</p>
                    <p className="text-[9px] font-bold text-slate-300 mt-0.5 tabular-nums">{p.range}</p>
                  </div>
                ))}
              </div>

              {/* Day Rows */}
              {days.map((day, dayIdx) => {
                const isToday = day === todayName;
                return (
                  <div
                    key={day}
                    className={cn(
                      "grid grid-cols-[100px_repeat(7,1fr)]",
                      dayIdx !== days.length - 1 && "border-b border-slate-100",
                      isToday && "bg-indigo-50/40"
                    )}
                  >
                    {/* Day Label */}
                    <div className={cn(
                      "p-4 flex flex-col items-center justify-center gap-1",
                      isToday ? "border-r-2 border-indigo-500" : "border-r border-slate-100"
                    )}>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isToday ? "text-indigo-600" : "text-slate-400"
                      )}>{day.slice(0, 3)}</span>
                      {isToday && (
                        <span className="text-[8px] font-black bg-indigo-600 text-white rounded-full px-2 py-0.5 uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Period Cells */}
                    {periods.map(p => {
                      const entries = ((timetable[day] || {}) as any)[p.id] || [];
                      const entry: TimetableEntry | undefined = entries[0];

                      if (entry) {
                        const color = getColor(entry.subjectId.name);
                        const bId = entry.batchId._id || (entry as any).batchId;
                        const sId = entry.subjectId._id || (entry as any).subjectId;

                        return (
                          <div
                            key={p.id}
                            className={cn(
                              "relative border-l border-slate-100 p-3 group/cell transition-all duration-200",
                              color.bg,
                              "hover:brightness-95 cursor-pointer"
                            )}
                          >
                            {/* Left accent bar */}
                            <div className={cn("absolute left-0 top-2 bottom-2 w-1 rounded-r-full", color.bar)} />

                            <div className="pl-2 flex flex-col h-full gap-2">
                              {/* Subject code badge */}
                              <span className={cn("text-[8px] font-black uppercase tracking-widest rounded-md px-1.5 py-0.5 self-start", color.badge)}>
                                {entry.subjectId.code}
                              </span>

                              {/* Subject name */}
                              <p className={cn("text-[11px] font-black leading-tight line-clamp-2", color.text)}>
                                {entry.subjectId.name}
                              </p>

                              {/* Meta */}
                              <div className="mt-auto space-y-1">
                                <div className="flex items-center gap-1">
                                  <Users size={9} className="text-slate-500 shrink-0" />
                                  <span className="text-[9px] font-bold text-slate-600 truncate">{entry.batchId.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin size={9} className="text-slate-500 shrink-0" />
                                  <span className="text-[9px] font-bold text-slate-600">Rm {entry.room}</span>
                                </div>
                              </div>
                            </div>

                            {/* Hover action */}
                            <Link
                              href={`/teacher/attendance?batchId=${bId}&subjectId=${sId}&date=${new Date().toISOString()}&lecture=${p.id}`}
                              onClick={e => e.stopPropagation()}
                              className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200 rounded-none"
                            >
                              <div className="flex items-center gap-2 bg-white text-slate-900 rounded-2xl px-3 py-2 text-[9px] font-black uppercase tracking-widest shadow-xl">
                                <ClipboardCheck size={12} /> Attendance
                              </div>
                            </Link>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={p.id}
                          className={cn(
                            "border-l border-slate-100 flex items-center justify-center",
                            isToday ? "bg-indigo-50/30" : "bg-transparent"
                          )}
                          style={{ minHeight: "88px" }}
                        >
                          <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <span className="text-[8px] text-slate-200 font-black">–</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Today's Sidebar ── */}
        <div className="w-full xl:w-72 shrink-0 space-y-4">

          {/* Header card */}
          <div className="bg-slate-950 rounded-3xl p-6 border border-white/5 text-white">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Today's Queue</p>
              <div className={cn(
                "w-2 h-2 rounded-full",
                upcomingCount > 0 ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.7)]" : "bg-slate-600"
              )} />
            </div>
            <p className="text-xl font-black tracking-tight">{todayName}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
              {todayTotal > 0 ? `${todayTotal} session${todayTotal > 1 ? "s" : ""} scheduled` : "No sessions today"}
            </p>
          </div>

          {/* Session list */}
          <div className="space-y-3">
            {todaySchedule.length > 0 ? todaySchedule.map((s, i) => {
              const bId = s.batchId._id || (s as any).batchId;
              const sId = s.subjectId._id || (s as any).subjectId;
              const color = getColor(s.subjectId.name);

              return (
                <div
                  key={i}
                  className={cn(
                    "bg-white rounded-2xl border p-4 transition-all duration-300",
                    s.isUpcoming
                      ? "border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      : "border-slate-100 opacity-40 grayscale"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Color dot */}
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", color.bar)} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                          {s.startTime} – {s.endTime}
                        </span>
                        {s.isUpcoming && (
                          <span className="text-[7px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-full px-1.5 py-0.5">
                            Up Next
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-slate-900 leading-tight truncate">{s.subjectId.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">
                        {s.batchId.name} · Rm {s.room}
                      </p>
                    </div>
                  </div>

                  {s.isUpcoming && (
                    <Link
                      href={`/teacher/attendance?batchId=${bId}&subjectId=${sId}&date=${new Date().toISOString()}&lecture=${s.period}`}
                      className="mt-3 w-full bg-slate-950 text-white rounded-xl py-2.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                      <ClipboardCheck size={12} /> Mark Attendance <ChevronRight size={11} />
                    </Link>
                  )}
                </div>
              );
            }) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center space-y-3">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                  <Calendar size={24} className="text-slate-300" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No sessions today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  X,
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

const TIME_SLOTS = [
  { period: 1, start: "09:00", end: "10:00", label: "9:00 AM – 10:00 AM", short: "9–10 AM" },
  { period: 2, start: "10:00", end: "11:00", label: "10:00 AM – 11:00 AM", short: "10–11 AM" },
  { period: 3, start: "11:00", end: "12:00", label: "11:00 AM – 12:00 PM", short: "11–12 PM" },
  { period: 4, start: "12:00", end: "13:00", label: "12:00 PM – 1:00 PM", short: "12–1 PM" },
  { period: 5, start: "13:00", end: "14:00", label: "1:00 PM – 2:00 PM", short: "1–2 PM" },
  { period: 6, start: "14:00", end: "15:00", label: "2:00 PM – 3:00 PM", short: "2–3 PM" },
  { period: 7, start: "15:00", end: "16:00", label: "3:00 PM – 4:00 PM", short: "3–4 PM" },
  { period: 8, start: "16:00", end: "17:00", label: "4:00 PM – 5:00 PM", short: "4–5 PM" },
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

const getColor = (name: string | undefined) =>
  SUBJECT_PALETTES[((name || "x").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % SUBJECT_PALETTES.length];

export default function TeacherTimetablePage() {
  // Correct type: day -> startTime -> entries[]
  const [timetable, setTimetable] = useState<Record<string, Record<string, TimetableEntry[]>>>({}); // Fixed closing parenthesis
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ entry: TimetableEntry; day: string; slot: typeof TIME_SLOTS[number] } | null>(null);

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
      console.log('[TIMETABLE] weekly data:', JSON.stringify(timeData).slice(0, 500));
      console.log('[TIMETABLE] today data:', JSON.stringify(todayData).slice(0, 500));
      if (timeData.success) setTimetable(timeData.data);
      if (todayData.success) setTodaySchedule(todayData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Flatten nested day -> startTime -> entries structure for total count
  const totalWeekClasses = days.reduce((sum, d) =>
    sum + Object.values(timetable[d] || {}).flatMap(v => v).length, 0);
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
              <div className="grid grid-cols-[100px_repeat(8,1fr)] border-b border-slate-100">
                <div className="p-4 flex items-center justify-center">
                  <Clock size={14} className="text-slate-300" />
                </div>
                {TIME_SLOTS.map(s => (
                  <div key={s.period} className="p-4 border-l border-slate-100 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">P{s.period}</p>
                    <p className="text-[9px] font-bold text-slate-300 mt-0.5 tabular-nums">{s.short}</p>
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
                      "grid grid-cols-[100px_repeat(8,1fr)]",
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
                    {TIME_SLOTS.map(slot => {
                      // Primary: lookup by startTime. Fallback: lookup by period number across all slots in that day
                      const dayEntries = timetable[day] || {};
                      const byStart = dayEntries[slot.start] || [];
                      // Fallback: find any entry whose period matches this slot
                      const byPeriod = byStart.length === 0
                        ? Object.values(dayEntries).flat().filter((e: any) => e.period === slot.period)
                        : [];
                      const entries = byStart.length > 0 ? byStart : byPeriod;
                      const entry: TimetableEntry | undefined = (entries as TimetableEntry[])[0];

                      if (entry) {
                        const subName = (entry.subjectId as any)?.name || "";
                        const subCode = (entry.subjectId as any)?.code || "";
                        const batchName = (entry.batchId as any)?.name || "";
                        const color = getColor(subName);
                        const bId = (entry.batchId as any)?._id || (entry as any).batchId;
                        const sId = (entry.subjectId as any)?._id || (entry as any).subjectId;

                        return (
                          <div
                            key={slot.period}
                            onClick={() => setSelectedSlot({ entry, day, slot })}
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
                                {subCode}
                              </span>

                              {/* Subject name */}
                              <p className={cn("text-[11px] font-black leading-tight line-clamp-2", color.text)}>
                                {subName}
                              </p>

                              {/* Meta */}
                              <div className="mt-auto space-y-1">
                                <div className="flex items-center gap-1">
                                  <Users size={9} className="text-slate-500 shrink-0" />
                                  <span className="text-[9px] font-bold text-slate-600 truncate">{batchName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin size={9} className="text-slate-500 shrink-0" />
                                  <span className="text-[9px] font-bold text-slate-600">Rm {entry.room}</span>
                                </div>
                              </div>
                            </div>

                            {/* Hover action */}
                            <Link
                              href={`/teacher/attendance?batchId=${bId}&subjectId=${sId}&date=${new Date().toISOString()}&lecture=${slot.period}${entry.section ? `&section=${entry.section}` : ''}`}
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
                          key={slot.period}
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
            {todaySchedule.length > 0 ? todaySchedule.map((s: any, i) => {
              const subName = s.subjectId?.name || "";
              const subCode = s.subjectId?.code || "";
              const batchName = s.batchId?.name || "";
              const bId = s.batchId?._id || (s as any).batchId;
              const sId = s.subjectId?._id || (s as any).subjectId;
              const color = getColor(subName);

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
                      <p className="text-sm font-black text-slate-900 leading-tight truncate">{subName}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">
                        {batchName} · Rm {s.room}
                      </p>
                    </div>
                  </div>

                  {s.isUpcoming && (
                    <Link
                      href={`/teacher/attendance?batchId=${bId}&subjectId=${sId}&date=${new Date().toISOString()}&lecture=${s.period}${s.section ? `&section=${s.section}` : ''}`}
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

      {/* Slot Detail Modal */}
      {selectedSlot && (() => {
        const { entry, day, slot } = selectedSlot;
        const subName = (entry.subjectId as any)?.name || "";
        const subCode = (entry.subjectId as any)?.code || "";
        const batchName = (entry.batchId as any)?.name || "";
        const color = getColor(subName);
        const bId = (entry.batchId as any)?._id || (entry as any).batchId;
        const sId = (entry.subjectId as any)?._id || (entry as any).subjectId;
        return (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSlot(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Top accent */}
              <div className={cn("h-1.5 w-full", color.bar)} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest rounded-md px-2 py-1", color.badge)}>
                      {subCode}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-2 leading-tight">{subName}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X size={16} className="text-slate-500" />
                  </button>
                </div>

                <div className="space-y-3 py-4 border-y border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <Calendar size={14} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Day</p>
                      <p className="text-sm font-black text-slate-800">{day}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <Clock size={14} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Period {slot.period} · Time</p>
                      <p className="text-sm font-black text-slate-800">{slot.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <Users size={14} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Batch · Section</p>
                      <p className="text-sm font-black text-slate-800">{batchName} · Section {entry.section}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <MapPin size={14} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Room</p>
                      <p className="text-sm font-black text-slate-800">{entry.room}</p>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/teacher/attendance?batchId=${bId}&subjectId=${sId}&date=${new Date().toISOString()}&lecture=${slot.period}${entry.section ? `&section=${entry.section}` : ''}`}
                  className="mt-4 w-full bg-slate-950 text-white rounded-2xl py-3.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                  onClick={() => setSelectedSlot(null)}
                >
                  <ClipboardCheck size={14} /> Mark Attendance
                </Link>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

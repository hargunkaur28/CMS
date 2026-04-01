"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  MapPin,
  Users,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL, getHeaders } from "@/lib/api/academics";

// ── Fixed Time Slots (single source of truth on frontend) ──
const TIME_SLOTS = [
  { period: 1, start: "09:00", end: "10:00", label: "9:00 AM – 10:00 AM" },
  { period: 2, start: "10:00", end: "11:00", label: "10:00 AM – 11:00 AM" },
  { period: 3, start: "11:00", end: "12:00", label: "11:00 AM – 12:00 PM" },
  { period: 4, start: "12:00", end: "13:00", label: "12:00 PM – 1:00 PM" },
  { period: 5, start: "13:00", end: "14:00", label: "1:00 PM – 2:00 PM" },
  { period: 6, start: "14:00", end: "15:00", label: "2:00 PM – 3:00 PM" },
  { period: 7, start: "15:00", end: "16:00", label: "3:00 PM – 4:00 PM" },
  { period: 8, start: "16:00", end: "17:00", label: "4:00 PM – 5:00 PM" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Faculty {
  _id: string;
  userId: { _id: string; name: string };
  personalInfo?: { name?: string };
}
interface Subject { _id: string; name: string; code: string; }
interface Batch { _id: string; name: string; sections?: string[]; }
interface TimetableEntry {
  _id: string;
  dayOfWeek: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectId: { name: string; code: string };
  teacherId: { name: string; email: string };
  batchId: { name: string };
  room: string;
  section: string;
}

const SLOT_COLORS = [
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", badge: "bg-rose-100 text-rose-700" },
  { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", badge: "bg-sky-100 text-sky-700" },
  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", badge: "bg-violet-100 text-violet-700" },
  { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", badge: "bg-teal-100 text-teal-700" },
];

const getColor = (name: string) =>
  SLOT_COLORS[(name || "x").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % SLOT_COLORS.length];

export default function TimetableBuilderPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  // timetable is now keyed: { [day]: { [startTime]: TimetableEntry[] } }
  const [timetable, setTimetable] = useState<Record<string, Record<string, TimetableEntry[]>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form
  const [formData, setFormData] = useState({
    subjectId: "",
    batchId: "",
    section: "A",
    room: "",
    dayOfWeek: "Monday",
    startTime: "09:00",
    academicYear: "2025-26",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedTeacherId) params.set("teacherId", selectedTeacherId);

      const [facRes, subRes, batRes, timeRes] = await Promise.all([
        fetch(`${API_URL}/admin/faculty`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/subjects`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/batches`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/timetable?${params}`, { headers: getHeaders() }),
      ]);

      const [facData, subData, batData, timeData] = await Promise.all([
        facRes.json(), subRes.json(), batRes.json(), timeRes.json(),
      ]);

      if (facData.success) setFaculties(facData.data);
      if (subData.success) setSubjects(subData.data);
      if (batData.success) setBatches(batData.data);
      if (timeData.success) setTimetable(timeData.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTeacherId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refreshTimetable = async () => {
    const params = new URLSearchParams();
    if (selectedTeacherId) params.set("teacherId", selectedTeacherId);
    const res = await fetch(`${API_URL}/admin/timetable?${params}`, { headers: getHeaders() });
    const data = await res.json();
    if (data.success) setTimetable(data.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      setMessage({ type: "error", text: "Please select a teacher first." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/admin/timetable`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          ...formData,
          teacherId: selectedTeacherId,
          classId: formData.batchId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Entry created successfully!" });
        await refreshTimetable();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to create entry" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this timetable entry?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/timetable/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Entry deleted." });
        await refreshTimetable();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.message || "Delete failed." });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred." });
    }
  };

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const teacherName = faculties.find(f => f.userId?._id === selectedTeacherId)?.userId?.name;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header + Teacher Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight leading-none">
            Timetable <span className="text-indigo-500/40">Builder</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            {selectedTeacherId && teacherName
              ? `Showing schedule for ${teacherName}`
              : "Select a teacher to manage their timetable"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <UserIcon size={16} className="text-indigo-500" />
            <select
              className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer min-w-[180px]"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
            >
              <option value="">-- Select Teacher --</option>
              {faculties.map(f => (
                <option key={f._id} value={f.userId?._id}>
                  {f.userId?.name || f.personalInfo?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Cycle</span>
            <span className="text-xs font-black text-slate-900">{formData.academicYear}</span>
          </div>
        </div>
      </div>

      {/* ── Toast Message ── */}
      {message && (
        <div className={cn(
          "px-5 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-2 duration-200",
          message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        )}>
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-white/50 rounded-lg"><X size={14} /></button>
        </div>
      )}

      {/* ── Add Entry Form (Horizontal) ── */}
      {selectedTeacherId && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-end gap-3 flex-wrap">
            {/* Day */}
            <div className="space-y-1 min-w-[120px]">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Day</label>
              <select
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                value={formData.dayOfWeek}
                onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Time Slot */}
            <div className="space-y-1 min-w-[180px]">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Slot</label>
              <select
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              >
                {TIME_SLOTS.map(s => (
                  <option key={s.period} value={s.start}>P{s.period} · {s.label}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1 min-w-[160px] flex-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
              <select
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                value={formData.subjectId}
                onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>[{s.code}] {s.name}</option>
                ))}
              </select>
            </div>

            {/* Batch */}
            <div className="space-y-1 min-w-[130px]">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Batch</label>
              <select
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                value={formData.batchId}
                onChange={e => setFormData({ ...formData, batchId: e.target.value })}
              >
                <option value="">Select</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>

            {/* Section */}
            <div className="space-y-1 w-[70px]">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sec</label>
              <input
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                value={formData.section}
                onChange={e => setFormData({ ...formData, section: e.target.value })}
                placeholder="A"
              />
            </div>

            {/* Room */}
            <div className="space-y-1 w-[90px]">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room</label>
              <input
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
                placeholder="302"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-200 whitespace-nowrap"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add
            </button>
          </div>
        </form>
      )}

      {/* ── Timetable Grid ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest w-[140px] border-r border-slate-100">
                  Time Slot
                </th>
                {DAYS.map(day => (
                  <th key={day} className="p-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-r-0">
                    {day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, slotIdx) => (
                <tr key={slot.period} className={cn(
                  "border-b border-slate-100 last:border-b-0",
                  slotIdx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                )}>
                  {/* Time label cell */}
                  <td className="p-3 border-r border-slate-100 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-indigo-600">P{slot.period}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-600 leading-tight whitespace-nowrap">{slot.label}</p>
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {DAYS.map(day => {
                    const entries = (timetable[day] || {})[slot.start] || [];
                    const entry = entries[0];
                    const hasConflict = entries.length > 1;

                    if (entry) {
                      const color = getColor(entry.subjectId?.name);
                      return (
                        <td key={day} className="p-1.5 border-r border-slate-100 last:border-r-0 align-top">
                          <div className={cn(
                            "rounded-xl p-2.5 h-full relative group/cell transition-all border",
                            hasConflict ? "bg-rose-50 border-rose-200" : `${color.bg} ${color.border}`
                          )}>
                            {hasConflict && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center z-10">
                                <AlertCircle size={10} />
                              </div>
                            )}
                            <div className="space-y-1">
                              <span className={cn("text-[8px] font-black uppercase tracking-widest", hasConflict ? "text-rose-600" : color.text)}>
                                {entry.subjectId?.code}
                              </span>
                              <p className="text-[10px] font-black text-slate-800 leading-tight line-clamp-2">
                                {entry.subjectId?.name}
                              </p>
                              <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                                <Users size={9} />
                                <span className="truncate">{entry.batchId?.name} ({entry.section})</span>
                              </div>
                              <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                                <MapPin size={9} />
                                <span>Rm {entry.room}</span>
                              </div>
                            </div>
                            {/* Hover actions */}
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleDelete(entry._id)}
                                className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
                                title="Delete"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={day} className="p-1.5 border-r border-slate-100 last:border-r-0 align-top">
                        <div className="h-[80px] rounded-xl border border-dashed border-slate-100 flex items-center justify-center bg-slate-50/30 hover:bg-indigo-50/30 hover:border-indigo-200 transition-colors cursor-default">
                          <span className="text-slate-200 text-lg font-light">—</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── No teacher selected state ── */}
      {!selectedTeacherId && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon size={28} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-400">Select a teacher above to view and manage their timetable</p>
        </div>
      )}
    </div>
  );
}

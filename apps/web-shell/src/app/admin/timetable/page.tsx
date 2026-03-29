"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL, getHeaders } from "@/lib/api/academics";

interface Faculty {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  personalInfo?: {
    name?: string;
  };
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface Batch {
  _id: string;
  name: string;
}

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

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function TimetableBuilderPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [timetable, setTimetable] = useState<Record<string, Record<number, TimetableEntry[]>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    teacherId: "",
    subjectId: "",
    batchId: "",
    classId: "", // Logic: select batch first, then class if needed, or mapping
    section: "A",
    room: "",
    dayOfWeek: "Monday",
    period: 1,
    startTime: "09:00",
    endTime: "10:00",
    academicYear: "2025-26"
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [facRes, subRes, batRes, timeRes] = await Promise.all([
        fetch(`${API_URL}/admin/faculty`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/subjects`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/batches`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/timetable`, { headers: getHeaders() })
      ]);

      const [facData, subData, batData, timeData] = await Promise.all([
        facRes.json(),
        subRes.json(),
        batRes.json(),
        timeRes.json()
      ]);

      if (facData.success) setFaculties(facData.data);
      if (subData.success) setSubjects(subData.data);
      if (batData.success) setBatches(batData.data);
      if (timeData.success) {
        // Data is already grouped by dayOfWeek from backend
        setTimetable(timeData.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/admin/timetable`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...formData,
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: "Timetable entry created successfully!" });
        // Refresh timetable
        const timeRes = await fetch(`${API_URL}/admin/timetable`, { headers: getHeaders() });
        const timeData = await timeRes.json();
        if (timeData.success) setTimetable(timeData.data);
      } else {
        setMessage({ type: 'error', text: data.message || "Failed to create entry" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
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
            Timetable <span className="text-slate-400">Builder</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Design and manage institutional weekly schedules</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
             <Calendar size={16} className="text-slate-400" />
             <span className="text-sm font-bold text-slate-700">{formData.academicYear}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Builder Form */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden sticky top-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus size={20} className="text-slate-400" />
                Add Entry
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {message && (
                <div className={cn(
                  "p-4 rounded-2xl flex items-start gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2",
                  message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                )}>
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{message.text}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teacher</label>
                    <select 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                      value={formData.teacherId}
                      onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                    >
                      <option value="">Select Faculty</option>
                      {faculties.map(f => (
                        <option key={f._id} value={f.userId?._id}>
                          {f.userId?.name || f.personalInfo?.name || 'Unnamed Faculty'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject</label>
                    <select 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                      value={formData.subjectId}
                      onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => (
                        <option key={s._id} value={s._id}>[{s.code}] {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Batch</label>
                      <select 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                        value={formData.batchId}
                        onChange={e => setFormData({ ...formData, batchId: e.target.value, classId: e.target.value })}
                      >
                        <option value="">Select Batch</option>
                        {batches.map(b => (
                          <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Section</label>
                      <input 
                        required
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                        value={formData.section}
                        onChange={e => setFormData({ ...formData, section: e.target.value })}
                        placeholder="e.g. A"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Day</label>
                      <select 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                        value={formData.dayOfWeek}
                        onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                      >
                        {days.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Period</label>
                      <input 
                        required
                        type="number"
                        min="1"
                        max="10"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                        value={formData.period}
                        onChange={e => setFormData({ ...formData, period: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Time</label>
                      <input 
                        required
                        type="time"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                        value={formData.startTime}
                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Time</label>
                      <input 
                        required
                        type="time"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                        value={formData.endTime}
                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Room Number</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                      value={formData.room}
                      onChange={e => setFormData({ ...formData, room: e.target.value })}
                      placeholder="e.g. 302"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Add to Timetable
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200 w-36">
                      Day / Period
                    </th>
                    {periods.map(p => (
                      <th key={p} className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200 min-w-[200px]">
                        Period {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day} className="border-b border-slate-100 last:border-0 group">
                      <td className="p-6 font-black text- slate-700 bg-slate-50/40 border-r border-slate-200">
                        {day}
                      </td>
                      {periods.map(p => {
                        const entries = (timetable[day] || {})[p] || [];
                        return (
                          <td key={p} className="p-2 border-r border-slate-100 last:border-r-0 min-h-[140px] align-top bg-white group-hover:bg-slate-50/20 transition-colors">
                            {entries.length > 0 ? (
                              <div className="space-y-2">
                                {entries.map((entry, idx) => (
                                  <div key={idx} className={cn(
                                    "rounded-2xl p-4 space-y-2.5 shadow-sm border border-slate-100 relative group/entry transition-all hover:shadow-md",
                                    entries.length > 1 ? "bg-red-50 border-red-200" : "bg-white"
                                  )}>
                                     {entries.length > 1 && (
                                       <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md z-10">
                                         <AlertCircle size={12} />
                                       </div>
                                     )}
                                     
                                     <div>
                                       <div className="flex items-center justify-between">
                                         <span className={cn(
                                           "text-[9px] font-black uppercase tracking-widest",
                                           entries.length > 1 ? "text-red-400" : "text-slate-400"
                                         )}>
                                           {entry.subjectId?.code}
                                         </span>
                                       </div>
                                       <h4 className="text-xs font-black text-slate-900 leading-tight mt-0.5">
                                         {entry.subjectId?.name}
                                       </h4>
                                     </div>

                                     <div className="space-y-1.5 pt-1">
                                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                         <UserIcon size={12} className="text-slate-300" />
                                         <span className="truncate">{entry.teacherId?.name}</span>
                                       </div>
                                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                         <Users size={12} className="text-slate-300" />
                                         <span>{entry.batchId?.name} ({entry.section})</span>
                                       </div>
                                       <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 pt-1 border-t border-slate-50">
                                          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400">
                                            <MapPin size={10} />
                                            <span>RM {entry.room}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500">
                                            <Clock size={10} />
                                            <span>{entry.startTime}</span>
                                          </div>
                                       </div>
                                     </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-24 border border-dashed border-slate-100 rounded-2xl flex items-center justify-center group/empty transition-all hover:border-slate-300 hover:bg-white/50">
                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-200 group-hover/empty:text-slate-300 transition-colors italic">—</span>
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
      </div>
    </div>
  );
}

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

const getSubjectColor = (name: string) => {
  const colors = [
    { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", accent: "bg-indigo-500", light: "bg-indigo-50/50" },
    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", accent: "bg-emerald-500", light: "bg-emerald-50/50" },
    { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", accent: "bg-amber-500", light: "bg-amber-50/50" },
    { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", accent: "bg-rose-500", light: "bg-rose-50/50" },
    { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-100", accent: "bg-sky-500", light: "bg-sky-50/50" },
    { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", accent: "bg-violet-500", light: "bg-violet-50/50" },
    { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100", accent: "bg-teal-500", light: "bg-teal-50/50" },
  ];
  const index = (name || 'default').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export default function TimetableBuilderPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");
  const [timetable, setTimetable] = useState<Record<string, Record<number, TimetableEntry[]>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    teacherId: "",
    subjectId: "",
    batchId: "",
    classId: "",
    section: "A",
    room: "",
    dayOfWeek: "Monday",
    period: 1,
    startTime: "09:00",
    endTime: "10:00",
    academicYear: "2025-26"
  });

  // Sync form with filter
  useEffect(() => {
    if (selectedTeacherId !== "all") {
      setFormData(prev => ({ ...prev, teacherId: selectedTeacherId }));
    }
  }, [selectedTeacherId]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_URL}/admin/timetable`);
      if (selectedTeacherId !== "all") url.searchParams.append("teacherId", selectedTeacherId);

      const [facRes, subRes, batRes, timeRes] = await Promise.all([
        fetch(`${API_URL}/admin/faculty`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/subjects`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/batches`, { headers: getHeaders() }),
        fetch(url.toString(), { headers: getHeaders() })
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
      if (timeData.success) setTimetable(timeData.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [selectedTeacherId]);

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
    <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight leading-none">
            Timetable <span className="text-indigo-600/40">Builder</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium italic">Architecting institutional weekly frameworks</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm pr-6">
           <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 flex items-center gap-2">
             <UserIcon size={16} className="text-indigo-400" />
             <select 
               className="text-xs font-black text-indigo-700 bg-transparent outline-none cursor-pointer uppercase tracking-widest"
               value={selectedTeacherId}
               onChange={(e) => setSelectedTeacherId(e.target.value)}
             >
               <option value="all">Global View</option>
               {faculties.map(f => (
                 <option key={f._id} value={f.userId?._id}>{f.userId?.name || f.personalInfo?.name}</option>
               ))}
             </select>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Cycle</span>
             <span className="text-xs font-black text-slate-900">{formData.academicYear}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Builder Form */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-indigo-100/20 overflow-hidden sticky top-8 border-b-4 border-b-indigo-600">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Plus size={20} />
                </div>
                Add Entry
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {message && (
                <div className={cn(
                  "p-5 rounded-2xl flex items-start gap-3 text-xs font-bold animate-in zoom-in-95 duration-200",
                  message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                )}>
                  <div className="shrink-0 mt-0.5">
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <span>{message.text}</span>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teacher Node</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-black text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject Module</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-black text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Batch</label>
                    <select 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                      value={formData.batchId}
                      onChange={e => setFormData({ ...formData, batchId: e.target.value, classId: e.target.value })}
                    >
                      <option value="">Select</option>
                      {batches.map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Section</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                      value={formData.section}
                      onChange={e => setFormData({ ...formData, section: e.target.value })}
                      placeholder="A"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Day</label>
                    <select 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                      value={formData.dayOfWeek}
                      onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    >
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Period</label>
                    <input 
                      required
                      type="number"
                      min="1"
                      max="10"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                      value={formData.period}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setFormData({ ...formData, period: isNaN(val) ? "" : val } as any);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start</label>
                    <input 
                      required
                      type="time"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End</label>
                    <input 
                      required
                      type="time"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Room Allocation</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-3.5 text-xs font-black text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
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
                className="w-full py-5 bg-slate-950 hover:bg-black text-white rounded-[1.4rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Archive Entry
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[700px]">
            <div className="overflow-x-auto custom-scrollbar p-8 lg:p-10">
              <table className="w-full border-separate border-spacing-2">
                <thead>
                  <tr>
                    <th className="p-4 text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] w-32 [writing-mode:vertical-lr] rotate-180">
                      Day / Period
                    </th>
                    {periods.map(p => (
                      <th key={p} className="p-4 py-6 text-center bg-slate-50/50 border border-slate-100 rounded-2xl min-w-[220px]">
                         <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Period {p}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day} className="group">
                      <td className="p-4 align-middle">
                        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center h-full min-h-[140px] group-hover:bg-indigo-600 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-indigo-100">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{day.slice(0,3)}</span>
                        </div>
                      </td>
                      {periods.map(p => {
                        const entries = (timetable[day] || {})[p] || [];
                        return (
                          <td key={p} className="p-0 min-h-[140px] align-top">
                            {entries.length > 0 ? (
                              <div className="space-y-3">
                                {entries.map((entry, idx) => {
                                  const color = getSubjectColor(entry.subjectId?.name);
                                  return (
                                    <div key={idx} className={cn(
                                      "rounded-[1.8rem] p-5 space-y-4 shadow-sm border relative group/entry transition-all hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1",
                                      entries.length > 1 ? "bg-rose-50 border-rose-200 shadow-none grayscale-[0.5]" : `${color.bg} ${color.border}`
                                    )}>
                                       {entries.length > 1 && (
                                         <div className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-xl p-2 shadow-lg z-10 animate-pulse">
                                           <AlertCircle size={14} />
                                         </div>
                                       )}
                                       
                                       <div className="space-y-1.5">
                                         <div className="flex items-center justify-between">
                                           <span className={cn(
                                             "text-[9px] font-black uppercase tracking-widest opacity-60",
                                             entries.length > 1 ? "text-rose-600" : color.text
                                           )}>
                                             {entry.subjectId?.code}
                                           </span>
                                           <div className="flex items-center gap-1.5 bg-white/60 px-2 py-0.5 rounded-lg border border-white">
                                              <Clock size={10} className="text-slate-400" />
                                              <span className="text-[9px] font-black text-slate-600 tabular-nums">{entry.startTime}</span>
                                           </div>
                                         </div>
                                         <h4 className="text-[11px] xl:text-xs font-black text-slate-900 leading-tight line-clamp-2">
                                           {entry.subjectId?.name}
                                         </h4>
                                       </div>
 
                                       <div className="space-y-2 pt-2 border-t border-white/40">
                                         <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                                              <UserIcon size={12} className="text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-700 truncate">{entry.teacherId?.name}</span>
                                         </div>
                                         <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                                              <Users size={12} className="text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-700 truncate">{entry.batchId?.name} ({entry.section})</span>
                                         </div>
                                         <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                                              <MapPin size={12} className="text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-700 truncate underline decoration-indigo-200/50 decoration-2">RM {entry.room}</span>
                                         </div>
                                       </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="h-40 border-2 border-dashed border-slate-50 bg-slate-50/10 rounded-[1.8rem] flex items-center justify-center group/empty transition-all hover:bg-indigo-50/20 hover:border-indigo-100">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-200 scale-75 group-hover/empty:scale-110 transition-transform">
                                  <span className="font-black text-xs">—</span>
                                </div>
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

"use client";

import React, { useState, useEffect } from "react";
import TimetableGrid from "@/components/teacher/TimetableGrid";
import api from "@/lib/api";
import { Calendar, Clock, RotateCcw } from "lucide-react";

export default function TimetablePage() {
  const [timetable, setTimetable] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fullRes, todayRes] = await Promise.all([
        api.get('/teacher/timetable'),
        api.get('/teacher/timetable/today')
      ]);
      setTimetable(fullRes.data.data);
      setTodayClasses(todayRes.data.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
        <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Timetable</h1>
          <p className="text-slate-500 mt-1">Manage your weekly schedule and daily class assignments.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <RotateCcw size={16} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
          <Clock size={20} />
          {error}
        </div>
      ) : (
        <div className="space-y-12">
           {/* Today's Classes Summary */}
           <section className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                 <h2 className="text-lg font-bold text-slate-900">Today's Schedule</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {todayClasses.length > 0 ? todayClasses.map((item: any) => (
                    <div key={item._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                       <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{item.subjectId.code}</span>
                          <h3 className="font-bold text-slate-900 mt-1">{item.subjectId.name}</h3>
                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 w-fit px-2 py-1 rounded-lg">
                             <Clock size={12} className="text-indigo-500" />
                             {item.startTime} - {item.endTime}
                          </div>
                       </div>
                       <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                          <span>Batch {item.batch}</span>
                          <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md">Room {item.room}</span>
                       </div>
                    </div>
                 )) : (
                    <div className="col-span-full py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 italic">
                       No classes scheduled for today
                    </div>
                 )}
              </div>
           </section>

           {/* Full Weekly View */}
           <section className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                 <h2 className="text-lg font-bold text-slate-900">Weekly Timetable</h2>
              </div>
              <TimetableGrid data={timetable} />
           </section>
        </div>
      )}
    </div>
  );
}

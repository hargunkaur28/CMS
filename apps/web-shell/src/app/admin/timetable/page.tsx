"use client";

import React from "react";
import { Calendar, Clock, Users, BookOpen, Plus, Filter } from "lucide-react";

export default function TimetablePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Academic Scheduling</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Institutional Timetable & Resource Allocation</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Filter size={14} /> Global Filter
           </button>
           <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2">
              <Plus size={14} /> Generate Schedule
           </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center shadow-sm">
         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
            <Calendar size={40} />
         </div>
         <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Master Timetable Engine</h2>
         <p className="max-w-md mx-auto text-xs font-medium text-slate-400 leading-relaxed mt-4">
            The intelligent scheduling engine is currently optimizing room allocations and faculty bandwidth. 
            Automated conflict resolution and class-mapping will be visible shortly.
         </p>
         
         <div className="mt-12 flex items-center justify-center gap-8">
            <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-slate-900 tabular-nums">124</span>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Classes</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-slate-900 tabular-nums">42</span>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lecture Halls</span>
            </div>
         </div>
      </div>
    </div>
  );
}

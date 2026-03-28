"use client";

import React, { useState } from "react";
import AdmissionBoard from "@/components/admin/AdmissionBoard";
import { Plus, Download, BarChart2, ListFilter } from "lucide-react";

export default function AdmissionsPage() {
  const [view, setView] = useState<"board" | "list">("board");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase font-sans">Admissions Funnel</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage Candidate Lifecycle from Enquiry to Enrollment</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setView(view === "board" ? "list" : "board")}
             className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
           >
              <ListFilter size={14} /> {view === "board" ? "List View" : "Board View"}
           </button>
           <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2">
              <Plus size={14} /> New Enquiry
           </button>
        </div>
      </div>

      {/* Quick Stats Mini-Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <MiniStat label="New Enquiries" value="48" trend="+6" color="blue" />
         <MiniStat label="Pending Docs" value="12" trend="-2" color="amber" />
         <MiniStat label="Approved" value="09" trend="Ready" color="emerald" />
         <MiniStat label="Verified %" value="78%" trend="Goal: 90" color="indigo" />
      </div>

      {/* Main Board Area */}
      <div className="min-h-[600px]">
        {view === "board" ? (
          <AdmissionBoard />
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Tabular List View Implementation in Progress</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, trend, color }: { label: string, value: string, trend: string, color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    indigo: "bg-indigo-500"
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
       <div className="space-y-0.5">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-lg font-black text-slate-900 tracking-tighter">{value}</p>
       </div>
       <div className="text-right space-y-0.5">
          <div className={cn("inline-block px-1.5 py-0.5 rounded-md text-[8px] font-black text-white uppercase tracking-tighter", colors[color])}>
             {trend}
          </div>
       </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

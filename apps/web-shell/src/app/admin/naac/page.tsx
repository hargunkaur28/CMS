"use client";

import React, { useEffect, useState } from "react";
import { fetchNaacDocuments, fetchNaacStats } from "@/lib/api/admin";
import ComplianceDocuments from "@/components/admin/ComplianceDocuments";
import { ShieldCheck, Upload, BookOpen, Search, Filter, Cpu } from "lucide-react";

export default function NaacPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNaacData();
  }, []);

  const loadNaacData = async () => {
    try {
      setLoading(true);
      const [docRes, statRes] = await Promise.all([
        fetchNaacDocuments(),
        fetchNaacStats()
      ]);
      
      if (docRes.success) setDocuments(docRes.data);
      if (statRes.success) setStats(statRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <ShieldCheck size={16} className="text-indigo-600 fill-indigo-100" />
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Internal Quality Assurance Cell</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase font-sans">NAAC Quality Vault</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Institutional Compliance & Accreditation Management</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <BookOpen size={14} /> Criterion Guide
           </button>
           <button className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all flex items-center gap-2">
              <Upload size={14} /> Upload Evidence
           </button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {CRITERIA.map((c) => {
            const docCount = stats.find(s => s._id === c.id)?.count || 0;
            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:border-indigo-200 transition-colors group">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-500">Criterion {c.id}</span>
                    <Cpu size={14} className="text-slate-100 group-hover:text-indigo-100" />
                 </div>
                 <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-tight mb-4 min-h-[24px] group-hover:text-indigo-600">{c.title}</h3>
                 <div className="w-full bg-slate-50 h-1 rounded-full overflow-hidden">
                    <div className="bg-slate-900 h-full group-hover:bg-indigo-600 transition-all" style={{ width: `${Math.min(docCount * 10, 100)}%` }} />
                 </div>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">{docCount} Files Uploaded</p>
              </div>
            );
         })}
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
           <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Verifying Evidence Trail...</p>
        </div>
      ) : (
        <ComplianceDocuments documents={documents} />
      )}
    </div>
  );
}

const CRITERIA = [
  { id: 1, title: "Curricular Aspects" },
  { id: 2, title: "Teaching-Learning & Eval" },
  { id: 3, title: "Research, Innovations & Extension" },
  { id: 4, title: "Infrastructure & Learning Res" },
  { id: 5, title: "Student Support & Progression" },
  { id: 6, title: "Governance, Leadership & Management" },
  { id: 7, title: "Institutional Values & Best Practices" }
];

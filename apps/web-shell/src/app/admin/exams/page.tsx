"use client";

import React, { useEffect, useState } from "react";
import { fetchExams, publishExamResults } from "@/lib/api/admin";
import ExamManager from "@/components/admin/ExamManager";
import { Plus, Download, Search, CheckSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const res = await fetchExams();
      if (res.success) setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    if (confirm("Publish results for this exam? This action is permanent and will notify all students.")) {
      try {
        await publishExamResults(id);
        alert("Results published successfully!");
        loadExams();
      } catch (err) {
        console.error(err);
        alert("Failed to publish results. Ensure marks are entered for all students.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Examination Authority</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Institutional Assessment & Result Control</p>
        </div>

        <div className="flex items-center gap-3">
            <button
             onClick={() => router.push('/exams/results')}
             className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Download size={14} /> Result Archive
           </button>
            <button
             onClick={() => router.push('/exams/create')}
             className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
            >
              <Plus size={14} /> New Exam Cycle
           </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ongoing Exams</p>
            <p className="text-lg font-black text-slate-900 tracking-tighter">02</p>
         </div>
         <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Awaiting Publish</p>
            <p className="text-lg font-black text-slate-900 tracking-tighter">05</p>
         </div>
         <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pass Rate (Term)</p>
            <p className="text-lg font-black text-emerald-600 tracking-tighter">84.2%</p>
         </div>
         <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Results</p>
            <p className="text-lg font-black text-slate-900 tracking-tighter">1,240</p>
         </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
           <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Processing Exam Data...</p>
        </div>
      ) : (
        <ExamManager 
          exams={exams} 
          onPublish={handlePublish}
          onView={(id) => console.log("View", id)}
        />
      )}
    </div>
  );
}

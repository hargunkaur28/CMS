"use client";

import React, { useEffect, useState } from "react";
import { Plus, GraduationCap, LayoutGrid, List, Sparkles } from "lucide-react";
import CourseManager from "@/components/admin/CourseManager";
import BatchManager from "@/components/admin/BatchManager";
import { fetchCourses, fetchBatches, createBatch } from "@/lib/api/admin";

export default function AcademicsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAcademics();
  }, []);

  const loadAcademics = async () => {
    try {
      setLoading(true);
      const [courseRes, batchRes] = await Promise.all([
        fetchCourses(),
        fetchBatches()
      ]);
      if (courseRes.success) setCourses(courseRes.data);
      if (batchRes.success || Array.isArray(batchRes)) {
        setBatches(Array.isArray(batchRes) ? batchRes : batchRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (batchData: any) => {
    try {
      const res = await createBatch(batchData);
      if (res) {
        await loadAcademics(); // Refresh all
      }
    } catch (err) {
      console.error("Failed to create batch:", err);
      throw err;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Sparkles size={14} className="text-amber-500 fill-amber-500" />
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Institutional Standard</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase font-sans">Curriculum Hub</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage Course Structures, Syllabus & Batches</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              <button className="px-3 py-1.5 bg-white shadow-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                 <LayoutGrid size={12} /> Grid
              </button>
              <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 hover:text-slate-600">
                 <List size={12} /> List
              </button>
           </div>
           <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2">
              <Plus size={14} /> New Program
           </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
           <div className="w-12 h-12 relative">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Academic Architecture...</p>
        </div>
      ) : (
        <div className="space-y-12">
            <CourseManager 
              courses={courses} 
              onCreateCourse={() => console.log("New Course")}
              onCreateSubject={(id) => console.log("New Subject for", id)}
            />

            {/* Batches Section */}
            <div className="pt-12 border-t border-slate-100">
               <BatchManager 
                 batches={batches} 
                 courses={courses} 
                 onCreateBatch={handleCreateBatch} 
               />
            </div>
        </div>
      )}
    </div>
  );
}

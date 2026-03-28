"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, Download, UserPlus } from "lucide-react";
import StudentTable from "@/components/admin/StudentTable";
import { fetchStudents, deleteStudent } from "@/lib/api/admin";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStudents();
  }, [search]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await fetchStudents({ search });
      if (res.success) setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to drop this student?")) {
      try {
        await deleteStudent(id);
        loadStudents();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Student Registry</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Institutional Student Information System (SIS)</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Download size={14} /> Export CSV
           </button>
           <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2">
              <UserPlus size={14} /> Add Student
           </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME, ID OR EMAIL..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="flex gap-2">
            <select className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-slate-900">
               <option>All Courses</option>
               <option>B.Tech CS</option>
               <option>MBA</option>
            </select>
            <select className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-slate-900">
               <option>All Batches</option>
               <option>2024-28</option>
               <option>2023-27</option>
            </select>
         </div>
      </div>

      {/* Main Table Area */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
           <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Records...</p>
        </div>
      ) : (
        <StudentTable 
          students={students} 
          onDelete={handleDelete}
          onEdit={(id) => console.log("Edit", id)}
        />
      )}
    </div>
  );
}

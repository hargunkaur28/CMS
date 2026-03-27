// FILE: apps/web-shell/src/app/students/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getStudents, getStudentStats } from "@/lib/api/students";
import StudentCard from "@/components/students/StudentCard";
import { 
  Users, 
  UserPlus, 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List,
  Loader2,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";

export default function StudentDirectory() {
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      const [studentsRes, statsRes] = await Promise.all([
        getStudents({ search }),
        getStudentStats()
      ]);
      if (studentsRes.success) setStudents(studentsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch student data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-on-surface">Student Directory</h1>
          <p className="text-sm text-on-surface/40 mt-1">Manage and track student lifecycles across departments</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/students/import"
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low text-on-surface/60 hover:text-on-surface border border-outline-variant/30 rounded-xl transition-all font-bold text-xs"
          >
            <Upload size={16} /> Bulk Import
          </Link>
          <Link 
            href="/students/new"
            className="bg-white text-black border-2 border-primary-indigo px-6 py-2.5 rounded-xl font-bold text-sm shadow-ambient flex items-center gap-2 hover:bg-surface-container-low active:scale-95 transition-all"
          >
            <UserPlus size={18} className="text-primary-indigo" /> Enroll Student
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MiniStatCard label="Total Students" value={stats?.totalStudents || 0} icon={<Users size={16} />} />
        <MiniStatCard label="Active" value={stats?.activeStudents || 0} icon={<div className="w-2 h-2 rounded-full bg-black/40" />} />
        <MiniStatCard label="New This Month" value={stats?.newThisMonth || 0} icon={<TrendingUp size={16} className="text-black" />} />
        <MiniStatCard label="Dropout Rate" value={`${stats?.dropoutRate?.toFixed(1) || 0}%`} icon={<AlertCircle size={16} className="text-black/40" />} />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-2 rounded-2xl border border-outline-variant/20">
        <div className="flex items-center gap-2 flex-1 max-w-md ml-2 group">
          <Search size={18} className="text-black/20 group-focus-within:text-black transition-colors" />
          <input 
            type="text"
            placeholder="Search by name or unique ID..."
            className="bg-transparent border-none text-sm font-bold text-black placeholder:text-black/20 outline-none w-full py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button className="p-2 hover:bg-black/5 rounded-lg text-black/40 transition-all border border-transparent hover:border-outline-variant/30">
            <Filter size={18} />
          </button>
          <div className="w-px h-6 bg-outline-variant/30 mx-2" />
          <div className="flex bg-white/50 p-1 rounded-xl border border-outline-variant/20">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-black text-white shadow-sm" : "text-black/20 hover:text-black/40"}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-black text-white shadow-sm" : "text-black/20 hover:text-black/40"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center bg-white/30 rounded-3xl border-2 border-dashed border-outline-variant">
           <Loader2 className="animate-spin text-black" size={32} />
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
          {students.map((student) => (
            <StudentCard key={student._id} student={student} />
          ))}
          {students.length === 0 && (
            <div className="col-span-full py-24 text-center">
               <AlertCircle size={48} className="text-black/10 mx-auto mb-4" />
               <p className="text-lg font-display font-medium text-black/20 uppercase tracking-widest">No students found matching your criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStatCard({ label, value, icon }: any) {
  return (
    <Card className="p-5 border-none bg-white flex items-center justify-between group">
      <div>
        <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-display font-bold text-black">{value}</p>
      </div>
      <div className="p-3 bg-black/5 rounded-xl text-black/20 group-hover:bg-black/10 group-hover:text-black transition-all">
        {icon}
      </div>
    </Card>
  );
}

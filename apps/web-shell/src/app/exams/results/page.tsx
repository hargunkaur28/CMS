"use client";

import React from "react";
import { useResults } from "@/hooks/useResults";
import ResultCard from "@/components/exams/ResultCard";
import { AlertCircle, GraduationCap, Award, BookOpen, Clock, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Link from "next/link";

export default function StudentResultsPortal() {
  // Backend now automatically filters by the logged-in student's ID
  const { results, stats, loading, error } = useResults();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Clock className="animate-spin text-indigo-400" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto w-full">
      <header>
        <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
          <ChevronRight size={10} />
          <span className="text-slate-900">Academic Records</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Examination Results</h1>
        <p className="text-sm text-slate-500 mt-1">Official transcripts and performance analytics for all registered terms.</p>
      </header>

      {results && results.length > 0 ? (
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
          {/* Summary Overview - Only show if data exists */}
          {stats.totalExams > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MiniStatCard label="Cumulative CGPA" value={stats.overallCgpa?.toFixed(2) || "0.00"} icon={<Award size={20} />} color="bg-indigo-50 text-indigo-600" />
              <MiniStatCard label="Total Assessments" value={stats.totalExams || "0"} icon={<GraduationCap size={20} />} color="bg-emerald-50 text-emerald-600" />
              <MiniStatCard label="Latest Performance" value={(stats.latestPercentage?.toFixed(1) || "0.0") + "%"} icon={<div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />} color="bg-slate-900 text-white" />
            </div>
          )}

          {/* Marksheets Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Published Marksheets</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {results.map((result) => (
                <ResultCard key={result._id} result={result} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Card className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-[2rem] shadow-sm">
          <AlertCircle size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">No results published yet</p>
          <p className="text-sm text-slate-300 mt-2">Check back after your examinations are concluded.</p>
        </Card>
      )}
    </div>
  );
}

function MiniStatCard({ label, value, icon, color }: any) {
  return (
    <Card className="p-6 border-none bg-white shadow-ambient flex items-center justify-between group hover:scale-[1.02] transition-all rounded-[1.5rem]">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className={`p-4 ${color} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12`}>
        {icon}
      </div>
    </Card>
  );
}


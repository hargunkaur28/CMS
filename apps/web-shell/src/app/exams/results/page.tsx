"use client";

import React, { useState, useEffect } from "react";
import { useResults } from "@/hooks/useResults";
import ResultCard from "@/components/exams/ResultCard";
import { AlertCircle, GraduationCap, Award, BookOpen, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import { getMyStudent } from "@/lib/api/students";

export default function StudentResultsPortal() {
  const [studentId, setStudentId] = useState<string>("");
  const { results, loading, error } = useResults(studentId);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyStudent();
        if (res.success) {
          setStudentId(res.data._id);
        }
      } catch (err) {
        console.error("Failed to fetch student profile", err);
        // Fallback to demo ID if needed
        setStudentId("69c6a87042c1f53f6f59b964");
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="py-24 text-center">Loading your results...</div>;
  if (error) return <div className="py-24 text-center text-error">Error: {error}</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div>
        <h1 className="text-3xl font-bold text-surface-on-surface tracking-tight">Examination Results</h1>
        <p className="text-sm text-surface-on-surface-variant mt-1">Track your academic performance and download marksheets</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MiniStatCard label="Overall GPA" value="3.85" icon={<Award size={20} className="text-primary" />} />
            <MiniStatCard label="Credits Earned" value="48" icon={<GraduationCap size={20} className="text-secondary-container-on-secondary-container" />} />
            <MiniStatCard label="Current Standing" value="Good" icon={<div className="w-2.5 h-2.5 rounded-full bg-success shadow-sm shadow-success/50" />} />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-surface-on-surface flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              Published Marksheets
            </h2>
            {results.map((result) => (
              <ResultCard key={result._id} result={result} />
            ))}
          </div>
        </div>
      ) : (
        <div className="py-24 text-center bg-surface-container-lowest rounded-3xl border border-dashed border-outline">
          <AlertCircle size={48} className="text-surface-on-surface-variant/20 mx-auto mb-4" />
          <p className="text-lg font-bold text-surface-on-surface-variant uppercase tracking-widest text-center">No results published yet</p>
        </div>
      )}
    </div>
  );
}

function MiniStatCard({ label, value, icon }: any) {
  return (
    <Card className="p-6 border border-outline-variant bg-surface-container-lowest shadow-sm flex items-center justify-between group hover:shadow-md transition-all rounded-3xl">
      <div>
        <p className="text-[11px] font-black text-surface-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold text-surface-on-surface">{value}</p>
      </div>
      <div className="p-4 bg-surface-container rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
        {icon}
      </div>
    </Card>
  );
}

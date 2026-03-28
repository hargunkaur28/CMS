"use client";

import React, { use, useState, useEffect } from "react";
import { useExam } from "@/hooks/useExams";
import { useMarks } from "@/hooks/useMarks";
import MarksGrid from "@/components/exams/MarksGrid";
import Link from "next/link";
import { ChevronLeft, Loader2, Search, Filter } from "lucide-react";
import { getStudents } from "@/lib/api/students";
import { useRouter } from "next/navigation";

export default function MarksEntryPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const { exam, loading: examLoading } = useExam(examId);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const isStaff = user.role === 'SUPER_ADMIN' || user.role === 'COLLEGE_ADMIN' || user.role === 'TEACHER';
      if (!isStaff) {
        router.push(`/exams/${examId}`);
      }
    } else {
      router.push("/login");
    }
  }, [examId, router]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await getStudents();
        if (res.success) setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  if (examLoading || loadingStudents) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center">
         <Loader2 className="animate-spin text-primary mb-4" size={48} />
         <p className="text-surface-on-surface-variant font-bold uppercase tracking-widest text-xs">Preparing Marks Grid...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-4">
        <Link 
          href={`/exams/${examId}`}
          className="p-2.5 bg-surface-container hover:bg-surface-container-high text-surface-on-surface-variant rounded-xl transition-all border border-outline"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-surface-on-surface tracking-tight">Marks Entry</h1>
          <p className="text-sm text-surface-on-surface-variant mt-1">{exam?.name} | {exam?.code}</p>
        </div>
      </div>

      {exam && (
        <MarksGrid 
          examId={examId} 
          subjects={exam.subjects || []} 
          students={students} 
          courseId={exam.courses?.[0] || ""} // Fallback to first course
          batchId={students[0]?.batchId || ""} // Fallback to first student's batch
        />
      )}
    </div>
  );
}

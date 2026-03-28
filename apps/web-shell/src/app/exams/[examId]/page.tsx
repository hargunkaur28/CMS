"use client";

import React, { use } from "react";
import { useExam } from "@/hooks/useExams";
import { useMarks } from "@/hooks/useMarks";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  FileSpreadsheet,
  BarChart3,
  Share2
} from "lucide-react";

export default function ExamDetailsPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const { exam, loading, error, fetchExam } = useExam(examId);
  const { publishResults, loading: publishing } = useMarks(examId);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const isStaff = user?.role === 'SUPER_ADMIN' || user?.role === 'COLLEGE_ADMIN' || user?.role === 'TEACHER';
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'COLLEGE_ADMIN';

  if (loading) return <div className="py-24 text-center">Loading exam details...</div>;
  if (error || !exam) return <div className="py-24 text-center text-error">Error: {error || "Exam not found"}</div>;

  const handlePublish = async () => {
    if (confirm("Are you sure you want to publish results? This will generate hall tickets and prevent further marks entry.")) {
      try {
        await publishResults();
        await fetchExam();
        alert("Results published successfully!");
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/exams"
            className="p-2.5 bg-surface-container hover:bg-surface-container-high text-surface-on-surface-variant rounded-xl transition-all border border-outline"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-surface-on-surface tracking-tight">{exam.name}</h1>
            <p className="text-sm text-surface-on-surface-variant mt-1">Code: {exam.code} | Status: {exam.status}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && exam.status !== 'PUBLISHED' && (
             <button 
                onClick={handlePublish}
                disabled={publishing}
                className="bg-primary text-primary-on-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                <Share2 size={18} /> {publishing ? "Publishing..." : "Publish Results"}
              </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exam Info Card */}
        <Card className="p-6 h-fit lg:col-span-1">
          <h3 className="text-lg font-bold text-surface-on-surface mb-6">Exam Overview</h3>
          <div className="space-y-4">
            <InfoItem label="Date" value={new Date(exam.scheduleDate).toLocaleDateString()} icon={<Calendar size={16} />} />
            <InfoItem label="Duration" value={`${exam.duration} Minutes`} icon={<Clock size={16} />} />
            <InfoItem label="Total Marks" value={exam.totalMarks} icon={<BarChart3 size={16} />} />
            <InfoItem label="Passing Marks" value={exam.passingMarks} icon={<CheckCircle2 size={16} />} />
          </div>
        </Card>

        {/* Actions Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {isStaff ? (
            <>
              <ActionCard 
                title="Marks Entry"
                description="Enter or update marks for individual students across subjects."
                icon={<FileSpreadsheet size={32} className="text-primary" />}
                href={`/exams/${examId}/marks`}
                disabled={exam.status === 'PUBLISHED'}
              />
              <ActionCard 
                title="Bulk Upload"
                description="Import student marks in bulk via CSV/Excel template."
                icon={<BarChart3 size={32} className="text-secondary-container-on-secondary-container" />}
                href={`/exams/${examId}/import`}
                disabled={exam.status === 'PUBLISHED'}
              />
            </>
          ) : (
            <>
              <ActionCard 
                title="View Results"
                description="Check your marks and grading for this examination."
                icon={<BarChart3 size={32} className="text-primary" />}
                href={`/exams/results`}
                disabled={exam.status !== 'PUBLISHED'}
              />
              <ActionCard 
                title="Hall Ticket"
                description="Download your official hall ticket for the upcoming exam."
                icon={<CheckCircle2 size={32} className="text-secondary-container-on-secondary-container" />}
                href={`/exams/hall-ticket/${examId}`}
                disabled={exam.status === 'DRAFT'}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant">
      <div className="flex items-center gap-3 text-surface-on-surface-variant">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-bold text-surface-on-surface">{value}</span>
    </div>
  );
}

function ActionCard({ title, description, icon, href, disabled }: any) {
  const content = (
    <Card className={`p-6 h-full flex flex-col items-center text-center transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:border-primary group cursor-pointer"}`}>
      <div className="p-5 bg-surface-container rounded-3xl mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-surface-on-surface mb-2">{title}</h3>
      <p className="text-sm text-surface-on-surface-variant leading-relaxed">{description}</p>
    </Card>
  );

  return disabled ? content : <Link href={href}>{content}</Link>;
}

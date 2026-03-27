// FILE: apps/web-shell/src/app/students/[studentId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStudentById } from "@/lib/api/students";
import StudentProfileTabs from "@/components/students/StudentProfileTabs";
import StudentStatusBadge from "@/components/students/StudentStatusBadge";
import Card from "@/components/ui/Card";
import { 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  User, 
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function StudentProfile() {
  const { studentId } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const res = await getStudentById(studentId as string);
      if (res.success) setStudent(res.data);
    } catch (err) {
      console.error("Failed to fetch student profile", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-surface-container-low/30 rounded-3xl border-2 border-dashed border-outline-variant">
        <Loader2 className="animate-spin text-primary-indigo" size={32} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center bg-surface-container-low/30 rounded-3xl border-2 border-dashed border-outline-variant text-center p-8">
        <AlertCircle size={48} className="text-on-surface/10 mb-4" />
        <h2 className="text-xl font-display font-bold text-on-surface mb-2">Student Not Found</h2>
        <p className="text-sm text-on-surface/40 max-w-xs">The unique ID {studentId} does not match any record in our database.</p>
      </div>
    );
  }

  const { personalInfo, academicInfo } = student;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Dynamic Profile Header */}
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-gradient opacity-10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 scale-150 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end gap-8 relative z-10 px-4">
          <div className="relative">
             {personalInfo.photo ? (
               <img src={personalInfo.photo} className="w-32 h-32 rounded-3xl object-cover shadow-2xl border-4 border-white" />
             ) : (
               <div className="w-32 h-32 bg-indigo-gradient text-white rounded-3xl flex items-center justify-center text-4xl font-display font-bold shadow-2xl border-4 border-white">
                 {personalInfo.firstName[0]}{personalInfo.lastName[0]}
               </div>
             )}
             <div className="absolute -bottom-3 -right-3">
               <StudentStatusBadge status={academicInfo.status} />
             </div>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 text-[10px] font-utility font-bold text-on-surface/30 uppercase tracking-[0.2em] mb-2">
              Student Profile <ChevronRight size={12} className="text-on-surface/20" /> Active Directory
            </div>
            <h1 className="text-4xl font-display font-bold text-on-surface tracking-tight">
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-6 mt-4 text-[11px] font-bold text-on-surface/40 uppercase tracking-widest">
              <span className="flex items-center gap-2"><User size={14} className="text-primary-indigo" /> ID: {student.uniqueStudentId}</span>
              <span className="flex items-center gap-2"><BookOpen size={14} className="text-primary-indigo" /> {academicInfo.course}</span>
              <span className="flex items-center gap-2"><Calendar size={14} className="text-primary-indigo" /> Batch: {academicInfo.batch}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Mini Contact */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-surface-container-lowest border-none shadow-ambient">
            <h4 className="text-xs font-bold text-on-surface/30 uppercase tracking-widest mb-6 border-b border-outline-variant/30 pb-4 flex items-center justify-between">
              Quick Contacts <PlusIcon />
            </h4>
            <div className="space-y-6">
               <ContactItem icon={<Mail size={16} />} value={personalInfo.email} label="Primary Email" />
               <ContactItem icon={<Phone size={16} />} value={personalInfo.phone} label="Phone Line" />
               <ContactItem icon={<MapPin size={16} />} value={personalInfo.address} label="Current Address" />
            </div>
          </Card>

          <Card className="p-8 bg-surface-container-low/50 border-none">
            <h4 className="text-xs font-bold text-on-surface/30 uppercase tracking-widest mb-6">Parental Liaison</h4>
            <div>
               <p className="text-sm font-bold text-on-surface mb-1">{student.parentInfo.name}</p>
               <p className="text-[10px] font-bold text-on-surface/40 uppercase tracking-tighter">{student.parentInfo.relation} • {student.parentInfo.phone}</p>
            </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <Card className="bg-surface-container-lowest border-none shadow-ambient overflow-hidden flex flex-col min-h-[500px]">
            <StudentProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="p-10 flex-1">
              {activeTab === "overview" && (
                <div className="animate-in fade-in duration-500 space-y-8">
                  <section>
                    <p className="text-sm text-on-surface/60 leading-relaxed font-medium">
                      Student is currently enrolled in <span className="text-primary-indigo font-bold underline decoration-primary-indigo/20 underline-offset-4">{academicInfo.course}</span>, maintaining an active attendance record. Documents for semester 1 have been verified by the registrar office.
                    </p>
                  </section>
                  
                  <div className="grid grid-cols-2 gap-8 border-t border-outline-variant/30 pt-8">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface/30 uppercase tracking-widest mb-3">Department Head</p>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-surface-container-low rounded-lg" />
                         <span className="text-xs font-bold text-on-surface">Dr. Vikram Aditya</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface/30 uppercase tracking-widest mb-3">Academic Roadmap</p>
                      <p className="text-xs font-bold text-on-surface flex items-center gap-2">
                        SEMESTER 1 <ChevronRight size={14} className="text-on-surface/20" /> CURRENT
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab !== "overview" && (
                <div className="animate-in fade-in duration-500 h-full flex flex-col items-center justify-center py-12">
                   <FileText size={48} className="text-on-surface/5 mb-4" />
                   <p className="text-sm font-bold text-on-surface/20 uppercase tracking-widest leading-none">Modules for {activeTab} syncing...</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, value, label }: any) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="p-2.5 bg-surface-container-low text-on-surface/20 group-hover:text-primary-indigo transition-colors rounded-xl border border-outline-variant/20">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-on-surface/20 uppercase tracking-[0.15em] mb-0.5">{label}</p>
        <p className="text-xs font-bold text-on-surface/60 truncate group-hover:text-on-surface transition-colors">{value}</p>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <div className="w-5 h-5 rounded-full border border-dashed border-outline-variant flex items-center justify-center text-on-surface/20 hover:text-primary-indigo hover:border-primary-indigo/40 cursor-pointer transition-all">
      <span className="text-xs font-bold mt-[-2px]">+</span>
    </div>
  );
}

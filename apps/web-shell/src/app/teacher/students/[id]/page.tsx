"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { 
  User, Mail, Phone, MapPin, Calendar, Hash, Book, 
  GraduationCap, ClipboardCheck, ArrowLeft, Loader2,
  Clock, Award, ShieldCheck, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import StudentProfileTabs from "@/components/students/StudentProfileTabs";
import StudentStatusBadge from "@/components/students/StudentStatusBadge";

export default function StudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/teacher/students/${id}`);
        setStudent(res.data.data);
      } catch (err) {
        console.error("Failed to fetch student profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse uppercase tracking-widest text-xs">Retrieving Academic Dossier...</p>
    </div>
  );

  if (!student) return (
    <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center max-w-2xl mx-auto mt-20">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <ShieldCheck size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Profile Not Found</h2>
      <p className="text-slate-500 mb-8 font-medium">The student record you are looking for does not exist or you do not have permission to view it.</p>
      <button 
        onClick={() => router.back()}
        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
      >
        <ArrowLeft size={16} />
        Back to Directory
      </button>
    </div>
  );

  const fullName = `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim();

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-slate-400 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              <span>Directory</span>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <span className="text-indigo-600">Student Profile</span>
           </div>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight">{fullName}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Profile Card */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                 <div className="absolute top-4 right-4 capitalize">
                    <StudentStatusBadge status={student.academicInfo?.status || "active"} />
                 </div>
              </div>
              <div className="px-8 pb-8">
                 <div className="relative -mt-12 mb-6">
                    {student.personalInfo?.photo ? (
                      <img 
                        src={student.personalInfo.photo} 
                        alt={fullName} 
                        className="w-24 h-24 rounded-2xl object-cover ring-8 ring-white shadow-xl shadow-slate-900/10"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 ring-8 ring-white shadow-xl shadow-slate-900/10">
                        <User size={40} />
                      </div>
                    )}
                 </div>
                 
                 <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900">{fullName}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Hash size={14} className="text-indigo-500" />
                       Roll #{student.academicInfo?.rollNumber || "N/A"}
                    </p>
                 </div>

                 <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="p-2 bg-white text-indigo-500 rounded-xl shadow-sm border border-indigo-50">
                          <Mail size={16} />
                       </div>
                       <div className="overflow-hidden">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Email Address</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{student.personalInfo?.email || "No Email"}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="p-2 bg-white text-indigo-500 rounded-xl shadow-sm border border-indigo-50">
                          <Phone size={16} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Phone Number</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{student.personalInfo?.phone || "No Phone"}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Stats Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center">
                 <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Clock size={20} />
                 </div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Attendance</p>
                 <p className="text-lg font-black text-slate-900">84.2%</p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center">
                 <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Award size={20} />
                 </div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">CGPA</p>
                 <p className="text-lg font-black text-slate-900">3.82</p>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
           {/* Tabs Container */}
           <div className="bg-slate-50/50">
              <StudentProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
           </div>

           <div className="p-8 flex-1">
              {activeTab === "overview" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Personal Repository</h3>
                         </div>
                         <div className="grid grid-cols-1 gap-4">
                            <InfoRow icon={Calendar} label="Date of Birth" value={student.personalInfo?.dob ? new Date(student.personalInfo.dob).toLocaleDateString() : "N/A"} />
                            <InfoRow icon={User} label="Gender" value={student.personalInfo?.gender || "N/A"} />
                            <InfoRow icon={MapPin} label="Address" value={student.personalInfo?.address || "N/A"} />
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Emergency Liaison</h3>
                         </div>
                         <div className="grid grid-cols-1 gap-4">
                            <InfoRow icon={Briefcase} label="Parent Name" value={student.parentInfo?.name || "N/A"} />
                            <InfoRow icon={Phone} label="Parent Phone" value={student.parentInfo?.phone || "N/A"} />
                            <InfoRow icon={Mail} label="Parent Email" value={student.parentInfo?.email || "N/A"} />
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === "academics" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
                   <div className="flex items-center gap-6 p-6 bg-indigo-900 rounded-3xl text-white shadow-xl shadow-indigo-900/10 mb-8">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                         <GraduationCap size={32} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">Current Enrollment</p>
                         <h3 className="text-xl font-bold">{student.academicInfo?.course || "N/A"}</h3>
                         <p className="text-xs text-indigo-200 mt-1 font-medium">{student.batchId?.name || student.academicInfo?.batch || "Unknown Batch"}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <InfoBlock label="Department" value={student.academicInfo?.department?.name || "Not Assigned"} />
                         <InfoBlock label="Academic Status" value={student.academicInfo?.status || "Active"} />
                         <InfoBlock label="Current Semester" value={`Semester ${student.academicInfo?.semester || "1"}`} />
                      </div>
                      <div className="space-y-4">
                         <InfoBlock label="Enrollment ID" value={student.uniqueStudentId || "PENDING"} />
                         <InfoBlock label="Date of Admission" value={student.academicInfo?.enrollmentDate ? new Date(student.academicInfo.enrollmentDate).toLocaleDateString() : "N/A"} />
                         <InfoBlock label="Section" value={student.academicInfo?.section || "A"} />
                      </div>
                   </div>
                </div>
              )}

              {activeTab === "attendance" && <Placeholder view="Attendance Data Registry" />}
              {activeTab === "exams" && <Placeholder view="Examination Dossier" />}
              {activeTab === "fees" && <Placeholder view="Financial Statement" />}
              {activeTab === "documents" && <Placeholder view="Encrypted Document Store" />}
              {activeTab === "comms" && <Placeholder view="Communication Logs" />}

           </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
       <div className="mt-0.5 text-slate-300">
          <Icon size={14} />
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-xs font-bold text-slate-800 leading-snug">{value}</p>
       </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:bg-slate-100 hover:border-slate-200 cursor-default">
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
       <p className="text-sm font-bold text-slate-900 capitalize">{value}</p>
    </div>
  );
}

function Placeholder({ view }: { view: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 animate-in fade-in duration-700">
       <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" />
       </div>
       <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{view} Initializing</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">This module is part of the next phase of deployment for NgCMS ER-P systems.</p>
       </div>
    </div>
  );
}

"use client";

import React from "react";
import { User, Mail, Hash, Book, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  batchId?: { name: string };
  section?: string;
  semester?: number;
  profilePicture?: string;
}

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-900/5 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          {student.profilePicture ? (
            <img 
              src={student.profilePicture} 
              alt={student.name} 
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-50 group-hover:ring-slate-100 transition-all"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 ring-4 ring-slate-50 group-hover:ring-slate-100 transition-all">
              <User size={32} />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
        </div>
        
        <div className="text-right">
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Batch</span>
           <span className="text-xs font-bold text-slate-900">{student.batchId?.name || "N/A"}</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-900 transition-colors">{student.name}</h3>
        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 uppercase tracking-tighter">
          <Hash size={12} className="text-slate-300" />
          {student.rollNumber}
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
         <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section</span>
            <p className="text-xs font-bold text-slate-700">{student.section || "A"}</p>
         </div>
         <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester</span>
            <p className="text-xs font-bold text-slate-700">{student.semester || "1"}</p>
         </div>
      </div>

      <div className="mt-6 space-y-2">
         <Link 
           href={`/teacher/students/${student._id}`}
           className="w-full py-2.5 bg-slate-50 text-slate-900 border border-slate-100 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
         >
           View Academic Profile
           <ArrowRight size={14} />
         </Link>
      </div>
    </div>
  );
}

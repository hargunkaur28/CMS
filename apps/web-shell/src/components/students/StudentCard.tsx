// FILE: apps/web-shell/src/components/students/StudentCard.tsx
import React from "react";
import Card from "@/components/ui/Card";
import StudentStatusBadge from "./StudentStatusBadge";
import { User, Layers, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface StudentCardProps {
  student: any;
}

export default function StudentCard({ student }: StudentCardProps) {
  const { personalInfo, academicInfo, uniqueStudentId } = student;

  return (
    <Card className="p-0 border-none bg-surface-container-lowest hover:shadow-ambient transition-all group relative overflow-hidden flex flex-col h-full">
      {/* Decorative Top Accent */}
      <div className={`h-1 w-full ${
        academicInfo.status === 'active' ? 'bg-emerald-500' : 
        academicInfo.status === 'graduated' ? 'bg-indigo-500' : 
        'bg-on-surface/10'
      }`} />

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div className="relative">
            {personalInfo.photo ? (
              <img 
                src={personalInfo.photo} 
                alt={personalInfo.firstName} 
                className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white"
              />
            ) : (
              <div className="w-16 h-16 bg-surface-container-low text-primary-indigo rounded-2xl flex items-center justify-center font-display font-bold text-2xl border-2 border-white shadow-sm">
                {personalInfo.firstName[0]}{personalInfo.lastName[0]}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2">
               <StudentStatusBadge status={academicInfo.status} />
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-bold text-on-surface/20 uppercase tracking-[0.15em] leading-none mb-1">ID NUMBER</p>
            <p className="text-xs font-bold text-on-surface/40 font-utility tracking-tighter">{uniqueStudentId}</p>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-display font-bold text-on-surface group-hover:text-primary-indigo transition-colors mb-1 truncate">
            {personalInfo.firstName} {personalInfo.lastName}
          </h3>
          <div className="flex items-center gap-2 text-[11px] font-bold text-on-surface/40 uppercase tracking-tight mb-4">
            <Layers size={14} className="text-on-surface/20" />
            {academicInfo.course}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/30">
            <div>
              <p className="text-[9px] font-bold text-on-surface/30 uppercase mb-0.5">Batch</p>
              <p className="text-[11px] font-bold text-on-surface/60">{academicInfo.batch}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-on-surface/30 uppercase mb-0.5">Enrolled</p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-on-surface/60 uppercase">
                <Calendar size={10} /> {new Date(academicInfo.enrollmentDate).getFullYear()}
              </div>
            </div>
          </div>
        </div>

        <Link 
          href={`/students/${uniqueStudentId}`}
          className="mt-6 w-full py-2.5 bg-surface-container-low text-[10px] font-bold text-on-surface/40 uppercase tracking-widest rounded-xl hover:bg-primary-indigo hover:text-white transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
        >
          View Profile <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Subtle Background Glow */}
      <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-indigo-gradient/5 rounded-full blur-2xl group-hover:bg-indigo-gradient/10 transition-all duration-700" />
    </Card>
  );
}

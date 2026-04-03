'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, BookOpen, ChevronRight, Hash } from 'lucide-react';

interface EnquiryCardProps {
  enquiry: {
    _id: string;
    fullName: string;
    courseId: { name: string };
    status: string;
    appliedDate: string;
    studentId?: string;
  };
  onClick: (id: string) => void;
}

export default function EnquiryCard({ enquiry, onClick }: EnquiryCardProps) {
  const isEnrolled = enquiry.status === 'enrolled';

  return (
    <motion.div
      layoutId={enquiry._id}
      whileHover={{ y: -4 }}
      onClick={() => onClick(enquiry._id)}
      className={`p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer group transition-all ${
        isEnrolled ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300' : 'bg-white hover:border-indigo-300'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
             isEnrolled ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
           }`}>
             <User className="w-4 h-4" />
           </div>
           <h4 className="font-semibold text-slate-800 line-clamp-1">{enquiry.fullName}</h4>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>

      <div className="space-y-2 text-sm text-slate-500">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="truncate">{enquiry.courseId?.name || 'Inquiry'}</span>
        </div>
        
        {enquiry.studentId ? (
          <div className="flex items-center space-x-2 text-emerald-600 font-mono font-bold text-[11px] bg-emerald-100/50 px-2 py-1 rounded-lg w-fit">
            <Hash className="w-3.5 h-3.5" />
            <span>{enquiry.studentId}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{new Date(enquiry.appliedDate).toISOString().split('T')[0]}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
          isEnrolled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400'
        }`}>
          {enquiry.status}
        </span>
      </div>
    </motion.div>
  );
}

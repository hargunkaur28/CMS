'use client';

import React from 'react';
import KanbanBoard from '@/components/admissions/KanbanBoard';
import { motion } from 'framer-motion';
import { Search, Filter, Download } from 'lucide-react';

export default function AdmissionsPage() {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admissions Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Handle student enquiries, applications, and enrollment pipeline.</p>
        </div>
        
        <div className="flex items-center space-x-3">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-64 shadow-sm"
              />
           </div>
           <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
             <Filter className="w-5 h-5" />
           </button>
           <button className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-semibold">
              <Download className="w-5 h-5" />
              <span>Export</span>
           </button>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <KanbanBoard />
      </motion.div>
    </div>
  );
}

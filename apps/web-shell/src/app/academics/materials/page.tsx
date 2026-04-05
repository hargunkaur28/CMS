"use client";

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { fetchMyMaterials } from '@/lib/api/student';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const resolveFileUrl = (rawUrl?: string) => {
  if (!rawUrl) return '#';
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';
  const apiRoot = base.replace(/\/api\/?$/, '');
  return `${apiRoot}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
};

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchMyMaterials();
        if (res.success) {
          setMaterials(res.data);
        }
      } catch (err) {
        console.error("Failed to load materials", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.subjectId?.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || m.type.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      {/* Strategic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Portal</Link>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-slate-900">Academic Hub</span>
          </nav>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
            Learning <span className="text-indigo-600">Materials</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-4 max-w-md leading-relaxed">
            Access curated lecture notes, assignments, and reference documents shared by your faculty.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search materials..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
            {['all', 'Material', 'Assignment', 'Reference'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === t ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMaterials.map((m, i) => (
            <MaterialCard key={i} material={m} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <BookOpen size={48} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-lg font-black text-slate-900 uppercase">No Resources Found</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
}

function MaterialCard({ material }: { material: any }) {
  return (
    <Card className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-indigo-600/10 transition-all duration-500 flex flex-col h-full">
       <div className="flex justify-between items-start mb-6">
          <div className={cn(
             "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500",
             material.type === 'Assignment' ? "bg-rose-50 text-rose-600" :
             material.type === 'Reference' ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"
          )}>
             <FileText size={24} />
          </div>
          <span className={cn(
             "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
             material.type === 'Assignment' ? "bg-rose-50 text-rose-600 border-rose-100" :
             material.type === 'Reference' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
          )}>
             {material.type}
          </span>
       </div>

       <div className="flex-1 space-y-4">
          <div>
             <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{material.subjectId?.name || 'General'}</h4>
             <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors uppercase">{material.title}</h3>
          </div>
          <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
             {material.description || 'No description provided.'}
          </p>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <User size={14} className="text-slate-300" />
                <span>Prof. {material.teacherId?.name || 'Faculty'}</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock size={14} className="text-slate-300" />
                <span>{material?.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'N/A'}</span>
             </div>
          </div>
       </div>

       <div className="mt-8 flex items-center gap-3">
           <a 
             href={resolveFileUrl(material.fileUrl)} 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
          >
             Download <Download size={14} />
          </a>
          <button className="w-14 h-14 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
             <ExternalLink size={18} />
          </button>
       </div>
    </Card>
  );
}

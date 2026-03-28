"use client";

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { fetchMyAttendance } from '@/lib/api/student';
import Link from 'next/link';

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchMyAttendance();
        if (res.success) {
          // Check for records inside data property due to refactor
          const records = res.data.records || (Array.isArray(res.data) ? res.data : []);
          setAttendance(records);
        }
      } catch (err) {
        console.error("Failed to load attendance history", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const calculateStats = () => {
    if (attendance.length === 0) return { pct: 0, present: 0, absent: 0, total: 0 };
    const present = attendance.filter(r => r.status === 'Present').length;
    const leave = attendance.filter(r => r.status === 'Leave').length;
    const total = attendance.length;
    return {
      pct: Math.round(((present + leave) / total) * 100),
      present,
      absent: total - present - leave,
      total
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Clock className="animate-spin text-indigo-400" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
            <ChevronRight size={10} />
            <span className="text-slate-900">Attendance History</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Presence</h1>
          <p className="text-sm text-slate-500 mt-1">Detailed breakdown of subject-wise attendance and records.</p>
        </div>

        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200 gap-4 px-6 items-center">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Pct</p>
            <p className={`text-xl font-black ${stats.pct >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>{stats.pct}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
            <Calendar size={20} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard 
          label="Overall Pct" 
          value={`${stats.pct}%`} 
          icon={<Calendar size={20} />} 
          color="bg-indigo-50 text-indigo-600" 
        />
        <SummaryCard 
          label="Total Classes" 
          value={stats.total} 
          icon={<Clock size={20} />} 
          color="bg-slate-50 text-slate-600" 
        />
        <SummaryCard 
          label="Present" 
          value={stats.present} 
          icon={<CheckCircle size={20} />} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <SummaryCard 
          label="Absent" 
          value={stats.absent} 
          icon={<XCircle size={20} />} 
          color="bg-rose-50 text-rose-600" 
        />
      </div>

      {/* Subject Wise breakdown placeholder */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 font-display">Subject Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(attendance.reduce((acc: any, r: any) => {
            const sub = r.subject?.name || "Other";
            if (!acc[sub]) acc[sub] = { p: 0, t: 0 };
            acc[sub].t++;
            if (r.status === 'Present' || r.status === 'Leave') acc[sub].p++;
            return acc;
          }, {})).map(([sub, data]: [string, any]) => (
            <div key={sub} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="flex justify-between items-center mb-2">
                 <p className="text-sm font-bold text-slate-900">{sub}</p>
                 <span className="text-xs font-black text-indigo-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                   {Math.round((data.p / data.t) * 100)}%
                 </span>
               </div>
               <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(data.p / data.t) * 100}%` }} />
               </div>
               <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{data.p} of {data.t} Sessions</p>
            </div>
          ))}
        </div>
      </div>

      {/* History Table */}
      <Card className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Attendance Log</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={14} /> Filter Subject
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Subject</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-utility">
              {attendance.map((record, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{new Date(record.date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {record.subject?.name || 'Unknown Subject'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      record.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      record.status === 'Leave' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-bold italic">
              No attendance records found for this academic session.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, icon, color }: any) {
  return (
    <Card className="p-6 border-none bg-white shadow-ambient flex items-center justify-between rounded-3xl group hover:scale-[1.02] transition-all">
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h3>
        <span className="text-2xl font-display font-black text-slate-900 tracking-tight">{value}</span>
      </div>
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12`}>
        {icon}
      </div>
    </Card>
  );
}

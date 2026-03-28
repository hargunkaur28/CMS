"use client";

import React, { useEffect, useState } from "react";
import { fetchAnnouncements, createAnnouncement } from "@/lib/api/admin";
import AnnouncementList from "@/components/admin/AnnouncementList";
import { Send, Bell, Mail, Users, Filter, Plus } from "lucide-react";

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const res = await fetchAnnouncements();
      if (res.success) setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase font-sans">Communication Hub</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Institutional Engagement & Information Control</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Mail size={14} /> Direct Message
           </button>
           <button className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2">
              <Plus size={14} /> New Announcement
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Feed */}
         <div className="lg:col-span-2">
           {loading ? (
             <div className="h-96 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Global Feed...</p>
             </div>
           ) : (
             <AnnouncementList announcements={announcements} />
           )}
         </div>

         {/* Sidebar Tools */}
         <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Users size={60} />
               </div>
               <h3 className="text-xs font-black uppercase tracking-widest mb-4">Targeted Blast</h3>
               <p className="text-[10px] font-medium text-slate-400 leading-relaxed mb-6">Send urgent SMS or Email notifications to specific student cohorts or faculty departments.</p>
               <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                  Launch Campaign
               </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">System Health</h3>
               <div className="space-y-4">
                  <HealthItem label="Email Gateway" status="Operational" />
                  <HealthItem label="SMS API" status="Operational" />
                  <HealthItem label="Push Notifications" status="Operational" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function HealthItem({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{status}</span>
       </div>
    </div>
  );
}

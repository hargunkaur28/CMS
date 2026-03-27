// FILE: apps/web-shell/src/app/admissions/enquiries/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getEnquiries, updateEnquiryStatus } from "@/lib/api/admissions";
import Card from "@/components/ui/Card";
import AdmissionStatusBadge from "@/components/admissions/AdmissionStatusBadge";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock,
  MoreVertical,
  Loader2
} from "lucide-react";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchEnquiries();
  }, [search, statusFilter]);

  const fetchEnquiries = async () => {
    try {
      const res = await getEnquiries({ search, status: statusFilter });
      if (res.success) setEnquiries(res.data);
    } catch (err) {
      console.error("Failed to fetch enquiries", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await updateEnquiryStatus(id, newStatus, "Status updated from Enquiry List");
      if (res.success) fetchEnquiries();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-utility font-bold text-on-surface/30 uppercase tracking-[0.1em] mb-1">
            Admissions <ChevronRight size={12} className="text-on-surface/20" /> Enquiries
          </div>
          <h1 className="text-2xl font-display font-bold text-on-surface">Enquiry Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/30 group-focus-within:text-primary-indigo transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="bg-surface-container-low border-transparent focus:border-primary-indigo/30 focus:bg-white transition-all rounded-xl pl-10 pr-4 py-2 text-xs w-64 outline-none border shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="bg-surface-container-low border-transparent focus:border-primary-indigo/30 focus:bg-white transition-all rounded-xl px-4 py-2 text-xs outline-none border shadow-sm appearance-none min-w-[120px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="follow-up">Follow-up</option>
            <option value="applied">Applied</option>
            <option value="admitted">Admitted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center bg-surface-container-low/30 rounded-2xl border border-dashed border-outline-variant">
          <Loader2 className="animate-spin text-primary-indigo" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {enquiries.map((enquiry) => (
            <Card key={enquiry._id} className="p-0 border-none bg-surface-container-lowest hover:shadow-ambient transition-all">
              <div className="flex items-center p-6 gap-6">
                <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary-indigo font-display font-bold text-lg">
                  {enquiry.name[0]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-bold text-on-surface truncate">{enquiry.name}</h3>
                    <AdmissionStatusBadge status={enquiry.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-on-surface/40 uppercase tracking-tighter">
                      <Phone size={12} /> {enquiry.phone}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-on-surface/40 uppercase tracking-tighter">
                      <Mail size={12} /> {enquiry.email}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-primary-indigo uppercase tracking-wider">
                      <MessageSquare size={12} /> {enquiry.courseInterested}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pr-4 border-r border-outline-variant/30">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface/30 uppercase mb-0.5">Source</p>
                    <p className="text-[11px] font-bold text-on-surface uppercase tracking-widest">{enquiry.source}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface/30 uppercase mb-0.5">Created</p>
                    <p className="text-[11px] font-bold text-on-surface uppercase tracking-widest">{new Date(enquiry.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select 
                    className="bg-surface-container-low text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg outline-none border border-transparent focus:border-primary-indigo/30 transition-all cursor-pointer"
                    value={enquiry.status}
                    onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
                  >
                    <option value="new">Mark New</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="rejected">Reject</option>
                  </select>
                  <button className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface/40 transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {enquiries.length === 0 && (
            <div className="py-20 text-center bg-surface-container-low/30 rounded-3xl border-2 border-dashed border-outline-variant">
              <p className="text-sm font-bold text-on-surface/20 uppercase tracking-widest">No enquiries matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

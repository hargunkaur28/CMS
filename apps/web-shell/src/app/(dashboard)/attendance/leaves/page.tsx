// FILE: apps/web-shell/src/app/(dashboard)/attendance/leaves/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Inbox, RefreshCw, Filter } from "lucide-react";
import Card from "@/components/ui/Card";
import LeaveRequestCard from "@/components/attendance/LeaveRequestCard";
import { getLeaveRequests, reviewLeave } from "@/lib/api/attendance";

export default function LeaveManagement() {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    loadLeaves();
  }, [filter]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const res = await getLeaveRequests({ status: filter });
      if (res.success) setLeaves(res.data);
    } catch (err) {
      console.error("Leaves load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await reviewLeave(id, { 
        status, 
        reviewedBy: "current-admin-id", // Should come from auth context
        remarks: `Leave ${status} by Admin`
      });
      if (res.success) {
        setLeaves(leaves.filter(l => l._id !== id));
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Failed to update leave status");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-display font-bold text-on-surface tracking-tight">Leave Management</h1>
           <p className="text-sm text-on-surface/40 mt-1">Review and process student leave applications with supporting proof.</p>
        </div>
        
        <div className="flex bg-surface-container-low p-1 rounded-2xl border border-outline-variant/20">
           {["pending", "approved", "rejected"].map((s) => (
             <button 
               key={s}
               onClick={() => setFilter(s)}
               className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === s ? "bg-white text-primary-indigo shadow-sm" : "text-on-surface/20 hover:text-on-surface/40"}`}
             >
               {s}
             </button>
           ))}
        </div>
      </header>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
           <Loader2 size={32} className="animate-spin text-primary-indigo" />
        </div>
      ) : (
        <>
          {leaves.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaves.map((leave) => (
                <LeaveRequestCard 
                  key={leave._id} 
                  leave={leave} 
                  onReview={handleReview} 
                  isAdmin={true} 
                />
              ))}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center bg-surface-container-low/30 rounded-3xl border-2 border-dashed border-outline-variant text-on-surface/20 italic text-sm gap-4">
               <Inbox size={48} className="text-on-surface/10" />
               <p className="font-display font-medium uppercase tracking-[0.2em]">No {filter} requests found</p>
               <button onClick={loadLeaves} className="flex items-center gap-2 text-primary-indigo hover:underline mt-2">
                 <RefreshCw size={14} /> Refresh List
               </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { fetchPayments, fetchFinancialSummary } from "@/lib/api/admin";
import PaymentLog from "@/components/admin/PaymentLog";
import { Landmark, TrendingUp, PiggyBank, History, Plus, Download } from "lucide-react";

export default function FeesPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const [payRes, sumRes] = await Promise.all([
        fetchPayments(),
        fetchFinancialSummary()
      ]);
      
      if (payRes.success) setPayments(payRes.data);
      if (sumRes.success) setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase font-sans">Bursar's Office</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Institutional Financial Control & Billing</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Download size={14} /> Audit Trail
           </button>
           <button className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all flex items-center gap-2">
              <Plus size={14} /> New Structure
           </button>
        </div>
      </div>

      {/* Financial Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <Landmark size={80} className="text-white" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Revenue (FY 2024)</p>
            <h2 className="text-3xl font-black text-white tracking-tighter">₹ {summary?.totalRevenue.toLocaleString() || "0"}</h2>
            <div className="mt-6 flex items-center gap-2 text-emerald-400">
               <TrendingUp size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">94.2% Collected</span>
            </div>
         </div>

         <div className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Collections</p>
            <div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{summary?.pendingPayments || "0"}</h2>
               <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">Requires Attention</p>
            </div>
         </div>

         <div className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scholarship Fund</p>
            <div>
               <h2 className="text-3xl font-black text-indigo-600 tracking-tighter">₹ 14.8M</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Endowment Surplus</p>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
           <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reconciling Ledgers...</p>
        </div>
      ) : (
        <PaymentLog payments={payments} />
      )}
    </div>
  );
}

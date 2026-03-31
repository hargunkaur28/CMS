"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { 
  CreditCard, 
  Download, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Receipt,
  GraduationCap
} from 'lucide-react';
import { fetchMyFees as fetchStudentFees, submitPayment } from '@/lib/api/student';
import { fetchMyStudentFees as fetchParentFees } from '@/lib/api/parent';
import axios from 'axios';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function FinancePortal() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const loadData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      let res;
      
      if (user.role === 'STUDENT') {
        res = await fetchStudentFees();
      } else {
        res = await fetchParentFees();
      }

      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load financial data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const handlePaySim = async () => {
    if (!data?.structures?.length) return;
    
    setPaying(true);
    try {
      const structure = data.structures[0];
      const amount = data.summary.balance;
      
      if (amount <= 0) {
        alert("No pending dues found.");
        return;
      }

      await submitPayment({
        feeStructureId: structure._id,
        amount: amount,
        mode: "online"
      });
      
      alert("Payment Successful! Your balance has been updated.");
      loadData(); // Refresh data
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Securing Connection...</p>
        </div>
      </div>
    );
  }

  const { structures = [], payments = [], summary = {} } = data || {};

  return (
    <div className="max-w-7xl mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      {/* Strategic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Portal</Link>
            <ArrowUpRight size={10} className="text-slate-300" />
            <span className="text-slate-900">Financial Governance</span>
          </nav>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
            Fees & <span className="text-indigo-600">Payments</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-4 max-w-md leading-relaxed">
            Transparent institutional billing and history management. All transactions are AI-logged.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handlePaySim}
            disabled={paying}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
          >
            {paying ? "Processing..." : "Pay Pending Dues"}
          </button>
        </div>
      </div>

      {/* Financial Health Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard title="Total Dues" value={`₹${summary.totalDues}`} icon={<CreditCard size={20} />} color="bg-slate-50 text-slate-600" />
        <StatusCard title="Paid Amount" value={`₹${summary.totalPaid}`} icon={<CheckCircle2 size={20} />} color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
        <StatusCard title="Balance" value={`₹${summary.balance}`} icon={<AlertCircle size={20} />} color={summary.balance > 0 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Billing Cycle */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Fee Structure</h2>
          {structures.map((s: any, idx: number) => (
            <Card key={idx} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Semester {s.semester} Portfolio</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Due Date: {new Date(s.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Receipt size={20} />
                </div>
              </div>
              
              <div className="space-y-4">
                {s.components.map((c: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">{c.name}</span>
                    <span className="text-sm font-black text-slate-900">₹{c.amount}</span>
                  </div>
                ))}
                <div className="pt-4 flex justify-between items-center text-indigo-600">
                  <span className="text-[10px] font-black uppercase tracking-widest">Total Semester Cost</span>
                  <span className="text-xl font-black">₹{s.components.reduce((acc: any, c: any) => acc + c.amount, 0)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Transaction History */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent History</h2>
          <div className="space-y-4">
            {payments.length > 0 ? payments.map((p: any, i: number) => (
              <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <p className="text-sm font-black text-slate-900">₹{p.amountPaid}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(p.createdAt).toLocaleDateString()}</p>
                   </div>
                   <span className={cn(
                     "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                     p.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                   )}>
                     {p.status}
                   </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>{p.mode} Operation</span>
                  <button className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Receipt <Download size={12} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <History size={32} className="mx-auto text-slate-200 mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Transactions recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, icon, color }: any) {
  return (
    <Card className={cn("p-8 rounded-[2.5rem] flex items-center justify-between group hover:scale-[1.02] transition-all duration-300", color)}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{title}</p>
        <span className="text-3xl font-black tracking-tight">{value}</span>
      </div>
      <div className="w-14 h-14 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm">
        {icon}
      </div>
    </Card>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { fetchPayments, fetchFinancialSummary, fetchFeeStructures, createFeeStructure, fetchCourses } from "@/lib/api/admin";
import PaymentLog from "@/components/admin/PaymentLog";
import { Landmark, TrendingUp, PiggyBank, History, Plus, Download } from "lucide-react";

export default function FeesPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [structures, setStructures] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [creatingStructure, setCreatingStructure] = useState(false);
  const [structureForm, setStructureForm] = useState({
    name: "",
    amount: "",
    dueDate: "",
    courseId: "",
    semester: 1,
  });

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [payRes, sumRes, courseRes] = await Promise.all([
        fetchPayments(),
        fetchFinancialSummary(),
        fetchCourses(),
      ]);
      
      if (payRes.success) setPayments(payRes.data);
      if (sumRes.success) setSummary(sumRes.data);
      if (courseRes.success) setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
      const structRes = await fetchFeeStructures();
      if (structRes.success) setStructures(Array.isArray(structRes.data) ? structRes.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load financial records");
    } finally {
      setLoading(false);
    }
  };

  const handleExportAuditTrail = () => {
    const header = ["ReceiptNo", "Student", "Amount", "Status", "PaidAt"];
    const rows = payments.map((payment: any) => [
      payment?.receiptNo || "",
      payment?.studentId?.personalInfo?.name
        || `${payment?.studentId?.personalInfo?.firstName || ''} ${payment?.studentId?.personalInfo?.lastName || ''}`.trim()
        || payment?.studentId?.studentId
        || "",
      String(payment?.amountPaid ?? payment?.amount ?? 0),
      payment?.status || "",
      payment?.paymentDate ? new Date(payment.paymentDate).toISOString() : (payment?.paidAt ? new Date(payment.paidAt).toISOString() : ""),
    ]);
    const csv = [header.join(','), ...rows.map((row: string[]) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fees-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleCreateStructure = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setCreatingStructure(true);
      await createFeeStructure({
        courseId: structureForm.courseId,
        semester: Number(structureForm.semester),
        components: [{ name: structureForm.name || "Tuition", amount: Number(structureForm.amount) }],
        dueDate: structureForm.dueDate,
        finePerDay: 0,
      });
      setShowStructureModal(false);
      setStructureForm({ name: "", amount: "", dueDate: "", courseId: "", semester: 1 });
      await loadFinanceData();
    } catch (err: any) {
      window.alert(err?.response?.data?.message || "Failed to create fee structure");
    } finally {
      setCreatingStructure(false);
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
            <button onClick={handleExportAuditTrail} className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Download size={14} /> Audit Trail
           </button>
            <button onClick={() => setShowStructureModal(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all flex items-center gap-2">
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
            <h2 className="text-3xl font-black text-white tracking-tighter">₹ {(summary?.totalRevenue || 0).toLocaleString()}</h2>
            <div className="mt-6 flex items-center gap-2 text-emerald-400">
               <TrendingUp size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">{summary?.collectionEfficiency || "0%"} Collected</span>
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
               <h2 className="text-3xl font-black text-indigo-600 tracking-tighter">₹ {(summary?.scholarshipFund / 1000000).toFixed(1)}M</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Endowment Surplus</p>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
           <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reconciling Ledgers...</p>
        </div>
      ) : error ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4 rounded-2xl border border-rose-100 bg-rose-50/50">
          <p className="text-sm font-black uppercase tracking-widest text-rose-600">{error}</p>
          <button onClick={loadFinanceData} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800">
            Retry
          </button>
        </div>
      ) : (
        <>
          <PaymentLog payments={payments} />
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Collection Log Summary</p>
            <p className="text-sm font-semibold text-slate-700">
              {payments.filter((payment) => String(payment?.status || '').toLowerCase() === 'paid').length} paid entries, {payments.filter((payment) => String(payment?.status || '').toLowerCase() === 'pending').length} pending entries
            </p>
          </div>
        </>
      )}

      {showStructureModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowStructureModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl p-6" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 mb-4">New Fee Structure</h3>
            <form className="space-y-3" onSubmit={handleCreateStructure}>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2" value={structureForm.courseId} onChange={(e) => setStructureForm({ ...structureForm, courseId: e.target.value })} required>
                <option value="">Select Course</option>
                {courses.map((course: any) => (
                  <option key={course._id} value={course._id}>{course.name} ({course.code})</option>
                ))}
              </select>
              <input type="number" min={1} max={12} className="w-full border border-slate-200 rounded-xl px-3 py-2" placeholder="Semester" value={structureForm.semester} onChange={(e) => setStructureForm({ ...structureForm, semester: Number(e.target.value) })} required />
              <input className="w-full border border-slate-200 rounded-xl px-3 py-2" placeholder="Structure Name" value={structureForm.name} onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })} required />
              <input type="number" min={1} className="w-full border border-slate-200 rounded-xl px-3 py-2" placeholder="Amount" value={structureForm.amount} onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })} required />
              <input type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2" value={structureForm.dueDate} onChange={(e) => setStructureForm({ ...structureForm, dueDate: e.target.value })} required />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowStructureModal(false)} className="px-4 py-2 rounded-xl border border-slate-200">Cancel</button>
                <button type="submit" disabled={creatingStructure} className="px-4 py-2 rounded-xl bg-slate-900 text-white disabled:opacity-60">{creatingStructure ? 'Saving...' : 'Create Structure'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

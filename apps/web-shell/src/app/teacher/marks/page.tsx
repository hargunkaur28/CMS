"use client";

import React, { useState, useEffect } from "react";
import MarksEntryTable from "@/components/teacher/MarksEntryTable";
import api from "@/lib/api";
import { FileSpreadsheet, Filter, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";

export default function MarksPage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examRes, stuRes] = await Promise.all([
        api.get('/teacher/marks/exams'),
        api.get('/teacher/students')
      ]);
      setExams(examRes.data.data);
      setStudents(stuRes.data.data);
      if (examRes.data.data.length > 0) {
        setSelectedExam(examRes.data.data[0]);
      }
    } catch (err: any) {
      setError("Failed to load exam data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveRow = async (studentId: string, marksObtained: number, remarks: string) => {
    if (!selectedExam) return;
    try {
      await api.post('/teacher/marks/enter', {
        examId: selectedExam._id,
        studentId,
        subjectId: selectedExam.subjectId?._id || "65e1234567890abcdef54321", // Fallback for demo
        marksObtained,
        maxMarks: selectedExam.maxMarks || 100,
        remarks
      });
    } catch (err: any) {
      throw err;
    }
  };

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
    <div className="grid grid-cols-3 gap-6">
       <div className="h-32 bg-slate-100 rounded-2xl"></div>
       <div className="h-32 bg-slate-100 rounded-2xl"></div>
       <div className="h-32 bg-slate-100 rounded-2xl"></div>
    </div>
    <div className="h-[400px] bg-slate-100 rounded-2xl"></div>
  </div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Exams & Marks Entry</h1>
          <p className="text-slate-500 mt-1">Enter and manage student marks for internal and external assessments.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <select 
             className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-100 transition-all"
             value={selectedExam?._id}
             onChange={(e) => setSelectedExam(exams.find((ex: any) => ex._id === e.target.value))}
           >
             {exams.map((ex: any) => (
               <option key={ex._id} value={ex._id}>{ex.name}</option>
             ))}
           </select>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all">
              <BarChart3 size={18} />
              Statistics
           </button>
        </div>
      </div>

      {/* Selected Exam Stats */}
      {selectedExam && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
              <p className="text-lg font-black text-slate-900 mt-1 uppercase">{selectedExam.type}</p>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Marks</span>
              <p className="text-lg font-black text-slate-900 mt-1">{selectedExam.maxMarks || 100}</p>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <p className="flex items-center gap-2 text-lg font-black text-slate-900 mt-1">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 OPEN
              </p>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Students</span>
              <p className="text-lg font-black text-slate-900 mt-1">{students.length}</p>
           </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 shadow-sm">
           <AlertCircle size={18} />
           <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Entry Table */}
      <MarksEntryTable 
        students={students} 
        onSaveRow={handleSaveRow} 
        onBulkSubmit={async () => {}} // Not implemented for now
        maxMarks={selectedExam?.maxMarks || 100}
      />
    </div>
  );
}

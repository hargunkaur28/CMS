"use client";

import React, { useState, useEffect } from "react";
import AttendanceMarker from "@/components/teacher/AttendanceMarker";
import ShortageAlert from "@/components/teacher/ShortageAlert";
import api from "@/lib/api";
import { Search, Filter, RotateCcw, CheckCircle2 } from "lucide-react";

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [shortages, setShortages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real flow, the teacher would first select a class/subject
      // For this implementation, we fetch students from the general listing
      const [stuRes, shortRes] = await Promise.all([
        api.get('/teacher/students'),
        api.get('/teacher/attendance/shortage')
      ]);
      setStudents(stuRes.data.data);
      setShortages(shortRes.data.data);
    } catch (err: any) {
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAttendanceSubmit = async (records: any[]) => {
    setSubmitting(true);
    setSuccess(false);
    setError("");

    try {
      // Mock classId and subjectId for demonstration if none selected
      await api.post('/teacher/attendance/mark', {
        classId: "65e1234567890abcdef12345", // Placeholder
        subjectId: "65e1234567890abcdef54321", // Placeholder
        date: new Date(),
        records
      });
      setSuccess(true);
      fetchData(); // Refresh shortage alerts
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
    <div className="h-24 bg-red-50 rounded-2xl"></div>
    <div className="h-96 bg-slate-100 rounded-2xl"></div>
  </div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Daily Attendance</h1>
          <p className="text-slate-500 mt-1">Mark student presence for your assigned batches.</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={fetchData}
                className="p-2.5 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm"
            >
                <RotateCcw size={20} />
            </button>
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                <Filter size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Spring 2024 • Batch A</span>
            </div>
        </div>
      </div>

      {/* Shortage Alerts */}
      <ShortageAlert shortages={shortages} />

      {/* Feedback Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
           <div className="p-1 px-2 bg-green-600 text-white rounded-lg"><CheckCircle2 size={16} /></div>
           <p className="text-sm font-bold">Attendance has been marked successfully for today!</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 shadow-sm">
           <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Main Table */}
      <AttendanceMarker 
        students={students} 
        onSubmit={handleAttendanceSubmit} 
        isSubmitting={submitting}
      />
    </div>
  );
}

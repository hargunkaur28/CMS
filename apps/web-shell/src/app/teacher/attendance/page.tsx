"use client";

import React, { useState, useEffect, Suspense } from "react";
import ClassSelectorFlow from "@/components/teacher/ClassSelectorFlow";
import AttendanceMarker from "@/components/teacher/AttendanceMarker";
import ShortageAlert from "@/components/teacher/ShortageAlert";
import api from "@/lib/api";
import { CheckCircle2, ChevronLeft, Calendar } from "lucide-react";
import { useSearchParams } from "next/navigation";

function AttendancePageContent() {
  const searchParams = useSearchParams();
  const initialBatch = searchParams.get('batchId');
  const initialSubject = searchParams.get('subjectId');
  const initialLecture = searchParams.get('lecture');
  const initialDate = searchParams.get('date');
  const initialSection = searchParams.get('section');

  const [sessionParams, setSessionParams] = useState<any>(null); // { batchId, subjectId, lecture, date, batch, subject, section }
  const [students, setStudents] = useState<any[]>([]);
  const [shortages, setShortages] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(!!(initialBatch && initialSubject && initialLecture));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [existingAttendance, setExistingAttendance] = useState<any>(null);
  const [isRectifying, setIsRectifying] = useState(false);

  const fetchGlobalShortages = async () => {
    try {
      const shortRes = await api.get('/teacher/attendance/shortage');
      setShortages(shortRes.data?.data || []);
    } catch (err: any) {
      console.error("Failed to load global shortages", err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (initialBatch && initialSubject && initialLecture) {
        setInitializing(true);
        // Force immediate session skip by setting basic params
        const params = {
          batchId: initialBatch,
          subjectId: initialSubject,
          lecture: parseInt(initialLecture),
          date: initialDate ? new Date(initialDate) : new Date(),
          batch: { name: "Loading Section..." },
          subject: { name: "Loading Subject...", code: "..." }
        };
        
        setSessionParams(params);

        try {
          // Fetch specific metadata via timetable since it's the most reliable source for these specific IDs
          const [timeRes, batchRes, subRes] = await Promise.allSettled([
            api.get('/teacher/timetable'),
            api.get('/teacher/my-batches'),
            api.get(`/teacher/my-subjects?batchId=${initialBatch}`)
          ]);

          let batch = null;
          let subject = null;

          // 1. Try resolving via Timetable first (since that's where we came from)
          if (timeRes.status === 'fulfilled') {
            const timeData = timeRes.value.data?.data || {};
            const allEntries = Object.values(timeData).flatMap((day: any) => 
              Object.values(day).flatMap((slots: any) => slots)
            );
            
            const match = allEntries.find((e: any) => 
              (e.batchId?._id === initialBatch || e.batchId === initialBatch) &&
              (e.subjectId?._id === initialSubject || e.subjectId === initialSubject) &&
              e.period === parseInt(initialLecture)
            );

            if (match) {
              batch = match.batchId;
              subject = match.subjectId;
            }
          }

          // 2. Fallback to assigned lists if timetable lookup failed
          if (!batch && batchRes.status === 'fulfilled') {
            batch = (batchRes.value.data?.data || []).find((b: any) => b._id.toString() === initialBatch.toString());
          }
          if (!subject && subRes.status === 'fulfilled') {
            subject = (subRes.value.data?.data || []).find((s: any) => s._id.toString() === initialSubject.toString());
          }

          // Update params with real metadata
          const updatedParams = {
            ...params,
            date: initialDate ? new Date(initialDate) : params.date,
            batch: batch || { name: "Assigned Section" },
            subject: subject || { name: "Assigned Subject", code: "SYNC" },
            section: initialSection
          };
          
          await handleSelectionComplete(updatedParams);
        } catch (err) {
          console.error("Auto-initialization failure", err);
          await handleSelectionComplete(params);
        } finally {
          setInitializing(false);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchGlobalShortages();
    initialize();
  }, [initialBatch, initialSubject, initialLecture]);

  const handleSelectionComplete = async (params: any) => {
    setSessionParams(params);
    setLoading(true);
    setSuccess(false);
    setError("");
    setExistingAttendance(null);
    setIsRectifying(false);

    try {
      // 1. Fetch Students for this batch (and section if provided)
      const sectionQuery = params.section ? `&section=${params.section}` : "";
      const stuRes = await api.get(`/teacher/students?batchId=${params.batchId}${sectionQuery}`);
      const mappedStudents = (stuRes.data?.data || []).map((s: any) => ({
        _id: s._id,
        name: s.personalInfo?.name || `${s.personalInfo?.firstName} ${s.personalInfo?.lastName}`,
        uniqueStudentId: s.uniqueStudentId || s.studentId,
        rollNumber: s.academicInfo?.rollNumber || "N/A"
      }));
      setStudents(mappedStudents);

      // 2. Check if attendance already exists
      const dateStr = params.date.toISOString().split('T')[0];
      const attRes = await api.get(`/teacher/attendance?batchId=${params.batchId}&subjectId=${params.subjectId}&date=${dateStr}&lecture=${params.lecture}${sectionQuery}`);
      
      if (attRes.data?.data?.length > 0) {
        setExistingAttendance(attRes.data.data[0]);
      }

    } catch (err: any) {
      setError("Failed to initialize session data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceSubmit = async (records: any[]) => {
    setSubmitting(true);
    setSuccess(false);
    setError("");

    try {
      await api.post('/teacher/attendance/mark', {
        batchId: sessionParams.batchId,
        subjectId: sessionParams.subjectId,
        lecture: sessionParams.lecture,
        date: sessionParams.date,
        section: sessionParams.section,
        records
      });
      setSuccess(true);
      fetchGlobalShortages(); // Refresh shortage alerts on successful submit
      
      // Optional: Delay and return to selector
      setTimeout(() => {
        setSessionParams(null);
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit attendance matrix.");
    } finally {
      setSubmitting(false);
    }
  };

  if ((loading || initializing) && !sessionParams) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-in fade-in duration-700">
        <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin shadow-2xl" />
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Matrix Core</p>
          <p className="text-sm font-bold text-slate-900 mt-2 uppercase tracking-tighter">Automating Session Parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Attendance Marker</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {sessionParams ? "Matrix Sync Interface" : "Step 1: Session Parameters"}
          </p>
        </div>

        {sessionParams && (
           <button 
             onClick={() => setSessionParams(null)}
             className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors text-[10px] font-bold uppercase tracking-widest"
           >
             <ChevronLeft size={14} /> Change Session
           </button>
        )}
      </div>

      {!sessionParams && <ShortageAlert shortages={shortages} />}

      {success && (
        <div className="p-5 bg-emerald-500 text-white rounded-[2rem] flex items-center gap-4 shadow-xl shadow-emerald-500/20 animate-in slide-in-from-top-4">
           <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
             <CheckCircle2 size={24} />
           </div>
           <div>
             <h3 className="text-sm font-black uppercase tracking-widest">Transmission Successful</h3>
             <p className="text-emerald-50 text-xs font-medium">The attendance matrix has been permanently logged to the system core.</p>
           </div>
        </div>
      )}
      
      {error && (
        <div className="p-5 bg-rose-50 border border-rose-100 text-rose-700 rounded-[2rem] flex items-center gap-4 shadow-sm animate-in slide-in-from-top-4">
           <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0 text-rose-600">
             <span className="font-black text-lg">!</span>
           </div>
           <div>
             <h3 className="text-sm font-black uppercase tracking-widest text-rose-900">System Error</h3>
             <p className="text-xs font-medium">{error}</p>
           </div>
        </div>
      )}

      {/* Main Flow Logic */}
      {!sessionParams ? (
        <ClassSelectorFlow 
          onSelectionComplete={handleSelectionComplete} 
          initialSelection={
            initialBatch && initialSubject && initialLecture
            ? { batchId: initialBatch, subjectId: initialSubject, lecture: parseInt(initialLecture) }
            : undefined
          }
        />
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {/* Active Session Info Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <InfoCard label="Section" value={sessionParams.batch.name} sub={sessionParams.section ? `Section ${sessionParams.section}` : undefined} />
             <InfoCard label="Subject Module" value={sessionParams.subject.name} sub={sessionParams.subject.code} />
             <InfoCard label="Lecture Node" value={`Lec ${sessionParams.lecture}`} highlight />
             <InfoCard 
               label="Status" 
               value={existingAttendance ? (existingAttendance.isRectified ? "Rectified" : "Marked") : "Pending"} 
               highlight={!!existingAttendance}
               icon={existingAttendance ? <CheckCircle2 size={14} /> : <Calendar size={14} />} 
             />
          </div>

          {existingAttendance && !isRectifying ? (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 text-center space-y-4 shadow-sm animate-in fade-in zoom-in duration-500">
               <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 size={40} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Attendance Already Logged</h2>
               <p className="text-slate-500 max-w-md mx-auto text-sm font-medium">
                 Data for this session was captured on {new Date(existingAttendance.createdAt).toLocaleDateString()}.
                 {existingAttendance.isRectified && " This record has been previously rectified."}
               </p>
               <div className="pt-4">
                 <button 
                   onClick={() => setIsRectifying(true)}
                   className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                 >
                   Rectify Attendance
                 </button>
               </div>
            </div>
          ) : (
            <>
              {isRectifying && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-800 animate-in slide-in-from-top-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="font-black text-xs">!</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    Rectification Mode: Changes will be tracked by administration.
                  </p>
                </div>
              )}
              
              {loading ? (
                <div className="h-64 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Student Roster...</p>
                </div>
              ) : (
                <AttendanceMarker 
                  students={students} 
                  initialRecords={existingAttendance?.records}
                  onSubmit={handleAttendanceSubmit} 
                  isSubmitting={submitting}
                />
              )}
            </>
          )}

        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
        <div className="h-64 bg-slate-100 rounded-[2.5rem]"></div>
      </div>
    }>
      <AttendancePageContent />
    </Suspense>
  );
}

function InfoCard({ label, value, sub, highlight, icon }: any) {
  return (
    <div className={`p-5 rounded-[2rem] border relative overflow-hidden ${highlight ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-50 border-slate-100'}`}>
      {highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <span className={`block text-[9px] font-black uppercase tracking-widest mb-1 opacity-60`}>{label}</span>
          <span className={`block text-lg font-black leading-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</span>
          {sub && <span className={`block text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50`}>{sub}</span>}
        </div>
        {icon && <div className="opacity-50 mt-1">{icon}</div>}
      </div>
    </div>
  );
}

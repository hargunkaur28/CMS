'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Users, ArrowRight, GraduationCap } from 'lucide-react';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission: any;
  onEnroll: (batchId: string, studentId: string) => void; // synchronous now
}

const mockBatches = [
  { _id: 'b1', name: 'Batch 2024-28 (A)', course: 'Computer Science' },
  { _id: 'b2', name: 'Batch 2024-28 (B)', course: 'Computer Science' },
];

export default function EnrollmentModal({ isOpen, onClose, admission, onEnroll }: EnrollmentModalProps) {
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolledStudentId, setEnrolledStudentId] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (!selectedBatchId) return;
    setIsEnrolling(true);
    await new Promise(r => setTimeout(r, 1500));
    const studentId = `GIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    // Update parent Kanban state immediately
    onEnroll(selectedBatchId, studentId);
    // Then show success screen
    setEnrolledStudentId(studentId);
    setIsEnrolling(false);
  };

  const handleClose = () => {
    setSelectedBatchId('');
    setEnrolledStudentId(null);
    setIsEnrolling(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[60]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!enrolledStudentId ? handleClose : undefined}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10"
      >
        {enrolledStudentId ? (
          /* ── Success Screen ── */
          <div className="p-10 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Enrollment Successful!</h2>
              <p className="text-slate-500 mt-2">The student has been officially admitted.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Generated Student ID</p>
              <p className="text-3xl font-mono font-bold text-indigo-600 tracking-tighter">{enrolledStudentId}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
            >
              Go back to Kanban
            </button>
          </div>
        ) : (
          /* ── Enrollment Form ── */
          <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Final Enrollment</h2>
              </div>
              <X onClick={handleClose} className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
            </div>

            <div className="p-6 space-y-5">
              {/* Candidate info */}
              <div className="flex items-center p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl justify-between">
                <div>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Candidate</p>
                  <p className="text-base font-bold text-slate-900">{admission?.fullName || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Course</p>
                  <p className="text-sm font-semibold text-slate-700">{admission?.courseId?.name || '—'}</p>
                </div>
              </div>

              {/* Batch selector */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Users className="w-4 h-4" /> Choose Batch
                </h3>
                {mockBatches.map((batch) => (
                  <div
                    key={batch._id}
                    onClick={() => setSelectedBatchId(batch._id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedBatchId === batch._id
                        ? 'border-indigo-600 bg-indigo-50/20'
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-bold text-sm ${selectedBatchId === batch._id ? 'text-indigo-700' : 'text-slate-700'}`}>
                          {batch.name}
                        </p>
                        <span className="text-xs text-slate-400">{batch.course}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedBatchId === batch._id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200'
                      }`}>
                        {selectedBatchId === batch._id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning */}
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  This will generate a unique Student ID and create a portal login. Action is irreversible.
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 text-slate-600 bg-slate-100 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={!selectedBatchId || isEnrolling}
                className="flex-[1.5] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isEnrolling ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Enrolling...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Complete Enrollment <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

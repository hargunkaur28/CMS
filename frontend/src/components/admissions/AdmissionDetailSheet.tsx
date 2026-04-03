'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  FileCheck, 
  Edit, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface AdmissionDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  admission: any | null;
  onStatusChange: (id: string, newStatus: string) => void;
}

export default function AdmissionDetailSheet({ isOpen, onClose, admission, onStatusChange }: AdmissionDetailSheetProps) {
  if (!admission) return null;

  // Default documents if not present in the record
  const documents = admission.documents && admission.documents.length > 0 
    ? admission.documents 
    : [
        { name: '10th Marksheet', status: 'verified' },
        { name: '12th Marksheet', status: 'pending' },
        { name: 'Aadhar Card', status: 'verified' },
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 h-full flex flex-col">
              <header className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Application Details</h2>
                    <p className="text-sm text-slate-500 font-mono">ID: {admission._id}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors focus:outline-none">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </header>

              <div className="flex-1 space-y-8">
                {/* User Header */}
                <section>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{admission.fullName}</h3>
                  <p className="text-indigo-600 font-medium">{admission.courseId?.name || 'Selected Course'}</p>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                     <div className="flex items-center space-x-3 text-slate-600">
                       <Mail className="w-4 h-4" /> <span className="text-sm">{admission.email || 'N/A'}</span>
                     </div>
                     <div className="flex items-center space-x-3 text-slate-600">
                       <Phone className="w-4 h-4" /> <span className="text-sm">{admission.phone || 'N/A'}</span>
                     </div>
                     <div className="flex items-center space-x-3 text-slate-600">
                       <MapPin className="w-4 h-4" /> <span className="text-sm">{admission.address || 'H-56, South Extension, New Delhi'}</span>
                     </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Documents Section */}
                <section>
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                    <FileCheck className="w-5 h-5 text-emerald-500" />
                    <span>Documents Verification</span>
                  </h4>
                  <div className="space-y-3">
                    {documents.map((doc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">{doc.name}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${
                          doc.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {doc.status || 'pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Remarks Section */}
                <section>
                   <h4 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                    <Edit className="w-5 h-5 text-indigo-500" />
                    <span>Admin Remarks</span>
                  </h4>
                  <textarea 
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="Enter enquiry remarks or interview feedback..."
                    defaultValue={admission.remarks || ''}
                  ></textarea>
                </section>
              </div>

              {/* Action Buttons */}
              <footer className="mt-8 pt-6 border-t border-slate-100 flex space-x-4">
                {admission.status !== 'enrolled' && admission.status !== 'rejected' && (
                  <>
                    <button 
                      onClick={() => onStatusChange(admission._id, 'rejected')}
                      className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => onStatusChange(admission._id, admission.status === 'approved' ? 'enrolled' : 'approved')}
                      className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>{admission.status === 'approved' ? 'Enroll Student' : 'Approve Application'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                {admission.status === 'enrolled' && (
                   <div className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-center border border-emerald-100">
                      Successfully Enrolled
                   </div>
                )}
              </footer>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

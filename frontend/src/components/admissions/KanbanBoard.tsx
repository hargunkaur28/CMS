'use client';

import React, { useState } from 'react';
import EnquiryCard from './EnquiryCard';
import AdmissionDetailSheet from './AdmissionDetailSheet';
import EnrollmentModal from './EnrollmentModal';
import { motion } from 'framer-motion';
import { MoreHorizontal, UserPlus } from 'lucide-react';

const columns = [
  { id: 'enquiry', title: 'New Enquiries', color: 'bg-blue-500' },
  { id: 'applied', title: 'Applied', color: 'bg-purple-500' },
  { id: 'approved', title: 'Approved', color: 'bg-amber-500' },
  { id: 'enrolled', title: 'Enrolled (Current)', color: 'bg-emerald-500' },
];

// Mock data — each record has full details for the side sheet
const initialEnquiries = [
  {
    _id: '1', fullName: 'Arjun Sharma', email: 'arjun.s@gmail.com', phone: '+91 98765 43210',
    address: 'H-56, South Extension, New Delhi',
    courseId: { name: 'Computer Science & Engineering' }, status: 'enquiry', appliedDate: '2026-03-22',
    documents: [{ name: '10th Marksheet', status: 'verified' }, { name: '12th Marksheet', status: 'pending' }, { name: 'Aadhar Card', status: 'verified' }],
  },
  {
    _id: '2', fullName: 'Priya Patel', email: 'priya.p@gmail.com', phone: '+91 91234 56789',
    address: '12, MG Road, Pune, Maharashtra',
    courseId: { name: 'Biotechnology' }, status: 'applied', appliedDate: '2026-03-24',
    documents: [{ name: '10th Marksheet', status: 'verified' }, { name: '12th Marksheet', status: 'verified' }, { name: 'Aadhar Card', status: 'pending' }],
  },
  {
    _id: '3', fullName: 'Rahul Verma', email: 'rahul.v@gmail.com', phone: '+91 99887 76655',
    address: '45, Lajpat Nagar, New Delhi',
    courseId: { name: 'Data Science' }, status: 'approved', appliedDate: '2026-03-20',
    documents: [{ name: '10th Marksheet', status: 'verified' }, { name: '12th Marksheet', status: 'verified' }, { name: 'Aadhar Card', status: 'verified' }],
  },
  {
    _id: '4', fullName: 'Sneha Reddy', email: 'sneha.r@gmail.com', phone: '+91 88776 65544',
    address: '7, Banjara Hills, Hyderabad',
    courseId: { name: 'UX Design' }, status: 'enrolled', appliedDate: '2026-03-15',
    documents: [{ name: '10th Marksheet', status: 'verified' }, { name: '12th Marksheet', status: 'verified' }],
  },
  {
    _id: '5', fullName: 'Vikram Singh', email: 'vikram.s@gmail.com', phone: '+91 77665 54433',
    address: '22, Sector 17, Chandigarh',
    courseId: { name: 'Computer Science & Engineering' }, status: 'enquiry', appliedDate: '2026-03-25',
    documents: [{ name: '10th Marksheet', status: 'pending' }, { name: '12th Marksheet', status: 'pending' }],
  },
];

export default function KanbanBoard() {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const handleCardClick = (id: string) => {
    const found = enquiries.find(e => e._id === id);
    if (found) {
      setSelectedEnquiry(found);
      setIsSheetOpen(true);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === 'enrolled') {
      setIsEnrollModalOpen(true);
      setIsSheetOpen(false);
      return;
    }
    setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
    // Update selectedEnquiry so the sheet re-renders with new status
    setSelectedEnquiry((prev: any) => prev?._id === id ? { ...prev, status: newStatus } : prev);
    setIsSheetOpen(false);
  };

  const handleEnroll = (_batchId: string, _studentId: string) => {
    // Move the card to enrolled — modal stays open to show success screen
    setEnquiries(prev => prev.map(e =>
      e._id === selectedEnquiry?._id ? { ...e, status: 'enrolled' } : e
    ));
    // Modal will close itself when user clicks "Go back to Kanban"
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Admission CRM</h3>
          <p className="text-sm text-slate-500">Manage student leads and enrollment pipeline</p>
        </div>
        <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
          <UserPlus className="w-4 h-4" />
          <span>New Enquiry</span>
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-5 overflow-x-auto pb-4">
        {columns.map((col) => {
          const cards = enquiries.filter(e => e.status === col.id);
          return (
            <div key={col.id} className="flex-shrink-0 w-72 flex flex-col">
              <header className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="font-bold text-slate-600 text-xs uppercase tracking-wider">{col.title}</span>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{cards.length}</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-300 cursor-pointer hover:text-slate-500 transition-colors" />
              </header>

              <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-200/60 space-y-3 min-h-[200px]">
                {cards.map((enquiry) => (
                  <EnquiryCard
                    key={enquiry._id}
                    enquiry={enquiry as any}
                    onClick={handleCardClick}
                  />
                ))}
                {cards.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-slate-300 text-sm font-medium">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side Sheet */}
      <AdmissionDetailSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        admission={selectedEnquiry}
        onStatusChange={handleStatusChange}
      />

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        admission={selectedEnquiry}
        onEnroll={handleEnroll}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { X, User, BookOpen, Share2, Plus } from "lucide-react";
import { Enquiry } from "./EnquiryCard";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (enquiry: Enquiry) => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    program: "Computer Science",
    source: "WEBSITE" as Enquiry["source"],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newEnquiry: Enquiry = {
      id: `ENQ-${Math.floor(Math.random() * 9000) + 1000}`,
      name: formData.name,
      program: formData.program,
      source: formData.source,
      leadScore: Math.floor(Math.random() * 60) + 20, // Random initial score
      counselorInitials: "AD",
      daysInStage: 0,
      stage: "NEW",
      interactions: [
        { type: "SYSTEM", message: "Initial record created.", time: "Just now", outgoing: true }
      ],
    };

    onAdd(newEnquiry);
    setFormData({ name: "", program: "Computer Science", source: "WEBSITE" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-sidebar-start/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-white/5 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-container/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-indigo/10 text-primary-indigo flex items-center justify-center">
              <Plus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-on-surface">New Lead</h2>
              <p className="text-xs text-white/30 font-utility uppercase tracking-widest">Add to Pipeline</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-on-surface transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-utility font-bold text-white/20 uppercase tracking-[0.1em]">Student Name</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 focus-within:border-primary-indigo/50 transition-all group">
              <User size={18} className="text-white/20 group-focus-within:text-primary-indigo transition-colors" />
              <input 
                type="text" 
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-transparent border-none text-sm text-white placeholder:text-white/20 focus:ring-0 w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-utility font-bold text-white/20 uppercase tracking-[0.1em]">Preferred Program</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 focus-within:border-primary-indigo/50 transition-all group">
              <BookOpen size={18} className="text-white/20 group-focus-within:text-primary-indigo transition-colors" />
              <select 
                value={formData.program}
                onChange={(e) => setFormData({...formData, program: e.target.value})}
                className="bg-transparent border-none text-sm text-white focus:ring-0 w-full appearance-none"
              >
                <option value="Computer Science" className="bg-sidebar-start">Computer Science</option>
                <option value="Business Admin" className="bg-sidebar-start">Business Admin</option>
                <option value="Cybersecurity" className="bg-sidebar-start">Cybersecurity</option>
                <option value="Architecture" className="bg-sidebar-start">Architecture</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-utility font-bold text-white/20 uppercase tracking-[0.1em]">Lead Source</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 focus-within:border-primary-indigo/50 transition-all group">
              <Share2 size={18} className="text-white/20 group-focus-within:text-primary-indigo transition-colors" />
              <select 
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value as Enquiry["source"]})}
                className="bg-transparent border-none text-sm text-white focus:ring-0 w-full appearance-none"
              >
                <option value="WEBSITE" className="bg-sidebar-start">Website</option>
                <option value="WHATSAPP" className="bg-sidebar-start">WhatsApp</option>
                <option value="SOCIAL" className="bg-sidebar-start">Social Media</option>
                <option value="REFERRAL" className="bg-sidebar-start">Referral</option>
                <option value="WALK_IN" className="bg-sidebar-start">Walk-in</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-utility font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/5"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl text-xs font-utility font-bold text-white bg-indigo-gradient shadow-ambient hover:opacity-90 transition-all"
            >
              CREATE LEAD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;

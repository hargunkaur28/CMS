"use client";

import React, { useState } from "react";
import KanbanBoard from "@/components/admissions/KanbanBoard";
import EnquiryDetailPanel from "@/components/admissions/EnquiryDetailPanel";
import AddLeadModal from "@/components/admissions/AddLeadModal";
import { Enquiry, Interaction } from "@/components/admissions/EnquiryCard";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreHorizontal,
  ChevronRight
} from "lucide-react";

const INITIAL_ENQUIRIES: Enquiry[] = [
  { 
    id: "ENQ-9901", 
    name: "Marcus Sterling", 
    program: "Computer Science", 
    source: "WEBSITE", 
    leadScore: 32, 
    counselorInitials: "MS", 
    daysInStage: 2,
    stage: "NEW",
    interactions: [
      { type: "SYSTEM", message: "Initial enquiry received via website form.", time: "2 days ago", outgoing: false }
    ]
  },
  { 
    id: "ENQ-9902", 
    name: "Elena Rodriguez", 
    program: "Business Admin", 
    source: "WHATSAPP", 
    leadScore: 68, 
    counselorInitials: "ER", 
    daysInStage: 5,
    stage: "NEW",
    interactions: [
      { type: "WHATSAPP", message: "Asked about scholarship opportunities.", time: "1 day ago", outgoing: false }
    ]
  },
  { 
    id: "ENQ-9903", 
    name: "Jordan Lee", 
    program: "Architecture", 
    source: "WEBSITE", 
    leadScore: 88, 
    counselorInitials: "JL", 
    daysInStage: 1,
    stage: "CONTACTED",
    interactions: [
      { type: "PHONE", message: "Called to discuss campus visit schedule.", time: "4 hours ago", outgoing: false },
      { type: "SYSTEM", message: "Follow-up email sent.", time: "2 hours ago", outgoing: true }
    ]
  },
  { 
    id: "ENQ-9904", 
    name: "Sarah Chen", 
    program: "Cybersecurity", 
    source: "WHATSAPP", 
    leadScore: 92, 
    counselorInitials: "SC", 
    daysInStage: 2,
    stage: "QUALIFIED",
    interactions: [
      { type: "WHATSAPP", message: "Documents verified by the team.", time: "Yesterday", outgoing: true }
    ]
  },
];

export default function AdmissionsPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL_ENQUIRIES);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedEnquiry = enquiries.find(e => e.id === selectedEnquiryId) || null;

  const filteredEnquiries = enquiries.filter(enquiry => 
    enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enquiry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enquiry.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedEnquiries = filteredEnquiries.reduce((acc, enquiry) => {
    const stage = enquiry.stage;
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(enquiry);
    return acc;
  }, {} as Record<string, Enquiry[]>);

  const handleUpdateEnquiry = (id: string, updates: Partial<Enquiry>) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleAddInteraction = (enquiryId: string, interaction: Interaction) => {
    setEnquiries(prev => prev.map(e => 
      e.id === enquiryId 
        ? { ...e, interactions: [interaction, ...e.interactions] } 
        : e
    ));
  };

  const handleAddEnquiry = (enquiry: Enquiry) => {
    setEnquiries(prev => [enquiry, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-utility font-bold text-white/30 uppercase tracking-[0.1em] mb-1">
              Admissions Pipeline <ChevronRight size={12} className="text-white/20" /> CRM
            </div>
            <h1 className="text-2xl font-display font-bold text-on-surface">Student Acquisition</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container/50 text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container transition-all border border-white/5 font-utility group">
              <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-gradient text-white text-xs font-bold rounded-lg shadow-ambient hover:opacity-90 transition-opacity font-utility active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>New Lead</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between gap-4 p-2 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 flex-1 max-w-md px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 focus-within:border-primary-indigo/30 transition-all">
            <Search size={14} className="text-white/20" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or program..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder:text-white/20 focus:ring-0 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 text-white/40 hover:text-white text-xs font-bold rounded-lg transition-all font-utility">
              <Filter size={14} />
              <span>Filter</span>
            </button>
            <button className="p-2 hover:bg-white/10 text-white/20 hover:text-white rounded-lg transition-all">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* KPI Cards Row (Contextual to Admissions) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Conversion Rate", value: "24.8%", sub: "+2.4% from last cycle", icon: Users, color: "bg-primary-indigo" },
          { label: "Total Pipeline Value", value: "$1.2M", sub: "Projected revenue", icon: Download, color: "bg-blue-500" },
          { label: "Active Counselors", value: "14", sub: "4 currently online", icon: Users, color: "bg-emerald-500" },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface-container-lowest p-5 rounded-xl shadow-ambient border-l-[3px] border-primary-indigo/30 flex justify-between items-center group hover:scale-[1.02] transition-transform">
            <div>
              <h3 className="text-[10px] font-utility font-bold text-white/30 uppercase tracking-widest mb-1">{kpi.label}</h3>
              <p className="text-xl font-display font-bold text-on-surface">{kpi.value}</p>
              <p className="text-[9px] text-emerald-500 font-bold mt-1 uppercase tracking-tighter">{kpi.sub}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.color}/10 text-${kpi.color}`}>
              <kpi.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <KanbanBoard 
        data={groupedEnquiries} 
        onCardClick={(enquiry) => setSelectedEnquiryId(enquiry.id)} 
      />

      {/* Detail Panel Overlay */}
      <EnquiryDetailPanel 
        enquiry={selectedEnquiry} 
        onClose={() => setSelectedEnquiryId(null)}
        onUpdate={(updates) => handleUpdateEnquiry(selectedEnquiryId!, updates)}
        onAddInteraction={(interaction) => handleAddInteraction(selectedEnquiryId!, interaction)}
      />

      {/* Add Lead Modal */}
      <AddLeadModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddEnquiry} 
      />
    </div>
  );
}

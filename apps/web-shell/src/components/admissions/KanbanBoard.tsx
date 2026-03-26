"use client";

import React from "react";
import EnquiryCard, { Enquiry } from "./EnquiryCard";
import { Plus, MoreHorizontal } from "lucide-react";

interface KanbanColumnProps {
  title: string;
  count: number;
  enquiries: Enquiry[];
  onCardClick: (enquiry: Enquiry) => void;
  color: string;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, count, enquiries, onCardClick, color }) => {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col h-full bg-surface-container/30 rounded-xl overflow-hidden border border-white/5">
      <div className="p-3 flex items-center justify-between border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="text-xs font-utility font-bold text-on-surface uppercase tracking-wider">{title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white/40">{count}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-white/10 rounded transition-colors text-white/20">
            <Plus size={14} />
          </button>
          <button className="p-1 hover:bg-white/10 rounded transition-colors text-white/20">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {enquiries.map((enquiry) => (
          <EnquiryCard key={enquiry.id} enquiry={enquiry} onClick={onCardClick} />
        ))}
        {enquiries.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/40 mb-2" />
            <p className="text-[10px] font-utility uppercase tracking-widest text-white">No Enquiries</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface KanbanBoardProps {
  data: Record<string, Enquiry[]>;
  onCardClick: (enquiry: Enquiry) => void;
}

const stages = [
  { id: "NEW", title: "New", color: "bg-primary-indigo" },
  { id: "CONTACTED", title: "Contacted", color: "bg-emerald-500" },
  { id: "QUALIFIED", title: "Qualified", color: "bg-amber-500" },
  { id: "APPLIED", title: "Applied", color: "bg-blue-500" },
  { id: "ADMITTED", title: "Admitted", color: "bg-indigo-400" },
  { id: "ENROLLED", title: "Enrolled", color: "bg-indigo-600" },
  { id: "DROPPED", title: "Dropped", color: "bg-rose-500" },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ data, onCardClick }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-200px)] custom-scrollbar">
      {stages.map((stage) => (
        <KanbanColumn
          key={stage.id}
          title={stage.title}
          color={stage.color}
          count={data[stage.id]?.length || 0}
          enquiries={data[stage.id] || []}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;

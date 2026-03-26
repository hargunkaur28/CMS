"use client";

import React from "react";
import { MessageSquare, Globe, Share2, MoreVertical, Clock } from "lucide-react";
import Card from "@/components/ui/Card";

export interface Interaction {
  type: "WHATSAPP" | "SYSTEM" | "PHONE" | "MAIL";
  message: string;
  time: string;
  outgoing: boolean;
}

export interface Enquiry {
  id: string;
  name: string;
  program: string;
  source: "WHATSAPP" | "WEBSITE" | "REFERRAL" | "SOCIAL" | "FAIR" | "WALK_IN";
  leadScore: number;
  counselorInitials: string;
  daysInStage: number;
  stage: string;
  interactions: Interaction[];
}

interface EnquiryCardProps {
  enquiry: Enquiry;
  onClick: (enquiry: Enquiry) => void;
}

const sourceIcons = {
  WHATSAPP: <MessageSquare size={12} className="text-emerald-500" />,
  WEBSITE: <Globe size={12} className="text-primary-indigo" />,
  REFERRAL: <Share2 size={12} className="text-amber-500" />,
  SOCIAL: <Globe size={12} className="text-blue-400" />,
  FAIR: <Users size={12} className="text-rose-400" />,
  WALK_IN: <Users size={12} className="text-gray-400" />,
};

import { Users } from "lucide-react";

const EnquiryCard: React.FC<EnquiryCardProps> = ({ enquiry, onClick }) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <Card 
      showAccentBorder={false} 
      className="p-4 cursor-pointer hover:shadow-lg transition-all group border border-transparent hover:border-primary-indigo/20 active:scale-[0.98]"
      onClick={() => onClick(enquiry)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-surface-container flex items-center justify-center">
            {sourceIcons[enquiry.source]}
          </div>
          <span className="text-[10px] font-utility font-bold text-white/30 uppercase tracking-wider">{enquiry.source}</span>
        </div>
        <button className="text-white/20 hover:text-on-surface transition-colors">
          <MoreVertical size={14} />
        </button>
      </div>

      <div className="mb-4">
        <h4 className="font-display font-bold text-on-surface text-sm mb-1 group-hover:text-primary-indigo transition-colors">{enquiry.name}</h4>
        <span className="px-2 py-0.5 rounded-full bg-primary-indigo/5 text-primary-indigo text-[10px] font-bold uppercase tracking-tighter">
          {enquiry.program}
        </span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getScoreColor(enquiry.leadScore)}`}>
            {enquiry.leadScore}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/30 font-utility">
            <Clock size={10} />
            <span>{enquiry.daysInStage}d</span>
          </div>
        </div>
        
        <div className="w-6 h-6 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40 overflow-hidden">
          {enquiry.counselorInitials}
        </div>
      </div>
    </Card>
  );
};

export default EnquiryCard;

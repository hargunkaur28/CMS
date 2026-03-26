"use client";

import React, { useState } from "react";
import { X, MessageSquare, Phone, Mail, FileText, User, ChevronRight, Send, Sparkles } from "lucide-react";
import { Enquiry, Interaction } from "./EnquiryCard";

interface EnquiryDetailPanelProps {
  enquiry: Enquiry | null;
  onClose: () => void;
  onUpdate: (updates: Partial<Enquiry>) => void;
  onAddInteraction: (interaction: Interaction) => void;
}

const stages = [
  { id: "NEW", title: "New" },
  { id: "CONTACTED", title: "Contacted" },
  { id: "QUALIFIED", title: "Qualified" },
  { id: "APPLIED", title: "Applied" },
  { id: "ADMITTED", title: "Admitted" },
  { id: "ENROLLED", title: "Enrolled" },
  { id: "DROPPED", title: "Dropped" },
];

const EnquiryDetailPanel: React.FC<EnquiryDetailPanelProps> = ({ 
  enquiry, 
  onClose,
  onUpdate,
  onAddInteraction
}) => {
  const [logMessage, setLogMessage] = useState("");

  if (!enquiry) return null;

  const handleSendInteraction = () => {
    if (!logMessage.trim()) return;
    
    onAddInteraction({
      type: "SYSTEM",
      message: logMessage,
      time: "Just now",
      outgoing: true
    });
    setLogMessage("");
  };

  const handleStageChange = (newStage: string) => {
    onUpdate({ stage: newStage });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-surface-container-lowest shadow-2xl z-[100] border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-start bg-surface-container/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-indigo/10 text-primary-indigo flex items-center justify-center font-bold text-lg">
            {enquiry.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-on-surface leading-tight">{enquiry.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-utility font-bold text-primary-indigo bg-primary-indigo/5 px-2 py-0.5 rounded-full uppercase">{enquiry.program}</span>
              <span className="text-[10px] font-utility text-white/30 uppercase tracking-widest">• {enquiry.id}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-on-surface transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
        {/* Stage Management */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-utility font-bold text-white/20 uppercase tracking-[0.1em]">Current Stage</h3>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold text-white/40 bg-white/5 border border-white/5 uppercase tracking-tighter`}>
              {enquiry.daysInStage} days
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {stages.map((stage) => {
              const isActive = enquiry.stage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-utility font-bold text-left transition-all border ${
                    isActive 
                      ? "bg-primary-indigo text-white border-primary-indigo shadow-ambient" 
                      : "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {stage.title}
                </button>
              );
            })}
          </div>
        </section>

        {/* Lead Score */}
        <section>
          <h3 className="text-[10px] font-utility font-bold text-white/20 uppercase tracking-[0.1em] mb-4">Lead Score Analysis</h3>
          <div className="p-4 rounded-xl bg-surface-container/30 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-display font-bold text-on-surface">{enquiry.leadScore}</span>
              <span className={`text-[10px] font-bold uppercase ${enquiry.leadScore >= 70 ? "text-emerald-500" : enquiry.leadScore >= 40 ? "text-amber-500" : "text-rose-500"}`}>
                {enquiry.leadScore >= 70 ? "High Potential" : enquiry.leadScore >= 40 ? "Medium Potential" : "Low Potential"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
              <div 
                className={`h-full transition-all duration-1000 ${enquiry.leadScore >= 70 ? "bg-emerald-500" : enquiry.leadScore >= 40 ? "bg-amber-500" : "bg-rose-500"}`} 
                style={{ width: `${enquiry.leadScore}%` }} 
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded bg-white/5 text-[9px] text-white/40 border border-white/5 font-utility uppercase tracking-tighter hover:text-white transition-colors cursor-default">Academic Profile: 88</span>
              <span className="px-2 py-1 rounded bg-white/5 text-[9px] text-white/40 border border-white/5 font-utility uppercase tracking-tighter hover:text-white transition-colors cursor-default">Engagement: 72</span>
              <button className="px-2 py-1 rounded bg-primary-indigo/10 text-[9px] text-primary-indigo border border-primary-indigo/20 font-utility font-bold uppercase tracking-tighter flex items-center gap-1 hover:bg-primary-indigo hover:text-white transition-all">
                <Sparkles size={8} /> Recalculate
              </button>
            </div>
          </div>
        </section>

        {/* AI Insights (The "WOW" factor) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-primary-indigo animate-pulse" />
            <h3 className="text-[10px] font-utility font-bold text-white/20 uppercase tracking-[0.1em]">AI Cognitive Insights</h3>
          </div>
          <div className="p-4 rounded-xl bg-indigo-gradient/5 border border-primary-indigo/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={40} className="text-primary-indigo" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-utility font-bold uppercase">Sentiment</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">Highly Positive</span>
              </div>
              <p className="text-xs text-on-surface/80 leading-relaxed italic">
                "Student shows strong interest in the Research initiatives and is likely to convert if scholarship details are provided."
              </p>
              <div className="pt-2 border-t border-white/5">
                <p className="text-[9px] text-white/20 font-bold uppercase mb-2">Suggested Actions</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-white/60">
                    <div className="w-1 h-1 rounded-full bg-primary-indigo" />
                    Send CS Honors Program brochure
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/60">
                    <div className="w-1 h-1 rounded-full bg-primary-indigo" />
                    Schedule call with Dept. Head
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interaction History */}
        <section className="flex-1">
          <h3 className="text-[10px] font-utility font-bold text-white/20 uppercase tracking-[0.1em] mb-4">Interaction Log</h3>
          <div className="space-y-4">
            {enquiry.interactions.map((log, i) => (
              <div key={i} className={`flex flex-col ${log.outgoing ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-utility leading-relaxed ${
                  log.outgoing ? "bg-primary-indigo text-white rounded-tr-none" : "bg-white/5 text-white/70 rounded-tl-none"
                }`}>
                  {log.message}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[9px] text-white/20 uppercase font-bold tracking-tighter">
                  {log.type === "WHATSAPP" && <MessageSquare size={10} />}
                  {log.type === "SYSTEM" && <Send size={10} />}
                  {log.type === "PHONE" && <Phone size={10} />}
                  {log.type === "MAIL" && <Mail size={10} />}
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
            {enquiry.interactions.length === 0 && (
              <div className="text-center py-8 opacity-20">
                <MessageSquare size={32} className="mx-auto mb-2" />
                <p className="text-[10px] font-utility uppercase tracking-widest text-white">No interactions recorded</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer Interface */}
      <div className="p-4 bg-white/5 border-t border-white/5 space-y-4">
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center p-3 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all border border-emerald-500/20 active:scale-95">
            <MessageSquare size={18} />
          </button>
          <button className="flex-1 flex items-center justify-center p-3 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all border border-blue-500/20 active:scale-95">
            <Phone size={18} />
          </button>
          <button className="flex-1 flex items-center justify-center p-3 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all border border-amber-500/20 active:scale-95">
            <Mail size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/5 focus-within:border-primary-indigo/50 transition-all">
           <input 
             type="text" 
             placeholder="Log an interaction..." 
             value={logMessage}
             onChange={(e) => setLogMessage(e.target.value)}
             onKeyDown={(e) => e.key === "Enter" && handleSendInteraction()}
             className="flex-1 bg-transparent border-none text-xs text-white placeholder:text-white/20 focus:ring-0"
           />
           <button 
             onClick={handleSendInteraction}
             disabled={!logMessage.trim()}
             className={`p-1 transition-all ${logMessage.trim() ? "text-primary-indigo hover:scale-110" : "text-white/10"}`}
           >
             <Send size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default EnquiryDetailPanel;

// FILE: apps/web-shell/src/components/students/StudentProfileTabs.tsx
"use client";

import React from "react";
import { User, Layers, Calendar, FileText, CreditCard, MessageSquare, ClipboardCheck } from "lucide-react";

interface StudentProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: "overview", label: "Overview", icon: <User size={16} /> },
  { id: "academics", label: "Academics", icon: <Layers size={16} /> },
  { id: "attendance", label: "Attendance", icon: <Calendar size={16} /> },
  { id: "exams", label: "Exams", icon: <ClipboardCheck size={16} /> },
  { id: "fees", label: "Fees", icon: <CreditCard size={16} /> },
  { id: "documents", label: "Documents", icon: <FileText size={16} /> },
  { id: "comms", label: "Communication", icon: <MessageSquare size={16} /> },
];

export default function StudentProfileTabs({ activeTab, setActiveTab }: StudentProfileTabsProps) {
  return (
    <div className="flex border-b border-outline-variant/30 gap-1 overflow-x-auto no-scrollbar scroll-smooth">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all relative shrink-0 ${
            activeTab === tab.id 
            ? "text-primary-indigo" 
            : "text-on-surface/30 hover:text-on-surface/60 hover:bg-surface-container-low"
          }`}
        >
          {tab.icon}
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-indigo rounded-t-full shadow-[0_-2px_8px_rgba(79,70,229,0.3)] animate-in slide-in-from-bottom-1 duration-300" />
          )}
        </button>
      ))}
    </div>
  );
}

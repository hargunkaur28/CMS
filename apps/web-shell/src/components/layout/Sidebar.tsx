"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Calendar, 
  CheckCircle, 
  FileText, 
  GraduationCap, 
  CreditCard, 
  Library, 
  Home, 
  Briefcase, 
  BarChart3, 
  Sparkles, 
  Settings, 
  HelpCircle,
  ChevronLeft
} from "lucide-react";

const navSections = [
  {
    label: "Academic",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/" },
      { label: "Admissions", icon: UserPlus, href: "/admissions" },
      { label: "Students", icon: Users, href: "/students" },
      { label: "Timetable", icon: Calendar, href: "/timetable" },
      { label: "Attendance", icon: CheckCircle, href: "/attendance" },
      { label: "Exams", icon: FileText, href: "/exams" },
      { label: "LMS", icon: GraduationCap, href: "/lms" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Fees & Finance", icon: CreditCard, href: "/finance" },
      { label: "Library", icon: Library, href: "/library" },
      { label: "Hostel", icon: Home, href: "/hostel" },
      { label: "Training & Placement", icon: Briefcase, href: "/placement" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics", icon: BarChart3, href: "/analytics" },
      { label: "AI Assistant", icon: Sparkles, href: "/ai-assistant" },
      { label: "NAAC Reports", icon: FileText, href: "/naac" },
    ],
  },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-60 h-screen bg-sidebar-gradient flex flex-col text-white/70 border-r border-white/5">
      {/* Institution Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-gradient flex items-center justify-center">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-display font-semibold text-lg leading-tight">NGCMS</h1>
            <p className="text-[10px] text-white/40 font-utility uppercase tracking-wider">Enterprise Resource</p>
          </div>
        </div>
        <button className="text-white/40 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Global Search Button Placeholder */}
      <div className="px-4 mb-4">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-white/5 rounded-md text-xs font-utility text-white/40 hover:bg-white/10 transition-all">
          <span>Search (⌘K)</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <h3 className="px-3 mb-2 text-[10px] font-utility font-medium uppercase tracking-[0.05em] text-white/30">
              {section.label}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all group ${
                      isActive 
                        ? "bg-white/10 text-white border-l-2 border-primary-indigo" 
                        : "hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-primary-indigo" : "text-white/40 group-hover:text-white"}`} />
                    <span className="text-sm font-utility font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 bg-white/5 mt-auto">
        <button className="w-full flex items-center gap-3 px-3 py-3 bg-indigo-gradient rounded-lg text-white font-utility font-bold text-sm shadow-ambient mb-4 hover:opacity-90 transition-opacity">
          <Sparkles className="w-4 h-4" />
          <span>ASK ANYTHING</span>
        </button>
        <div className="space-y-1">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 hover:text-white transition-all">
            <Settings className="w-4 h-4 text-white/40" />
            <span className="text-xs font-utility">Settings</span>
          </Link>
          <Link href="/support" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 hover:text-white transition-all">
            <HelpCircle className="w-4 h-4 text-white/40" />
            <span className="text-xs font-utility">Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

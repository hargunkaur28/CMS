"use client";

import React from "react";
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: UserPlus, label: "Admissions", href: "/admin/admissions" },
  { icon: Users, label: "Students", href: "/admin/students" },
  { icon: UserCheck, label: "Faculty", href: "/admin/faculty" },
  { icon: GraduationCap, label: "Academics", href: "/admin/academics" },
  { icon: Calendar, label: "Timetable", href: "/admin/timetable" },
  { icon: ClipboardCheck, label: "Attendance", href: "/admin/attendance" },
  { icon: FileText, label: "Exams", href: "/admin/exams" },
  { icon: CreditCard, label: "Fees", href: "/admin/fees" },
  { icon: MessageSquare, label: "Communication", href: "/admin/communication" },
  { icon: ShieldCheck, label: "NAAC", href: "/admin/naac" },
];

// Helper to avoid import error if some icons are missing or differently named
import { UserPlus } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white" size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Admin Portal</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">College Operations</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group",
                  isActive 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={16} className={cn("transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                <span className="uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 italic text-[10px] text-slate-400 text-center">
          NgCMS v1.0.4 r-2
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Admin Topbar */}
        <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">Instance</span>
            <span className="text-xs font-bold text-slate-900">Main Campus Architecture</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-900 leading-none">College Administrator</p>
                <p className="text-[9px] font-medium text-slate-400">admin@university.edu</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-100 flex items-center justify-center text-white font-bold text-[10px]">
                AD
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

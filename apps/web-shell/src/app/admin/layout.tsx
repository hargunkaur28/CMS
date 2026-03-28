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
  LayoutDashboard,
  UserPlus,
  ArrowRightLeft,
  Sparkles,
  Search,
  Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: ArrowRightLeft, label: "Assignments", href: "/admin/assignments" },
  { icon: UserPlus, label: "Admissions", href: "/admin/admissions" },
  { icon: Users, label: "Students", href: "/admin/students" },
  { icon: UserCheck, label: "Faculty", href: "/admin/faculty" },
  { icon: GraduationCap, label: "Academics", href: "/admin/academics" },
  { icon: ClipboardCheck, label: "Attendance", href: "/admin/attendance" },
  { icon: FileText, label: "Exams", href: "/admin/exams" },
  { icon: CreditCard, label: "Fees", href: "/admin/fees" },
  { icon: MessageSquare, label: "Communication", href: "/admin/communication" },
  { icon: ShieldCheck, label: "Governance", href: "/admin/naac" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* ─── Premium Dark Sidebar ─── */}
      <aside className="w-64 bg-slate-950 text-slate-400 flex flex-col h-full shadow-2xl z-20 relative overflow-hidden group">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50" />
        
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:rotate-12 transition-transform duration-500">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tighter leading-none">Admin Portal</h2>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1.5 opacity-80">Institutional Ops</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1.5 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 relative group/item overflow-hidden",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" 
                    : "text-slate-500 hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-white opacity-50" />
                )}
                <item.icon size={16} className={cn("transition-colors", isActive ? "text-white" : "text-slate-600 group-hover/item:text-indigo-400")} />
                <span>{item.label}</span>
                {isActive && <Sparkles size={10} className="ml-auto opacity-50 text-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-6 border-t border-white/5 space-y-4">
           <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Core Engine Sync</span>
           </div>
           
           <div className="flex bg-white/5 p-4 rounded-2xl items-center gap-3 border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                 <Settings size={14} />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black text-white leading-none uppercase">v1.1.2-rc</p>
                 <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">LTS Instance</p>
              </div>
           </div>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Admin Topbar (Premium Glassmorphism) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-10 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] opacity-80">Main Campus Hierarchy</h3>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center bg-slate-100 px-4 py-2.5 rounded-2xl gap-3 border border-slate-200/50 group">
                <Search size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <input type="text" placeholder="STRATEGIC SEARCH..." className="bg-transparent border-none text-[9px] font-black focus:outline-none w-48 tracking-widest" />
             </div>

             <div className="h-10 w-[1px] bg-slate-200 mx-2" />

             <div className="flex items-center gap-4">
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-900 leading-none uppercase tracking-tighter">Dr. Rajesh Khanna</p>
                   <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 border-r-2 border-indigo-500 pr-2 inline-block">College Admin</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-xl rotate-3 hover:rotate-0 transition-all cursor-pointer">
                   RK
                </div>
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

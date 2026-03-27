"use client";

import React, { useState, useEffect } from "react";
import "./globals.css";
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Calendar, 
  CheckCircle, 
  FileText, 
  BookOpen, 
  CreditCard, 
  Library, 
  Home, 
  Briefcase, 
  BarChart3, 
  Sparkles, 
  FileCheck, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  Menu
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { z } from "zod";

// export const metadata = {
//   title: "NGCMS | Next-Gen College Management System",
//   description: "AI-Powered Advanced Institutional ERP",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Session Check
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const isLoginPage = pathname === "/login";

    if (!token && !isLoginPage) {
      // Not logged in -> Shield active
      router.push("/login");
    } else if (token && isLoginPage) {
      // Already logged in -> Skip login
      router.push("/");
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const isLoginPage = pathname === "/login";

  const canSee = (label: string) => {
    if (!user || !user.role) return false;
    const role = user.role;
    const permissions: Record<string, string[]> = {
      SUPER_ADMIN: ["*"],
      COLLEGE_ADMIN: ["*"], // For now, let Admin see everything
      TEACHER: ["Dashboard", "Timetable", "Attendance", "Exams", "LMS", "Settings"],
      STUDENT: ["Dashboard", "Timetable", "Attendance", "Exams", "LMS", "Fees & Finance", "Settings"],
      PARENT: ["Dashboard", "Timetable", "Attendance", "Exams", "Fees & Finance", "Settings"],
    };
    
    const allowed = permissions[role] || [];
    return allowed.includes("*") || allowed.includes(label);
  };

  return (
    <html lang="en">
      <body className={`bg-surface text-on-surface font-utility ${!isLoginPage ? "h-screen overflow-hidden flex" : ""}`}>
        {loading ? (
          <div className="h-screen w-full flex items-center justify-center bg-surface">
             <div className="w-1.5 h-6 bg-primary-indigo rounded-full animate-bounce" />
          </div>
        ) : isLoginPage ? (
          children
        ) : (
          <>
            {/* Sidebar */}
        <aside className="w-64 bg-surface-container-low text-on-surface/70 flex flex-col border-r border-outline-variant shadow-sm z-50">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
              <span className="font-display font-bold text-white text-lg">N</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-black text-sm tracking-tight">NGCMS</h1>
              <p className="text-[10px] text-black/40 uppercase tracking-widest font-bold">St. Xavier's</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
            {/* Academic Section */}
            <div>
              <p className="px-3 text-[10px] font-bold text-on-surface/20 uppercase tracking-[0.2em] mb-3">Academic</p>
              <div className="space-y-1">
                {canSee("Dashboard") && <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" href="/" active={pathname === "/"} />}
                {canSee("Admissions") && <NavItem icon={<UserPlus size={18} />} label="Admissions" href="/admissions" active={pathname.startsWith("/admissions")} />}
                {canSee("Students") && <NavItem icon={<Users size={18} />} label="Students" href="/students" active={pathname.startsWith("/students")} />}
                {canSee("Timetable") && <NavItem icon={<Calendar size={18} />} label="Timetable" href="/timetable" active={pathname.startsWith("/timetable")} />}
                {canSee("Attendance") && <NavItem icon={<CheckCircle size={18} />} label="Attendance" href="/attendance" active={pathname.startsWith("/attendance")} />}
                {canSee("Exams") && <NavItem icon={<FileText size={18} />} label="Exams" href="/exams" active={pathname.startsWith("/exams")} />}
                {canSee("LMS") && <NavItem icon={<BookOpen size={18} />} label="LMS" href="/lms" active={pathname.startsWith("/lms")} />}
              </div>
            </div>

            {/* Operations Section */}
            <div>
              <p className="px-3 text-[10px] font-bold text-on-surface/20 uppercase tracking-[0.2em] mb-3">Operations</p>
              <div className="space-y-1">
                {canSee("Fees & Finance") && <NavItem icon={<CreditCard size={18} />} label="Fees & Finance" href="/finance" active={pathname.startsWith("/finance")} />}
                {canSee("Library") && <NavItem icon={<Library size={18} />} label="Library" href="/library" active={pathname.startsWith("/library")} />}
                {canSee("Hostel") && <NavItem icon={<Home size={18} />} label="Hostel" href="/hostel" active={pathname.startsWith("/hostel")} />}
                {canSee("Placement") && <NavItem icon={<Briefcase size={18} />} label="Placement" href="/placement" active={pathname.startsWith("/placement")} />}
              </div>
            </div>

            {/* Intelligence Section */}
            <div>
              <p className="px-3 text-[10px] font-bold text-on-surface/20 uppercase tracking-[0.2em] mb-3">Intelligence</p>
              <div className="space-y-1">
                {canSee("Analytics") && <NavItem icon={<BarChart3 size={18} />} label="Analytics" href="/analytics" active={pathname.startsWith("/analytics")} />}
                {canSee("AI Assistant") && <NavItem icon={<Sparkles size={18} />} label="AI Assistant" href="/ai-assistant" active={pathname.startsWith("/ai-assistant")} />}
                {canSee("NAAC Reports") && <NavItem icon={<FileCheck size={18} />} label="NAAC Reports" href="/naac" active={pathname.startsWith("/naac")} />}
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-outline-variant space-y-1">
            <NavItem icon={<Settings size={18} />} label="Settings" href="/settings" />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-black/5 transition-all text-black/60 hover:text-black"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
            <div className="mt-4 flex items-center gap-3 px-3 py-3 bg-white border border-outline-variant rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container-low overflow-hidden border border-outline-variant flex items-center justify-center text-[10px] font-bold text-on-surface/20">
                {user?.name?.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">{user?.name}</p>
                <p className="text-[10px] text-on-surface/40 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 bg-surface-container-lowest/50 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-8 z-40 sticky top-0">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface/50">
                <Menu size={20} />
              </button>
              <div className="h-4 w-[1px] bg-outline-variant" />
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-on-surface/40">
                <span>NGCMS</span>
                <span className="text-on-surface/20">/</span>
                <span className="text-on-surface/80">Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/30 group-focus-within:text-primary-indigo transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Universal Search... (⌘K)" 
                  className="bg-surface-container-low border-transparent focus:border-primary-indigo/30 focus:bg-white transition-all rounded-xl pl-10 pr-4 py-2 text-xs w-64 outline-none border shadow-sm"
                />
              </div>
              <button className="p-2.5 bg-white hover:bg-black/5 rounded-xl text-black/60 hover:text-black border border-outline-variant transition-all relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full border-2 border-white" />
              </button>
              <div className="h-8 w-[1px] bg-outline-variant mx-1" />
              <button className="p-2 bg-black text-white rounded-xl shadow-ambient hover:bg-black/90 transition-all flex items-center gap-2 px-4 active:scale-95">
                <Sparkles size={16} className="text-white" />
                <span className="text-xs font-bold">Ask AI</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {children}
          </main>
        </div>
      </>
    )}
  </body>
</html>
);
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all group ${
        active 
        ? "bg-primary-indigo/10 text-black font-black" 
        : "text-on-surface/50 hover:bg-black/5 hover:text-on-surface"
      }`}
    >
      <span className={`${active ? "text-black" : "text-black/30 group-hover:text-black/60"} transition-colors`}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

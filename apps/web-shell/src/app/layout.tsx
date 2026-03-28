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
  Menu,
  ShieldCheck,
  GraduationCap,
  ClipboardCheck
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const isLoginPage = pathname === "/login";

    if (!token && !isLoginPage) {
      router.push("/login");
    } else if (token && isLoginPage) {
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

  // Temporary permissions mock based on old UI
  const canSee = (label: string) => true; 

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN:   'Super Admin',
    COLLEGE_ADMIN: 'College Admin',
    TEACHER:       'Teacher',
    STUDENT:       'Student',
    PARENT:        'Parent',
  };
  
  const roleColor: Record<string, string> = {
    SUPER_ADMIN:   'bg-purple-500/20 text-purple-300',
    COLLEGE_ADMIN: 'bg-indigo-500/20 text-indigo-300',
    TEACHER:       'bg-emerald-500/20 text-emerald-300',
    STUDENT:       'bg-amber-500/20 text-amber-300',
    PARENT:        'bg-slate-500/20 text-slate-300',
  };

  return (
    <html lang="en">
      <body className={`bg-slate-50 text-slate-900 ${!isLoginPage ? "h-screen flex" : ""}`}>
        {loading ? (
          <div className="h-screen w-full flex items-center justify-center bg-slate-50">
             <div className="w-2 h-6 bg-indigo-500 rounded-full animate-bounce" />
          </div>
        ) : isLoginPage ? (
          children
        ) : (
          <>
            {/* Dark Indigo Sidebar from Frontend */}
            <div className="w-64 bg-slate-900 text-white h-screen flex flex-col z-10 shadow-xl border-r border-slate-800">
              <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold text-indigo-400">NgCMS ERP</h1>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">AI Powered ERP</p>
              </div>

              <nav className="flex-1 mt-4 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
                <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" href="/" active={pathname === "/"} />
                
                <NavItem 
                  icon={<GraduationCap size={18} />} 
                  label="Admissions" 
                  href="/admissions" 
                  active={pathname.startsWith("/admissions")} 
                  roles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}
                  currentUserRole={user?.role}
                />
                
                <NavItem 
                  icon={<Users size={18} />} 
                  label="Students" 
                  href="/students" 
                  active={pathname.startsWith("/students")} 
                  roles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER']}
                  currentUserRole={user?.role}
                />
                
                <NavItem 
                  icon={<BookOpen size={18} />} 
                  label="Academics" 
                  href="/academics" 
                  active={pathname.startsWith("/academics")} 
                  roles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}
                  currentUserRole={user?.role}
                />
                
                <NavItem 
                  icon={<Calendar size={18} />} 
                  label="Timetable" 
                  href="/timetable" 
                  active={pathname.startsWith("/timetable")} 
                />
                
                <NavItem 
                  icon={<ClipboardCheck size={18} />} 
                  label="Attendance" 
                  href="/attendance" 
                  active={pathname.startsWith("/attendance")} 
                  roles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}
                  currentUserRole={user?.role}
                />
                
                <NavItem 
                  icon={<FileText size={18} />} 
                  label="Exams" 
                  href="/exams" 
                  active={pathname.startsWith("/exams")} 
                  roles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']}
                  currentUserRole={user?.role}
                />
                
                <NavItem 
                  icon={<CreditCard size={18} />} 
                  label="Finance" 
                  href="/finance" 
                  active={pathname.startsWith("/finance")} 
                  roles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'PARENT', 'STUDENT']}
                  currentUserRole={user?.role}
                />
                
                <NavItem 
                  icon={<Library size={18} />} 
                  label="Library" 
                  href="/library" 
                  active={pathname.startsWith("/library")} 
                />
                
                <NavItem 
                  icon={<Briefcase size={18} />} 
                  label="Placement" 
                  href="/placement" 
                  active={pathname.startsWith("/placement")} 
                />
                
                <NavItem 
                  icon={<Settings size={18} />} 
                  label="Settings" 
                  href="/settings" 
                  active={pathname.startsWith("/settings")} 
                  roles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}
                  currentUserRole={user?.role}
                />
              </nav>

              <div className="p-4 border-t border-slate-800">
                {user ? (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', roleColor[user?.role || 'STUDENT'])}>
                        {roleLabel[user?.role || 'STUDENT']}
                      </span>
                    </div>
                  </div>
                ) : null}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
              <main className="flex-1 overflow-y-auto p-8">
                {children}
              </main>
            </div>
          </>
        )}
      </body>
    </html>
  );
}

function NavItem({ 
  icon, 
  label, 
  href, 
  active = false, 
  roles,
  currentUserRole 
}: { 
  icon: React.ReactNode, 
  label: string, 
  href: string, 
  active?: boolean,
  roles?: string[],
  currentUserRole?: string
}) {
  if (roles && currentUserRole && !roles.includes(currentUserRole)) {
    return null;
  }

  return (
    <Link 
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
        active
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      )}
    >
      <span className={cn('shrink-0', active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400')}>
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}

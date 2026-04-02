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
  ClipboardCheck,
  Upload,
  MessageSquare
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SocketProvider } from "@/components/providers/SocketProvider";
import NotificationBell from "@/components/layout/NotificationBell";
import api from "@/lib/api";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState<any>(null);

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

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const response = await api.get('/settings/public');
        const settings = response.data?.data;
        if (settings) {
          setGlobalSettings(settings);
        }
      } catch {
        // Keep app functional with defaults if settings endpoint is unavailable.
      }
    };

    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    if (pathname === '/login') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const timeoutMinutes = Number(globalSettings?.session_timeout || 30);
    const timeoutMs = timeoutMinutes * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.clear();
        router.push('/login');
      }, timeoutMs);
    };

    const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [globalSettings?.session_timeout, pathname, router]);

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
    LIBRARIAN:     'Librarian',
  };
  
  const roleColor: Record<string, string> = {
    SUPER_ADMIN:   'bg-purple-500/20 text-purple-300',
    COLLEGE_ADMIN: 'bg-indigo-500/20 text-indigo-300',
    TEACHER:       'bg-emerald-500/20 text-emerald-300',
    STUDENT:       'bg-amber-500/20 text-amber-300',
    PARENT:        'bg-slate-500/20 text-slate-300',
    LIBRARIAN:     'bg-teal-500/20 text-teal-300',
  };

  const isAdminRoute = pathname.startsWith("/admin");
  const isSuperAdminRoute = pathname.startsWith("/super-admin");
  const isPortalRoute = isAdminRoute || isSuperAdminRoute || pathname.startsWith("/librarian");

  return (
    <html lang="en">
      <body className={`bg-slate-50 text-slate-900 ${!isLoginPage ? "h-screen flex" : ""}`}>
        <SocketProvider>
          {loading ? (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
               <div className="w-2 h-6 bg-indigo-500 rounded-full animate-bounce" />
            </div>
          ) : isLoginPage ? (
            children
          ) : isPortalRoute ? (
            /* Specialized Portals (Admin/Teacher) handle their own sidebars */
            <div className="w-full h-full">
              {children}
            </div>
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
                  
                  {/* Administrative Section */}
                  <NavItem 
                    icon={<GraduationCap size={18} />} 
                    label="Admissions" 
                    href={['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user?.role) ? "/admin/admissions" : "/admissions"} 
                    active={pathname.startsWith("/admissions") || pathname.startsWith("/admin/admissions")} 
                    roles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}
                    currentUserRole={user?.role}
                  />
                  
                  <NavItem 
                    icon={<Users size={18} />} 
                    label="Students" 
                    href={['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user?.role) ? "/admin/students" : user?.role === 'TEACHER' ? "/teacher/students" : "/students"} 
                    active={pathname.startsWith("/students") || pathname.startsWith("/admin/students") || pathname.includes("/teacher/students")} 
                    roles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER']}
                    currentUserRole={user?.role}
                  />

                  {/* Academic Section */}
                  <div className="pt-4 pb-2 px-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3">Academic Hub</p>
                  </div>
                  
                  <NavItem 
                    icon={<BookOpen size={18} />} 
                    label="Subjects & Materials" 
                    href={user?.role === 'TEACHER' ? "/teacher/uploads" : ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user?.role) ? "/admin/academics" : "/academics/materials"} 
                    active={pathname.startsWith("/academics") || pathname.startsWith("/admin/academics") || pathname === "/teacher/uploads"} 
                  />
                  
                  <NavItem 
                    icon={<Calendar size={18} />} 
                    label={user?.role === 'TEACHER' || user?.role === 'STUDENT' ? 'My Timetable' : 'Schedule'} 
                    href={
                      user?.role === 'TEACHER' ? '/teacher/timetable' : 
                      user?.role === 'STUDENT' ? '/student/timetable' :
                      ['COLLEGE_ADMIN', 'SUPER_ADMIN'].includes(user?.role) ? '/admin/timetable' : 
                      '/timetable'
                    } 
                    active={pathname.includes("timetable")} 
                  />
                  
                  <NavItem 
                    icon={<ClipboardCheck size={18} />} 
                    label="Attendance" 
                    href={
                      user?.role === 'STUDENT' ? '/student/attendance' : 
                      ['COLLEGE_ADMIN', 'SUPER_ADMIN'].includes(user?.role) ? '/admin/attendance' : 
                      '/attendance'
                    } 
                    active={pathname.includes("/attendance")} 
                  />
                  
                  <NavItem 
                    icon={<FileText size={18} />} 
                    label="Exams & Results" 
                    href={
                      user?.role === 'STUDENT' ? '/exams/results' : 
                      user?.role === 'TEACHER' ? '/teacher/marks' :
                      ['COLLEGE_ADMIN', 'SUPER_ADMIN'].includes(user?.role) ? '/admin/exams' : 
                      '/exams'
                    } 
                    active={pathname.includes("/exams") || pathname.includes("/marks")} 
                  />
                  
                  {user?.role === 'TEACHER' && (
                    <NavItem 
                      icon={<MessageSquare size={18} />} 
                      label="Communication" 
                      href="/teacher/communication" 
                      active={pathname.includes("/communication")} 
                    />
                  )}
                  
                  {(user?.role === 'STUDENT' || user?.role === 'PARENT') && (
                    <NavItem 
                      icon={<MessageSquare size={18} />} 
                      label="Communication" 
                      href="/communication" 
                      active={pathname.includes("/communication")} 
                    />
                  )}
                  
                  {/* Operations Section */}
                  <div className="pt-4 pb-2 px-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3">Campus Life</p>
                  </div>

                  <NavItem 
                    icon={<CreditCard size={18} />} 
                    label="Finance & Fees" 
                    href={['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(user?.role) ? "/admin/fees" : "/finance"} 
                    active={pathname.startsWith("/finance") || pathname.startsWith("/admin/fees")} 
                    roles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'PARENT', 'STUDENT']}
                    currentUserRole={user?.role}
                  />
                  
                  <NavItem 
                    icon={<Library size={18} />} 
                    label="Digital Library" 
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
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                 {/* Unified Topbar */}
                 <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                       <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                          {pathname === "/" ? "Dashboard" : pathname.split('/').slice(-1)[0].replace('-', ' ')}
                       </h2>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="hidden md:flex flex-col items-end">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                       </div>
                       <div className="h-8 w-px bg-slate-100 mx-2" />
                       <NotificationBell />
                    </div>
                 </header>

                 {/* Viewport Content */}
                 <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
                    {children}
                 </main>
              </div>
            </>
          )}
        </SocketProvider>
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

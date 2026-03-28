"use client";

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  Upload, 
  Users, 
  MessageSquare,
  LogOut,
  Bell,
  Menu,
  ChevronLeft
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/teacher" },
  { icon: <Calendar size={20} />, label: "Timetable", href: "/teacher/timetable" },
  { icon: <ClipboardCheck size={20} />, label: "Attendance", href: "/teacher/attendance" },
  { icon: <FileText size={20} />, label: "Exams & Marks", href: "/teacher/marks" },
  { icon: <Upload size={20} />, label: "Assignments", href: "/teacher/uploads" },
  { icon: <Users size={20} />, label: "Students", href: "/teacher/students" },
  { icon: <MessageSquare size={20} />, label: "Communication", href: "/teacher/communication" },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== 'TEACHER') {
          router.push('/'); // Redirect non-teachers
      }
      setUser(parsedUser);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20 shadow-sm",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900">NgCMS</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Teacher Portal</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <span className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")}>
                  {item.icon}
                </span>
                {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          {isSidebarOpen && user && (
            <div className="flex items-center gap-3 mb-4 p-2 bg-slate-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate uppercase tracking-tighter">Teacher</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-widest">
              {pathname.split('/').slice(-1)[0].replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right mr-4 hidden md:block">
                <p className="text-xs font-semibold text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
             <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          {children}
        </div>
      </main>
    </div>
  );
}

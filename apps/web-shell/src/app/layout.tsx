import React from "react";
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
import Link from "next/link";

export const metadata = {
  title: "NGCMS | Next-Gen College Management System",
  description: "AI-Powered Advanced Institutional ERP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface text-on-surface font-utility h-screen overflow-hidden flex">
        {/* Sidebar */}
        <aside className="w-64 bg-surface-container-low text-on-surface/70 flex flex-col border-r border-outline-variant shadow-sm z-50">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-gradient rounded-lg flex items-center justify-center shadow-lg shadow-primary-indigo/20">
              <span className="font-display font-bold text-white text-lg">N</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-on-surface text-sm tracking-tight">NGCMS</h1>
              <p className="text-[10px] text-on-surface/40 uppercase tracking-widest font-bold">St. Xavier's</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
            {/* Academic Section */}
            <div>
              <p className="px-3 text-[10px] font-bold text-on-surface/20 uppercase tracking-[0.2em] mb-3">Academic</p>
              <div className="space-y-1">
                <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" href="/" active />
                <NavItem icon={<UserPlus size={18} />} label="Admissions" href="/admissions" />
                <NavItem icon={<Users size={18} />} label="Students" href="/students" />
                <NavItem icon={<Calendar size={18} />} label="Timetable" href="/timetable" />
                <NavItem icon={<CheckCircle size={18} />} label="Attendance" href="/attendance" />
                <NavItem icon={<FileText size={18} />} label="Exams" href="/exams" />
                <NavItem icon={<BookOpen size={18} />} label="LMS" href="/lms" />
              </div>
            </div>

            {/* Operations Section */}
            <div>
              <p className="px-3 text-[10px] font-bold text-on-surface/20 uppercase tracking-[0.2em] mb-3">Operations</p>
              <div className="space-y-1">
                <NavItem icon={<CreditCard size={18} />} label="Fees & Finance" href="/finance" />
                <NavItem icon={<Library size={18} />} label="Library" href="/library" />
                <NavItem icon={<Home size={18} />} label="Hostel" href="/hostel" />
                <NavItem icon={<Briefcase size={18} />} label="Placement" href="/placement" />
              </div>
            </div>

            {/* Intelligence Section */}
            <div>
              <p className="px-3 text-[10px] font-bold text-on-surface/20 uppercase tracking-[0.2em] mb-3">Intelligence</p>
              <div className="space-y-1">
                <NavItem icon={<BarChart3 size={18} />} label="Analytics" href="/analytics" />
                <NavItem icon={<Sparkles size={18} />} label="AI Assistant" href="/ai-assistant" />
                <NavItem icon={<FileCheck size={18} />} label="NAAC Reports" href="/naac" />
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-outline-variant space-y-1">
            <NavItem icon={<Settings size={18} />} label="Settings" href="/settings" />
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-black/5 transition-all text-red-500/70 hover:text-red-500">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
            <div className="mt-4 flex items-center gap-3 px-3 py-3 bg-white border border-outline-variant rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container-low overflow-hidden border border-outline-variant" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">Dr. Rajesh Khanna</p>
                <p className="text-[10px] text-on-surface/40">Principal</p>
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
              <button className="p-2.5 bg-surface-container-low hover:bg-white rounded-xl text-on-surface/60 hover:text-primary-indigo border border-transparent hover:border-outline-variant transition-all relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-indigo rounded-full border-2 border-surface-container-lowest" />
              </button>
              <div className="h-8 w-[1px] bg-outline-variant mx-1" />
              <button className="p-2 bg-white text-black border-2 border-primary-indigo rounded-xl shadow-ambient hover:bg-surface-container-low transition-all flex items-center gap-2 px-4 active:scale-95">
                <Sparkles size={16} className="text-primary-indigo" />
                <span className="text-xs font-bold">Ask AI</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {children}
          </main>
        </div>
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
      <span className={`${active ? "text-primary-indigo" : "text-on-surface/30 group-hover:text-on-surface/60"} transition-colors`}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

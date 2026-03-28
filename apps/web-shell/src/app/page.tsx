"use client";

import React from "react";
import Card from "@/components/ui/Card";
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function DashboardPage() {
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setRole(user.role || "COLLEGE_ADMIN");
  }, []);

  if (!role) return null;

  switch (role) {
    case "SUPER_ADMIN":
      return <SuperAdminDashboard />;
    case "TEACHER":
      return <TeacherDashboard />;
    case "STUDENT":
      return <StudentDashboard />;
    case "PARENT":
      return <ParentDashboard />;
    case "COLLEGE_ADMIN":
    default:
      return <AdminDashboard />;
  }
}

function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Enrollment" 
          value="2,847" 
          trend="+12%" 
          trendUp={true} 
          subtitle="vs last year" 
          icon={<Users size={20} />} 
          color="bg-indigo-100 text-indigo-600"
        />
        <KPICard 
          title="Today's Attendance" 
          value="78.4%" 
          trend="-2.1%" 
          trendUp={false} 
          subtitle="Stable" 
          icon={<Clock size={20} />} 
          color="bg-emerald-100 text-emerald-600"
        />
        <KPICard 
          title="Fee Collection" 
          value="₹ 1.24 Cr" 
          trend="+5.4%" 
          trendUp={true} 
          subtitle="Target 1.5 Cr" 
          icon={<CreditCard size={20} />} 
          color="bg-purple-100 text-purple-600"
        />
        <KPICard 
          title="At-Risk Students" 
          value="47" 
          trend="+3" 
          trendUp={false} 
          subtitle="Managed by AI" 
          icon={<AlertCircle size={20} />} 
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Early Warning Panel */}
        <Card className="lg:col-span-2 p-8 border border-slate-100 bg-white shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Early Warning System</h2>
              <p className="text-sm text-slate-500 mt-1">Students flagged for immediate intervention</p>
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 transition-colors">
              View All 47 <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            <RiskRow name="Aravind Swami" id="STU-2024-089" risk="CRITICAL" score={92} factors={["Low Attendance", "Missed Lab"]} />
            <RiskRow name="Megha Raj" id="STU-2024-112" risk="HIGH" score={84} factors={["Fee Overdue", "Login Inactivity"]} />
            <RiskRow name="Rahul Verma" id="STU-2024-045" risk="HIGH" score={79} factors={["Grade Drop", "Late Submission"]} />
          </div>
        </Card>

        {/* System Activity Panel */}
        <Card className="p-8 border border-slate-100 bg-white text-slate-900 overflow-hidden relative group shadow-sm rounded-3xl">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-all duration-700" />
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100">
              <Sparkles className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Ask Anything</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Interact with your institutional data using natural language.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 italic">
              "Which departments have attendance below 70% this week?"
            </div>
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 leading-none px-4">
              Start Conversation
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, trendUp, subtitle, icon, color }: any) {
  return (
    <Card className="p-6 border border-slate-100 bg-white shadow-sm rounded-3xl group hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center transition-all group-hover:scale-110`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          {trend}
        </div>
      </div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className="text-[11px] text-slate-400 font-medium tracking-wide">{subtitle}</span>
      </div>
    </Card>
  );
}

function ParentDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Parent Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Monitoring Academic Lifecycle of Harsh Kumar</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
          Fees Up to Date
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Attendance" value="88.4%" trend="+2%" trendUp={true} subtitle="Good Standing" icon={<Clock size={20} />} color="bg-indigo-100 text-indigo-600" />
        <KPICard title="Avg Performance" value="76%" trend="-3%" trendUp={false} subtitle="Above Average" icon={<TrendingUp size={20} />} color="bg-amber-100 text-amber-600" />
        <KPICard title="Next Exam" value="Maths" trend="12 Apr" trendUp={true} subtitle="Preparation 60%" icon={<Sparkles size={20} />} color="bg-purple-100 text-purple-600" />
      </div>
    </div>
  );
}

function TeacherDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
       <Sparkles size={48} className="mb-4 text-indigo-200" />
       <h2 className="text-xl font-bold text-slate-800">Teacher Dashboard</h2>
       <p className="text-sm">Class management & attendance tools ready for initialization.</p>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 text-center">
       <Users size={48} className="mb-4 text-indigo-200" />
       <h2 className="text-xl font-bold text-slate-800">Student Dashboard</h2>
       <p className="text-sm mt-2">Welcome back, Student! Your personalized timetable and results will appear here.</p>
    </div>
  );
}

function SuperAdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 text-center">
       <ShieldCheck size={48} className="mb-4 text-indigo-200" />
       <h2 className="text-xl font-bold text-slate-800">Platform Governance</h2>
       <p className="text-sm mt-2">Global institutional monitoring active. Multi-tenant controls enabled.</p>
    </div>
  );
}

function RiskRow({ name, id, risk, score, factors }: any) {
  const isCritical = risk === "CRITICAL";
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase transition-all ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
        {name.split(' ').map((n: string) => n[0]).join('')}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{name}</h4>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5">{id}</p>
      </div>
      <div className="hidden md:flex flex-wrap gap-2 flex-1">
        {factors.map((f: string) => (
          <span key={f} className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200 whitespace-nowrap">{f}</span>
        ))}
      </div>
      <div className="text-right">
        <div className={`text-[10px] font-bold uppercase ${isCritical ? 'text-rose-500' : 'text-amber-500'}`}>{risk}</div>
        <div className="text-lg font-bold text-slate-900">{score}%</div>
      </div>
    </div>
  );
}

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
  ShieldCheck
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
          color="bg-black"
        />
        <KPICard 
          title="Today's Attendance" 
          value="78.4%" 
          trend="-2.1%" 
          trendUp={false} 
          subtitle="Stable" 
          icon={<Clock size={20} />} 
          color="bg-black/80"
        />
        <KPICard 
          title="Fee Collection" 
          value="₹ 1.24 Cr" 
          trend="+5.4%" 
          trendUp={true} 
          subtitle="Target 1.5 Cr" 
          icon={<CreditCard size={20} />} 
          color="bg-black/60"
        />
        <KPICard 
          title="At-Risk Students" 
          value="47" 
          trend="+3" 
          trendUp={false} 
          subtitle="Managed by AI" 
          icon={<AlertCircle size={20} />} 
          color="bg-black/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Early Warning Panel */}
        <Card className="lg:col-span-2 p-8 border-none bg-surface-container-low/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-display font-bold text-on-surface">AI Early Warning System</h2>
              <p className="text-sm text-on-surface/40 mt-1">Students flagged for immediate intervention</p>
            </div>
            <button className="text-xs font-bold text-primary-indigo hover:underline flex items-center gap-1">
              View All 47 <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            <RiskRow name="Aravind Swami" id="STU-2024-089" risk="CRITICAL" score={92} factors={["Low Attendance", "Missed Lab"]} />
            <RiskRow name="Megha Raj" id="STU-2024-112" risk="HIGH" score={84} factors={["Fee Overdue", "Login Inactivity"]} />
            <RiskRow name="Rahul Verma" id="STU-2024-045" risk="HIGH" score={79} factors={["Grade Drop", "Late Submission"]} />
          </div>
        </Card>

        {/* System Activity Panel - Fixed Visibility */}
        <Card className="p-8 border-none bg-surface-container-low text-on-surface overflow-hidden relative group">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-primary-indigo/5 rounded-full blur-3xl group-hover:bg-primary-indigo/10 transition-all duration-700" />
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-outline-variant">
              <Sparkles className="text-primary-indigo" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-on-surface">Ask Anything</h3>
              <p className="text-sm text-on-surface/60 mt-1 leading-relaxed">
                Interact with your institutional data using natural language.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-outline-variant text-xs text-on-surface/40 italic">
              "Which departments have attendance below 70% this week?"
            </div>
            <button className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm shadow-sm hover:bg-black/90 transition-all active:scale-95 leading-none px-4">
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
    <Card className="p-6 border-none bg-surface-container-lowest group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center shadow-lg shadow-black/5 group-hover:rotate-6 transition-all`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold text-black bg-black/5 px-2 py-0.5 rounded-full`}>
          {trendUp ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
          {trend}
        </div>
      </div>
      <h3 className="text-xs font-bold text-on-surface/40 uppercase tracking-widest mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-display font-bold text-on-surface">{value}</span>
        <span className="text-[10px] text-on-surface/20 font-medium lowercase tracking-wide">{subtitle}</span>
      </div>
    </Card>
  );
}

function ParentDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-black text-on-surface tracking-tight">Parent Portal</h1>
          <p className="text-sm text-on-surface/40 mt-1">Monitoring Academic Lifecycle of Harsh Kumar</p>
        </div>
        <div className="px-4 py-2 bg-black/5 text-black rounded-full text-xs font-bold border border-black/10">
          Fees Up to Date
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Attendance" value="88.4%" trend="+2%" trendUp={true} subtitle="Good Standing" icon={<Clock size={20} />} color="bg-black" />
        <KPICard title="Avg Performance" value="76%" trend="-3%" trendUp={false} subtitle="Above Average" icon={<TrendingUp size={20} />} color="bg-black/60" />
        <KPICard title="Next Exam" value="Maths" trend="12 Apr" trendUp={true} subtitle="Preparation 60%" icon={<Sparkles size={20} />} color="bg-black/40" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 border-none bg-white shadow-ambient">
           <h3 className="font-bold text-lg mb-4">Upcoming Schedule</h3>
           <div className="space-y-4">
              <ScheduleItem subject="Computer Networks" time="09:00 AM" teacher="Dr. Gupta" />
              <ScheduleItem subject="Database Lab" time="11:30 AM" teacher="Prof. Sharma" />
           </div>
        </Card>
        <Card className="p-8 border-none bg-primary-indigo text-white shadow-ambient overflow-hidden relative">
           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
           <h3 className="font-bold text-lg mb-2">Academic Wellness</h3>
           <p className="text-sm text-white/70 mb-6">AI Insight: Child is showing high interest in Backend Labs.</p>
           <button className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm">View Detailed Report</button>
        </Card>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface/40">
       <Sparkles size={48} className="mb-4 opacity-20" />
       <h2 className="text-xl font-bold">Teacher Dashboard</h2>
       <p className="text-sm">Class management & attendance tools ready for initialization.</p>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface/40 text-center">
       <Users size={48} className="mb-4 opacity-20" />
       <h2 className="text-xl font-bold">Student Dashboard</h2>
       <p className="text-sm mt-2">Welcome back, Student! Your personalized timetable and results will appear here.</p>
    </div>
  );
}

function SuperAdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface/40 text-center">
       <ShieldCheck size={48} className="mb-4 opacity-20" />
       <h2 className="text-xl font-bold">Platform Governance</h2>
       <p className="text-sm mt-2">Global institutional monitoring active. Multi-tenant controls enabled.</p>
    </div>
  );
}

function ScheduleItem({ subject, time, teacher }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
       <div>
         <p className="text-sm font-bold">{subject}</p>
         <p className="text-[10px] text-on-surface/40">{teacher}</p>
       </div>
       <div className="text-right">
         <p className="text-xs font-bold text-black">{time}</p>
       </div>
    </div>
  );
}


function RiskRow({ name, id, risk, score, factors }: any) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/20 hover:bg-white/60 transition-all group">
      <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-on-surface/40 font-bold text-xs uppercase group-hover:bg-primary-indigo group-hover:text-white transition-all">
        {name.split(' ').map((n: string) => n[0]).join('')}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-on-surface">{name}</h4>
        <p className="text-[10px] text-on-surface/30 truncate uppercase tracking-tighter font-bold">{id}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {factors.map((f: string) => (
          <span key={f} className="text-[10px] font-bold text-on-surface/40 bg-white/50 px-2 py-0.5 rounded-full border border-black/5 whitespace-nowrap">{f}</span>
        ))}
      </div>
      <div className="text-right">
        <div className={`text-[10px] font-bold text-black/40 uppercase`}>{risk}</div>
        <div className="text-lg font-display font-bold text-black">{score}%</div>
      </div>
    </div>
  );
}

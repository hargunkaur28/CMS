import React from "react";
import Card from "@/components/ui/Card";
import { 
  Users, 
  CheckCircle, 
  CreditCard, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Bell,
  Sparkles,
  ChevronLeft
} from "lucide-react";

const KPICard = ({ 
  title, 
  value, 
  trend, 
  isUp, 
  subtitle, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string; 
  trend: string; 
  isUp: boolean; 
  subtitle: string; 
  icon: any; 
  color: string;
}) => (
  <Card className="p-5 flex flex-col h-full">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
        {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {trend}
      </div>
    </div>
    <h3 className="text-white/40 text-[10px] font-utility uppercase tracking-wider mb-1">{title}</h3>
    <div className="flex items-baseline gap-2 mb-1">
      <span className="text-2xl font-display font-bold text-on-surface">{value}</span>
    </div>
    <p className="text-[10px] text-white/40 font-utility">{subtitle}</p>
    
    {/* Decorative Sparkline Placeholder */}
    <div className="mt-4 h-8 w-full bg-surface-container rounded opacity-30 overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${color}/20 to-transparent animate-pulse`} />
    </div>
  </Card>
);

export default function PrincipalDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-on-surface mb-1">Principal Dashboard</h1>
          <div className="flex items-center gap-4 text-xs font-utility">
            <button className="text-primary-indigo font-medium border-b-2 border-primary-indigo pb-1">Dashboard</button>
            <button className="text-white/40 hover:text-on-surface transition-colors pb-1">Analytics</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-white/40 hover:text-on-surface transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-surface" />
          </button>
          <button className="p-2 text-white/40 hover:text-on-surface transition-colors">
            <Sparkles size={20} />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right">
              <p className="text-sm font-utility font-bold text-on-surface">Dr. Sarah Jenkins</p>
              <p className="text-[10px] text-white/40 font-utility uppercase tracking-wider">Executive Principal</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container border border-white/10 overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Total Enrollment" 
          value="2,847" 
          trend="12%" 
          isUp={true} 
          subtitle="vs last year" 
          icon={Users}
          color="primary-indigo"
        />
        <KPICard 
          title="Daily Attendance" 
          value="78.4%" 
          trend="2.1%" 
          isUp={false} 
          subtitle="On Target" 
          icon={CheckCircle}
          color="emerald-500"
        />
        <KPICard 
          title="Fee Collection" 
          value="₹1.24 Cr" 
          trend="88%" 
          isUp={true} 
          subtitle="of target" 
          icon={CreditCard}
          color="amber-500"
        />
        <KPICard 
          title="Students At-Risk" 
          value="47" 
          trend="12 new" 
          isUp={false} 
          subtitle="Requires attention" 
          icon={AlertTriangle}
          color="rose-500"
        />
      </div>

      {/* Row 2: Pipeline and Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-lg font-display font-semibold text-on-surface">Enrollment Pipeline</h2>
              <p className="text-xs text-secondary-container font-utility">Academic Year 2024-25</p>
            </div>
            <button className="text-xs font-utility text-primary-indigo font-medium hover:underline px-3 py-1 bg-primary-indigo/5 rounded-full">
              View detailed report
            </button>
          </div>
          
          <div className="space-y-8">
            {[
              { label: "Inquiry", count: "1,240", percent: 100, color: "bg-primary-indigo" },
              { label: "Application", count: "892", percent: 69, color: "bg-indigo-400" },
              { label: "Admission Offered", count: "412", percent: 33, color: "bg-indigo-300" },
              { label: "Enrolled", count: "247", percent: 20, color: "bg-indigo-200" },
            ].map((stage) => (
              <div key={stage.label} className="relative">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-utility font-medium text-white/40">{stage.label} ({stage.count})</span>
                  <span className="text-xs font-utility font-bold text-on-surface">{stage.percent}%</span>
                </div>
                <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stage.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-display font-semibold text-on-surface">Attendance Heatmap</h2>
            <p className="text-xs text-secondary-container font-utility">Department-wise weekly distribution</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-utility">
              <thead>
                <tr className="text-white/30 lowercase tracking-widest">
                  <th className="font-normal text-left pb-4 pr-2 uppercase">Dept</th>
                  <th className="font-normal pb-4 uppercase">M</th>
                  <th className="font-normal pb-4 uppercase">T</th>
                  <th className="font-normal pb-4 uppercase">W</th>
                  <th className="font-normal pb-4 uppercase">T</th>
                  <th className="font-normal pb-4 uppercase">F</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {[
                  { name: "Science", values: [85, 92, 88, 90, 84] },
                  { name: "Comm.", values: [78, 45, 72, 85, 82] },
                  { name: "Human.", values: [92, 95, 90, 88, 42] },
                  { name: "Arts", values: [65, 68, 80, 62, 75] },
                ].map((dept) => (
                  <tr key={dept.name} className="h-10">
                    <td className="pr-4 text-white/60 font-medium">{dept.name}</td>
                    {dept.values.map((v, i) => (
                      <td key={i} className="px-1 text-center">
                        <div 
                          className={`w-full h-8 rounded-sm ${
                            v > 85 ? "bg-emerald-500" : 
                            v > 75 ? "bg-emerald-400" : 
                            v > 65 ? "bg-emerald-300" : 
                            v > 50 ? "bg-emerald-200" : "bg-rose-50/50"
                          } transition-all hover:scale-105 cursor-help`}
                          title={`${v}% attendance`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-tighter text-white/40">
            <span>Low</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-rose-50/50" />
              <div className="w-3 h-3 rounded-sm bg-emerald-200" />
              <div className="w-3 h-3 rounded-sm bg-emerald-300" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            </div>
            <span>High</span>
          </div>
        </Card>
      </div>

      {/* Row 3: EWS AI System */}
      <Card className="p-0 border-t-0 border-l-[3px] border-amber-500 bg-amber-50/10">
        <div className="p-6">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-on-surface">AI Student Early Warning System</h2>
                <p className="text-xs text-secondary-container font-utility">Predictive risk analysis based on 50+ campus data signals</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">Critical Priority</span>
              <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">High Risk</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-utility">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-white/30 text-left border-b border-white/5">
                  <th className="pb-4 font-normal">Student Identity</th>
                  <th className="pb-4 font-normal text-center">Risk Score</th>
                  <th className="pb-4 font-normal">Primary Risk Factor</th>
                  <th className="pb-4 font-normal">Trend</th>
                  <th className="pb-4 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { 
                    id: "AR", 
                    name: "Aryan Raj", 
                    class: "Class 11-C • Science", 
                    score: 90, 
                    factor: "Abrupt attendance drop (15 days)", 
                    trend: "CRITICAL", 
                    action: "Schedule Counselor",
                    color: "rose"
                  },
                  { 
                    id: "SM", 
                    name: "Sana Mirza", 
                    class: "Class 9-A • Humanities", 
                    score: 75, 
                    factor: "Declining math scores (-22% MoM)", 
                    trend: "HIGH", 
                    action: "Assign Tutor",
                    color: "amber"
                  },
                ].map((student) => (
                  <tr key={student.name} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-${student.color}-500/10 text-${student.color}-600 flex items-center justify-center font-bold text-xs`}>
                          {student.id}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{student.name}</p>
                          <p className="text-[10px] text-white/40">{student.class}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                            <circle 
                              cx="20" 
                              cy="20" 
                              r="18" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              strokeDasharray={`${2 * Math.PI * 18}`}
                              strokeDashoffset={`${2 * Math.PI * 18 * (1 - student.score/100)}`}
                              className={student.score > 80 ? "text-rose-500" : "text-amber-500"}
                            />
                          </svg>
                          <span className="absolute text-[10px] font-bold text-on-surface">{student.score}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-on-surface/80">{student.factor}</span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        student.trend === "CRITICAL" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {student.trend}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-xs font-bold text-primary-indigo hover:text-indigo-400 transition-colors">
                        {student.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-center">
             <button className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-primary-indigo transition-colors flex items-center gap-2">
               View all flagged students <ChevronLeft size={12} className="rotate-180" />
             </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

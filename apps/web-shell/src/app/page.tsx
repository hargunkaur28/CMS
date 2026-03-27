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
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
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
          color="bg-primary-indigo"
        />
        <KPICard 
          title="Today's Attendance" 
          value="78.4%" 
          trend="-2.1%" 
          trendUp={false} 
          subtitle="Stable" 
          icon={<Clock size={20} />} 
          color="bg-emerald-500"
        />
        <KPICard 
          title="Fee Collection" 
          value="₹ 1.24 Cr" 
          trend="+5.4%" 
          trendUp={true} 
          subtitle="Target 1.5 Cr" 
          icon={<CreditCard size={20} />} 
          color="bg-amber-500"
        />
        <KPICard 
          title="At-Risk Students" 
          value="47" 
          trend="+3" 
          trendUp={false} 
          subtitle="Managed by AI" 
          icon={<AlertCircle size={20} />} 
          color="bg-red-500"
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
            <button className="w-full py-3 bg-white text-black border-2 border-primary-indigo rounded-xl font-bold text-sm shadow-ambient hover:bg-surface-container-low transition-all active:scale-95 leading-none px-4">
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
        <div className={`flex items-center gap-1 text-[10px] font-bold ${trendUp ? "text-emerald-500" : "text-red-500"} bg-white/50 px-2 py-0.5 rounded-full`}>
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
        <div className={`text-[10px] font-bold ${risk === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>{risk}</div>
        <div className="text-lg font-display font-bold text-on-surface">{score}%</div>
      </div>
    </div>
  );
}

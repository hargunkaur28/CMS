"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
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
  ChevronRight,
  Book,
  School,
  GraduationCap as GradIcon,
  CalendarDays,
  Baby,
  Calendar,
  Download,
  Award,
  ClipboardCheck,
  Bell,
  Megaphone
} from "lucide-react";
import { fetchMyProfile, fetchMyAttendance, fetchMyResults, fetchMyTodaySchedule } from "@/lib/api/student";
import { fetchMyAnnouncements, fetchUnreadCount } from "@/lib/api/communication";
import { fetchMyStudentProfile, fetchMyStudentAttendance, fetchMyStudentResults, fetchMyStudentTimetable, fetchMyStudentFees } from "@/lib/api/parent";
import { useSocket } from "@/components/providers/SocketProvider";
import { fetchTodayTimetable as fetchTeacherTimetable, fetchTeacherDashboardStats } from "@/lib/api/teacher";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [role, setRole] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role;
    setRole(userRole);
    
    // Strategic Redirection to Specialized Portals
    if (userRole === "COLLEGE_ADMIN" || userRole === "SUPER_ADMIN") {
      router.push("/admin");
    } else if (userRole === "TEACHER") {
      router.push("/teacher");
    }
  }, [router]);

  // Loading or Redirecting State
  if (!role || role === "COLLEGE_ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
       <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  switch (role) {
    case "TEACHER":
      return <TeacherDashboard />;
    case "STUDENT":
      return <StudentDashboard />;
    case "PARENT":
      return <ParentDashboard />;
    default:
      return null;
  }
}

function AdminDashboard() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Strategic KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Enrollment" value="2,847" trend="+12%" trendUp={true} subtitle="vs last year" icon={<Users size={20} />} color="bg-indigo-50 text-indigo-600 border-indigo-100" />
        <KPICard title="Attendance" value="78.4%" trend="-2.1%" trendUp={false} subtitle="Stable" icon={<Clock size={20} />} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
        <KPICard title="Strategic Revenue" value="₹ 1.24 Cr" trend="+5.4%" trendUp={true} subtitle="Target 1.5 Cr" icon={<CreditCard size={20} />} color="bg-purple-50 text-purple-600 border-purple-100" />
        <KPICard title="At-Risk Alerts" value="47" trend="+3" trendUp={false} subtitle="AI Flagged" icon={<AlertCircle size={20} />} color="bg-amber-50 text-amber-600 border-amber-100" />
      </div>

      {/* Primary Operations Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Assignments Portal (The Missing Link) */}
        <Link 
          href="/admin/assignments"
          className="group relative bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 cursor-pointer hover:scale-[1.02] transition-all overflow-hidden border border-slate-800"
        >
           <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
                 <ArrowUpRight className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase leading-none mb-4">Academic Assignments</h2>
              <p className="text-xs font-medium text-slate-400 max-w-[15rem] mb-8 leading-relaxed">
                 Configure teacher subject-batch mappings and student academic flows.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                 System Control <ChevronRight size={12} />
              </div>
           </div>
        </Link>

        {/* AI Early Warning Panel (Condensed) */}
        <Card className="md:col-span-2 p-8 border border-slate-100 bg-white shadow-sm rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">AI Early Warning</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intervention required</p>
            </div>
            <Link href="/students" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
              <ChevronRight size={20} />
            </Link>
          </div>
          <div className="space-y-4">
            <RiskRow name="Aravind Swami" id="STU-2024-089" risk="CRITICAL" score={92} factors={["Low Attendance"]} />
            <RiskRow name="Megha Raj" id="STU-2024-112" risk="HIGH" score={84} factors={["Grade Drop"]} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* System Health Card */}
         <Card className="p-8 border border-slate-100 bg-white shadow-sm rounded-[2.5rem] flex items-center gap-8">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shrink-0 border border-indigo-100">
               <ShieldCheck size={32} />
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 font-display">Governance Active</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                  Institutional protocols enforced across all 4 student portals.
               </p>
            </div>
         </Card>

         <Card className="p-8 border border-slate-100 bg-white shadow-sm rounded-[2.5rem] flex items-center gap-8">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shrink-0 border border-emerald-100">
               <Sparkles size={32} />
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 font-display">AI Insights Hub</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                  Predictive analytics suggests +4% attendance growth next month.
               </p>
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
  const { socket } = useSocket();
  const [parentData, setParentData] = React.useState<any>(null);
  const [children, setChildren] = React.useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = React.useState(0);
  const [childSchedule, setChildSchedule] = React.useState<any[]>([]);
  const [fees, setFees] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, attendanceRes, resultsRes, timetableRes, feesRes] = await Promise.all([
          fetchMyStudentProfile(),
          fetchMyStudentAttendance(),
          fetchMyStudentResults(),
          fetchMyStudentTimetable(),
          fetchMyStudentFees()
        ]);
        if (profileRes.success) setParentData(profileRes.data);
        if (profileRes.success) {
          const student = profileRes.data;
          // Store child profile for Socket joining
          localStorage.setItem("children_profiles", JSON.stringify([{
            _id: student._id,
            batchId: student.academicInfo?.batchId || student.batchId 
          }]));
          
          setChildren([{ 
            student: student, 
            attendance: attendanceRes.data.records, 
            results: resultsRes.data.results,
            stats: { 
              attendancePct: attendanceRes.data.percentage,
              cgpa: resultsRes.data.overallCgpa 
            }
          }]);
        }
        if (timetableRes.success) {
           // Get today's slots from the grouped weekly timetable
           const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
           const today = days[new Date().getDay()];
           setChildSchedule(timetableRes.data[today] || []);
        }
        if (feesRes.success) setFees(feesRes.data);

      } catch (err) {
        console.error("Failed to load parent dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    if (socket) {
      socket.on("attendanceUpdated", loadData);
      socket.on("resultsPublished", loadData);
      return () => {
        socket.off("attendanceUpdated", loadData);
        socket.off("resultsPublished", loadData);
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Clock className="animate-spin text-indigo-400" size={48} />
      </div>
    );
  }

  const currentChild = children[selectedChildIndex];
  const attendance = currentChild?.attendance || [];
  const results = currentChild?.results || [];

  const attPct = currentChild?.stats?.attendancePct || 0;
  const childCgpa = currentChild?.stats?.cgpa || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Parent Portal — {parentData?.personalInfo?.firstName} {parentData?.personalInfo?.lastName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring the academic journey of your children
          </p>
        </div>
        
        {children.length > 1 && (
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {children.map((child, idx) => (
              <button
                key={child.student._id}
                onClick={() => setSelectedChildIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedChildIndex === idx 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {child.student.personalInfo.firstName}
              </button>
            ))}
          </div>
        )}
      </div>

      {currentChild ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard 
              title="Attendance" 
              value={`${attPct}%`} 
              trend={attPct > 75 ? "Consistent" : "Low"} 
              trendUp={attPct > 75} 
              subtitle="Current Semester" 
              icon={<Clock size={20} />} 
              color="bg-indigo-50 text-indigo-600 border border-indigo-100" 
            />
            <KPICard 
              title="Avg Performance" 
              value={`${childCgpa}`} 
              trend={childCgpa > 7 ? "+0.4" : "-0.2"} 
              trendUp={childCgpa > 7} 
              subtitle="Current CGPA" 
              icon={<TrendingUp size={20} />} 
              color="bg-emerald-50 text-emerald-600 border border-emerald-100" 
            />
            <KPICard 
              title="Academic Status" 
              value="Active" 
              trend="Good Standing" 
              trendUp={true} 
              subtitle={currentChild.student.academicInfo.course} 
              icon={<GradIcon size={20} />} 
              color="bg-amber-50 text-amber-600 border border-amber-100" 
            />
            <KPICard 
              title="Financial Status" 
              value={`₹${fees?.summary?.balance || 0}`} 
              trend={fees?.summary?.balance <= 0 ? "All Clear" : "Pending"} 
              trendUp={fees?.summary?.balance <= 0} 
              subtitle="Pending Dues" 
              icon={<CreditCard size={20} />} 
              color={fees?.summary?.balance <= 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"} 
            />
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 border border-slate-100 bg-white shadow-ambient rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Recent Attendance</h3>
                <Link href="/attendance" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View Full Report <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="space-y-4">
                {attendance.length > 0 ? attendance.map((record: any, i: number) => {
                   return (
                     <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                           <Calendar size={14} />
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-900">{record.subject?.name || "Unspecified Class"}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(record.date).toLocaleDateString()}</p>
                         </div>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         record.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                       }`}>
                         {record.status || "N/A"}
                       </span>
                     </div>
                   );
                }) : (
                  <p className="text-center py-8 text-slate-400 italic">No recent records found.</p>
                )}
              </div>
            </Card>

            <Card className="p-8 border border-slate-100 bg-white shadow-ambient rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Latest Results</h3>
                <Link href="/exams/results" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Transcripts <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="space-y-6">
                {results.length > 0 ? results.map((result: any, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xs uppercase border border-indigo-100">
                      {result.status}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{result.examId?.name}</p>
                      <p className="text-xs text-slate-400 font-medium">Percentage: {result.percentage.toFixed(1)}% | CGPA: {result.cgpa.toFixed(2)}</p>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <Award size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-sm text-slate-400">No examination results published yet.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card className="p-24 text-center bg-white border border-dashed border-slate-200 rounded-[2rem]">
           <Baby size={48} className="mx-auto text-slate-200 mb-4" />
           <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">No Children Linked</p>
           <p className="text-sm text-slate-400 mt-2">Please contact the college administration to link your child's profile.</p>
        </Card>
      )}
    </div>
  );
}


function TeacherDashboard() {
  const [stats, setStats] = React.useState<any>(null);
  const [timetable, setTimetable] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, timetableRes] = await Promise.all([
          fetchTeacherDashboardStats(),
          fetchTeacherTimetable()
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (timetableRes.success) setTimetable(timetableRes.data);
      } catch (err) {
        console.error("Failed to load teacher dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="h-[60vh] flex items-center justify-center"><Clock className="animate-spin text-indigo-400" size={48} /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Orchestration</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">LMS Management & Performance Monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 text-xs font-bold uppercase tracking-widest">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Direct Reach" 
          value={`${stats?.totalUniqueStudents || 0}`} 
          trend="Unique Students" 
          trendUp={true} 
          subtitle="Across all batches" 
          icon={<Users size={20} />} 
          color="bg-indigo-50 text-indigo-600 border border-indigo-100" 
        />
        <KPICard 
          title="Assigned Batches" 
          value={`${stats?.assignedBatches || 0}`} 
          trend="Active Clusters" 
          trendUp={true} 
          subtitle="Strategic Units" 
          icon={<School size={20} />} 
          color="bg-emerald-50 text-emerald-600 border border-emerald-100" 
        />
        <KPICard 
          title="Sessions Today" 
          value={`${stats?.todaySessionsMarked || 0}`} 
          trend="Marked Logs" 
          trendUp={stats?.todaySessionsMarked > 0} 
          subtitle="Attendance Sync" 
          icon={<ClipboardCheck size={20} />} 
          color="bg-amber-50 text-amber-600 border border-amber-100" 
        />
        <KPICard 
          title="Course Modules" 
          value={`${stats?.assignedSubjects || 0}`} 
          trend="Total Subjects" 
          trendUp={true} 
          subtitle="Curriculum Load" 
          icon={<Book size={20} />} 
          color="bg-purple-50 text-purple-600 border border-purple-100" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border border-slate-100 bg-white shadow-ambient rounded-[2.5rem]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Academic Mapping</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Grouped by assigned batch</p>
            </div>
            <Link href="/attendance" className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">Mark Attendance</Link>
          </div>
          
          <div className="space-y-6">
            {stats?.assignments?.length > 0 ? (() => {
               // Grouping logic
               const groups: Record<string, any[]> = {};
               stats.assignments.forEach((a: any) => {
                 const bName = a.batch?.name || 'Unknown Batch';
                 if (!groups[bName]) groups[bName] = [];
                 groups[bName].push(a.subject?.name);
               });

               return Object.entries(groups).map(([batchName, subjects], idx) => (
                 <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-indigo-600 group hover:bg-white hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{batchName}</h4>
                       <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-widest">{subjects.length} Subjects</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {subjects.map((sub, sIdx) => (
                         <span key={sIdx} className="text-[10px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                           {sub}
                         </span>
                       ))}
                    </div>
                 </div>
               ));
            })() : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                 <Book size={48} className="text-slate-100 mb-4" />
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Active Assignments</p>
                 <p className="text-xs text-slate-500 mt-2">Contact administrator to link your faculty profile to subjects.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-8 border border-slate-100 bg-white shadow-ambient rounded-[2.5rem]">
          <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight font-display">Timebound Schedule</h2>
          <div className="space-y-6">
            {timetable.length > 0 ? timetable.map((slot, i) => (
               <EventRow key={i} month="TOD" day={slot.startTime} title={slot.subjectId?.name || "Class"} sub={slot.batchId?.name || "Batch"} color="bg-indigo-50 text-indigo-600" />
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <Clock size={32} className="text-slate-200 mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Sessions Logged Today</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { socket } = useSocket();
  const [profile, setProfile] = React.useState<any>(null);
  const [attendanceData, setAttendanceData] = React.useState<any>(null);
  const [resultsData, setResultsData] = React.useState<any>(null);
  const [schedule, setSchedule] = React.useState<any[]>([]);
  const [announcements, setAnnouncements] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      const [profileRes, attendanceRes, resultsRes, scheduleRes, annRes, unreadRes] = await Promise.all([
        fetchMyProfile(),
        fetchMyAttendance(),
        fetchMyResults(),
        fetchMyTodaySchedule(),
        fetchMyAnnouncements(),
        fetchUnreadCount()
      ]);
      if (profileRes.success) {
        setProfile(profileRes.data);
        localStorage.setItem("student_profile", JSON.stringify({
          _id: profileRes.data._id,
          batchId: profileRes.data.academicInfo?.batchId || profileRes.data.batchId
        }));
      }
      if (attendanceRes.success) setAttendanceData(attendanceRes.data);
      if (resultsRes.success) setResultsData(resultsRes.data);
      if (scheduleRes.success) setSchedule(scheduleRes.data);
      if (annRes.success) setAnnouncements(annRes.data);
      if (unreadRes.success) setUnreadCount(unreadRes.data.count);

    } catch (err) {
      console.error("Failed to load student dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();

    if (socket) {
      socket.on("attendanceUpdated", loadData);
      socket.on("resultsPublished", loadData);
      socket.on("newMessage", loadData);
      return () => {
        socket.off("attendanceUpdated", loadData);
        socket.off("resultsPublished", loadData);
        socket.off("newMessage", loadData);
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Clock className="animate-spin text-indigo-400" size={48} />
      </div>
    );
  }

  const attendancePct = attendanceData?.percentage || attendanceData?.data?.percentage || 0;
  const subjectWise = attendanceData?.subjectWise || attendanceData?.data?.subjectWise || [];
  const cgpa = resultsData?.overallCgpa || resultsData?.data?.overallCgpa || 0;
  const lastPercent = resultsData?.latestPercentage || resultsData?.data?.latestPercentage || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {profile?.personalInfo?.firstName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {profile?.academicInfo?.course} | Batch {profile?.academicInfo?.batch}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/communication" 
            className="relative p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm group"
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll Number</p>
              <p className="text-sm font-bold text-slate-900">{profile?.academicInfo?.rollNumber || 'N/A'}</p>
            </div>
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg border border-slate-800">
              {profile?.personalInfo?.firstName?.[0]}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Attendance" 
          value={`${attendancePct}%`} 
          trend={attendancePct >= 75 ? "Safe" : "Low"} 
          trendUp={attendancePct >= 75} 
          subtitle="Overall Presence" 
          icon={<Clock size={20} />} 
          color="bg-indigo-50 text-indigo-600 border border-indigo-100" 
        />
        <KPICard 
          title="Current CGPA" 
          value={`${cgpa}`} 
          trend={cgpa >= 7 ? "Excellent" : "Average"} 
          trendUp={cgpa >= 7} 
          subtitle="Academic Standing" 
          icon={<Sparkles size={20} />} 
          color="bg-amber-50 text-amber-600 border border-amber-100" 
        />
        <KPICard 
          title="Performance" 
          value={`${lastPercent}%`} 
          trend="Latest Exam" 
          trendUp={lastPercent >= 40} 
          subtitle="Recent Result" 
          icon={<GradIcon size={20} />} 
          color="bg-purple-50 text-purple-600 border border-purple-100" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Announcements Banner */}
          {announcements.length > 0 && (
            <Card className="p-6 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-600/20 border-none overflow-hidden relative group">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Megaphone size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Active Announcements</h3>
                    <p className="text-xs text-indigo-100 font-medium">You have {announcements.length} new messages from your teachers.</p>
                  </div>
                </div>
                <Link 
                  href="/communication" 
                  className="px-6 py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                >
                  Enter Hub
                </Link>
              </div>
            </Card>
          )}

          <Card className="p-8 border border-slate-100 bg-white shadow-ambient rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Registered Subjects</h2>
              <Link href="/attendance" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjectWise.length > 0 ? subjectWise.map((sub: any, i: number) => {
                const isToday = sub.lastMarkedAt && 
                  new Date(sub.lastMarkedAt).toDateString() === new Date().toDateString();
                return (
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-ambient transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                          <Book size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{sub.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {isToday ? (
                              <span className="text-emerald-600 font-black">✓ Updated Today</span>
                            ) : (
                              `Last: ${sub.lastMarkedAt ? new Date(sub.lastMarkedAt).toLocaleDateString() : 'N/A'}`
                            )}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs font-black px-2 py-1 rounded-lg border",
                        sub.percentage >= 75 ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100"
                      )}>
                        {sub.percentage}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-1000", sub.percentage >= 75 ? "bg-emerald-500" : "bg-rose-500")}
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{sub.present} Presence</span>
                        <span>{sub.total} Classes</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <>
                  <SubjectMiniCard name="Advanced Algorithms" code="CS601" icon={<Book size={18} />} color="text-indigo-600" />
                  <SubjectMiniCard name="Database Systems" code="CS602" icon={<Book size={18} />} color="text-emerald-600" />
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="p-8 border border-slate-100 bg-white shadow-ambient rounded-3xl h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 font-display">Today's Schedule</h2>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar size={16} />
              </div>
            </div>
            <div className="space-y-6">
              {schedule.length > 0 ? schedule.map((slot, i) => (
                <EventRow 
                  key={i} 
                  month="TOD" 
                  day={slot.startTime} 
                  title={slot.subjectId?.name || "Class"} 
                  sub={`${slot.room || 'TBD'} | Period ${slot.period}`} 
                  color={slot.isUpcoming ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"} 
                />
              )) : (
                <div className="py-12 text-center opacity-40">
                  <Clock size={32} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Sessions Logged Today</p>
                </div>
              )}
            </div>
            <Link 
              href="/timetable" 
              className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center"
            >
              View Full Timetable
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SubjectMiniCard({ name, code, icon, color }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-white hover:shadow-ambient transition-all cursor-pointer">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
         <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{name}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{code}</p>
      </div>
    </div>
  );
}

function EventRow({ month, day, title, sub, color }: any) {
  return (
    <div className="flex gap-4 items-start">
      <div className={`w-10 h-10 ${color} rounded-xl flex flex-col items-center justify-center shrink-0 border border-current/10 shadow-sm`}>
        <span className="text-[10px] font-bold leading-none opacity-80">{month}</span>
        <span className="text-sm font-black">{day}</span>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-[11px] text-slate-400 font-medium">{sub}</p>
      </div>
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

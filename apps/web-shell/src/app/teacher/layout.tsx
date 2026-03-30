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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== 'TEACHER') {
          router.push('/'); // Redirect non-teachers
      }
      setLoading(false);
    } else {
      router.push('/login');
    }
  }, [router]);

  if (loading) return null;

  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Layers, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AcademicsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/academics", icon: <BookOpen size={16} />, exact: true },
    { name: "Departments", href: "/academics/departments", icon: <Layers size={16} /> },
    { name: "Courses", href: "/academics/courses", icon: <Calendar size={16} /> },
    { name: "Batches", href: "/academics/batches", icon: <Users size={16} /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academics Engine</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Global Institutional Framework</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {tab.icon} {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[500px]">
        {children}
      </div>
    </div>
  );
}

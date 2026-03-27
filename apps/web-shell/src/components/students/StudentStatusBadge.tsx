// FILE: apps/web-shell/src/components/students/StudentStatusBadge.tsx
import React from "react";

interface StatusBadgeProps {
  status: "active" | "inactive" | "graduated" | "dropped";
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  active: { label: "Active", classes: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  inactive: { label: "Inactive", classes: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  graduated: { label: "Graduated", classes: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  dropped: { label: "Dropped", classes: "bg-red-500/10 text-red-500 border-red-500/20" },
};

export default function StudentStatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, classes: "bg-gray-500/10 text-gray-500 border-gray-500/20" };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.classes}`}>
      {config.label}
    </span>
  );
}

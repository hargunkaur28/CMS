"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function TimetablePage() {
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'TEACHER') {
        router.replace('/teacher/timetable');
      } else if (['COLLEGE_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        router.replace('/admin/timetable');
      }
    }
  }, [router]);

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  );
}

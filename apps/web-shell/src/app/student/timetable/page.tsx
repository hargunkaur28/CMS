"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import TimetableGrid, { TimetableCellEntry } from "@/components/timetable/TimetableGrid";
import { fetchMyProfile, fetchMyTimetable } from "@/lib/api/student";

export default function StudentMyTimetablePage() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TimetableCellEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sectionLabel, setSectionLabel] = useState("");
  const [batchLabel, setBatchLabel] = useState("");

  useEffect(() => {
    void bootstrap();
  }, []);

  const bootstrap = async () => {
    try {
      setLoading(true);
      const profileRes = await fetchMyProfile();
      const student = profileRes?.data;

      const studentBatchName = String(student?.academicInfo?.batch || "").trim();
      const sectionName = String(student?.academicInfo?.section || "").trim();

      setBatchLabel(studentBatchName);

      if (!sectionName) {
        setEntries([]);
        setSectionLabel("");
        setError("You have not been assigned to a section yet");
        return;
      }

      const timetableRes = await fetchMyTimetable();
      const normalized = (timetableRes?.data || []).map((entry: any) => ({
        ...entry,
        day: entry.day || entry.dayOfWeek,
      }));

      setEntries(normalized);
      setSectionLabel(sectionName);
      setError(null);
    } catch (err: any) {
      setEntries([]);
      setError(err?.response?.data?.message || "Failed to load your timetable");
    } finally {
      setLoading(false);
    }
  };

  const title = useMemo(() => {
    if (!sectionLabel) return "My Timetable";
    return `My Timetable • ${sectionLabel}`;
  }, [sectionLabel]);

  if (loading) {
    return (
      <div className="h-[70vh] w-full flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">Read-only weekly schedule for your assigned section.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 text-sm font-semibold">{error}</div>
      ) : (
        <>
          {entries.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 text-sm font-semibold">
              No timetable entries are configured yet for your assigned batch/section
              {batchLabel ? ` (${batchLabel}` : ""}
              {sectionLabel ? `${batchLabel ? " - " : "("}${sectionLabel}` : ""}
              {batchLabel || sectionLabel ? ")" : ""}
              .
            </div>
          )}

          <TimetableGrid
            entries={entries}
            readOnly
            renderBody={(entry) => (
              <>
                <p className="text-[11px] font-black text-slate-900 leading-tight">{entry.subject}</p>
                <p className="text-[10px] font-bold text-slate-600">{entry.teacherId?.name || "Teacher"}</p>
              </>
            )}
          />
        </>
      )}
    </div>
  );
}

import React from "react";
import Card from "@/components/ui/Card";
import { Briefcase, ChevronRight } from "lucide-react";

export default function PlacementPage() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-utility font-bold text-white/30 uppercase tracking-[0.1em] mb-1">
          Operations <ChevronRight size={12} className="text-white/20" /> Training & Placement
        </div>
        <h1 className="text-2xl font-display font-bold text-on-surface">Career Portal</h1>
        <p className="text-xs text-secondary-container font-utility">Industry connect, internship tracking and placement analytics</p>
      </header>
      
      <Card className="flex-1 p-8 text-center bg-surface-container-low border-dashed border-2 border-white/5 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
        <div className="max-w-md mx-auto py-12">
          <div className="w-16 h-16 bg-slate-500/10 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-500/5">
            <Briefcase size={32} />
          </div>
          <h2 className="text-xl font-display font-semibold text-on-surface mb-3">Employer Pipeline</h2>
          <p className="text-sm text-white/40 font-utility mb-8 leading-relaxed">
            Live employer feeds are temporarily unavailable. You can still review placement partners and resume upload readiness from this module.
          </p>
          <button className="px-6 py-2 bg-white/10 text-white rounded-lg font-utility font-bold text-sm shadow-lg hover:bg-white/20 transition-all active:scale-95">
            View Partner List
          </button>
        </div>
      </Card>
    </div>
  );
}

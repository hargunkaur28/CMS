import React from "react";
import Card from "@/components/ui/Card";
import { Settings, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-utility font-bold text-white/30 uppercase tracking-[0.1em] mb-1">
          System <ChevronRight size={12} className="text-white/20" /> Settings
        </div>
        <h1 className="text-2xl font-display font-bold text-on-surface">Platform Settings</h1>
        <p className="text-xs text-secondary-container font-utility">Configure institutional preferences and security protocols</p>
      </header>
      
      <Card className="flex-1 p-8 text-center bg-surface-container-low border-dashed border-2 border-white/5 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
        <div className="max-w-md mx-auto py-12">
          <div className="w-16 h-16 bg-white/5 text-white/40 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-white/5">
            <Settings size={32} />
          </div>
          <h2 className="text-xl font-display font-semibold text-on-surface mb-3">System Core Secure</h2>
          <p className="text-sm text-white/40 font-utility mb-8 leading-relaxed">
            Settings are currently locked for administrative review. Please contact the system architect for high-level configuration changes.
          </p>
          <button className="px-6 py-2 bg-white/10 text-white rounded-lg font-utility font-bold text-sm hover:bg-white/20 transition-all active:scale-95 border border-white/5">
            Request Admin Access
          </button>
        </div>
      </Card>
    </div>
  );
}

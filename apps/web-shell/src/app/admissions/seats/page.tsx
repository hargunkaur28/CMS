// FILE: apps/web-shell/src/app/admissions/seats/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getSeats, configureSeats } from "@/lib/api/admissions";
import SeatMatrix from "@/components/admissions/SeatMatrix";
import { ChevronRight, Settings, Plus, Loader2, X } from "lucide-react";
import Card from "@/components/ui/Card";

export default function SeatsPage() {
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [configData, setConfigData] = useState({
    course: "",
    batch: "2024-2028",
    totalSeats: 60,
    reservedSeats: { General: 30, OBC: 15, SC: 9, ST: 6 }
  });

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const res = await getSeats();
      if (res.success) setSeats(res.data);
    } catch (err) {
      console.error("Failed to fetch seats", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await configureSeats(configData);
      if (res.success) {
        fetchSeats();
        setShowConfig(false);
      }
    } catch (err) {
      alert("Failed to configure seats");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-utility font-bold text-on-surface/30 uppercase tracking-[0.1em] mb-1">
            Admissions <ChevronRight size={12} className="text-on-surface/20" /> Seat Matrix
          </div>
          <h1 className="text-2xl font-display font-bold text-on-surface">Live Seat Allocation</h1>
        </div>

        <button 
          onClick={() => setShowConfig(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low text-on-surface/60 hover:text-primary-indigo hover:bg-white border border-outline-variant/30 rounded-xl transition-all font-bold text-xs"
        >
          <Settings size={16} /> Configure Matrix
        </button>
      </header>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center bg-surface-container-low/30 rounded-2xl border border-dashed border-outline-variant">
          <Loader2 className="animate-spin text-primary-indigo" size={32} />
        </div>
      ) : (
        <SeatMatrix seats={seats} />
      )}

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <Card className="max-w-md w-full p-8 bg-surface-container-lowest border-none shadow-2xl relative">
            <button onClick={() => setShowConfig(false)} className="absolute right-4 top-4 p-2 text-on-surface/30 hover:text-on-surface">
              <X size={20} />
            </button>
            <h3 className="text-xl font-display font-bold text-on-surface mb-6">Configure Seats</h3>
            <form onSubmit={handleConfigure} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-on-surface/40 uppercase mb-1 block tracking-widest">Course Name</label>
                <input 
                  required
                  className="w-full bg-surface-container-low border-transparent focus:border-primary-indigo/30 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-all"
                  value={configData.course}
                  onChange={e => setConfigData({...configData, course: e.target.value})}
                  placeholder="e.g. B.Tech CS"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-on-surface/40 uppercase mb-1 block tracking-widest">Total Seats</label>
                  <input 
                    type="number"
                    className="w-full bg-surface-container-low border-transparent focus:border-primary-indigo/30 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-all"
                    value={configData.totalSeats}
                    onChange={e => setConfigData({...configData, totalSeats: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface/40 uppercase mb-1 block tracking-widest">Batch</label>
                  <input 
                    className="w-full bg-surface-container-low border-transparent focus:border-primary-indigo/30 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-all"
                    value={configData.batch}
                    onChange={e => setConfigData({...configData, batch: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl">
                 <p className="text-[10px] font-bold text-on-surface/30 uppercase mb-3">Reservation Distribution</p>
                 <div className="grid grid-cols-2 gap-4">
                    <ReservationInput label="General" value={configData.reservedSeats.General} onChange={(v) => setConfigData({...configData, reservedSeats: {...configData.reservedSeats, General: v}})} />
                    <ReservationInput label="OBC" value={configData.reservedSeats.OBC} onChange={(v) => setConfigData({...configData, reservedSeats: {...configData.reservedSeats, OBC: v}})} />
                    <ReservationInput label="SC" value={configData.reservedSeats.SC} onChange={(v) => setConfigData({...configData, reservedSeats: {...configData.reservedSeats, SC: v}})} />
                    <ReservationInput label="ST" value={configData.reservedSeats.ST} onChange={(v) => setConfigData({...configData, reservedSeats: {...configData.reservedSeats, ST: v}})} />
                 </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-gradient text-white rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all mt-4">
                Update Seat Matrix
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function ReservationInput({ label, value, onChange }: any) {
  return (
    <div>
      <label className="text-[8px] font-bold text-on-surface/40 uppercase block mb-1">{label}</label>
      <input 
        type="number"
        className="w-full bg-white border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary-indigo/30 border transition-all"
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
      />
    </div>
  )
}

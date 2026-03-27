// FILE: apps/web-shell/src/app/login/page.tsx
"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Loader2, 
  ChevronRight, 
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Card from "@/components/ui/Card";

// Validation Schema
const loginSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid institutional email address" }),
  password: z.string()
    .min(6, { message: "Security protocol requires at least 6 characters" })
});

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Validation & Sanitization
    const result = loginSchema.safeParse(formData);
    
    if (!result.success) {
      setError(result.error.errors[0].message);
      setLoading(false);
      return;
    }

    const sanitizedData = result.data;

    try {
      // 2. Authentication Request
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      const data = await res.json();

      if (res.ok) {
        // 3. Session Persistence
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        }));
        
        // 4. Redirect
        router.push("/");
        router.refresh();
      } else {
        setError(data.message || "Authentication credentials rejected");
      }
    } catch (err) {
      setError("Institutional cluster connectivity failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative flex items-center justify-center p-6 overflow-hidden">
      {/* Background Orbs - Neutralized */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-black/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-black/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center mb-10 group">
          <div className="w-16 h-16 bg-black rounded-[2rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-700">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="mt-6 text-2xl font-display font-black text-black tracking-tight">NGCMS</h1>
          <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.4em] mt-1">St. Xavier's Digital Curator</p>
        </div>

        <Card className="p-10 bg-white shadow-ambient overflow-hidden relative border border-outline-variant">
          <div className="absolute top-0 left-0 w-full h-1 bg-black" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest pl-1">Institutional Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="name@institution.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-surface-container-low border-transparent focus:border-black/30 focus:bg-white transition-all rounded-2xl pl-12 pr-4 py-4 text-sm outline-none border shadow-sm placeholder:text-black/20 text-black"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-1 pr-1">
                <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Security Protocol</label>
                <button type="button" className="text-[10px] font-bold text-black/40 hover:underline">Reset Key?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-surface-container-low border-transparent focus:border-black/30 focus:bg-white transition-all rounded-2xl pl-12 pr-4 py-4 text-sm outline-none border shadow-sm placeholder:text-black/20 text-black"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-black/5 border border-black/10 rounded-2xl flex items-center gap-3 animate-in shake duration-500">
                <AlertCircle className="text-black shrink-0" size={16} />
                <p className="text-[11px] font-bold text-black leading-tight">{error}</p>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full h-14 bg-black text-white rounded-[1.5rem] font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-50 disabled:scale-100 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Initialize Connection</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-on-surface/5 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-on-surface/20">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Quantum Encryption Active</span>
             </div>
             <p className="text-[10px] text-on-surface/30 text-center font-medium leading-relaxed">
               Access restricted to authorized St. Xavier's personnel. <br />
               Unauthenticated access attempts are logged.
             </p>
          </div>
        </Card>

        <p className="mt-10 text-center text-xs font-bold text-on-surface/20 uppercase tracking-[0.2em]">
          NGCMS v.1.0 // 2026 ERP
        </p>
      </div>
    </div>
  );
}

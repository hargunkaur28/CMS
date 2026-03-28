"use client";

import React, { useState } from "react";
import { createEnquiry } from "@/lib/api/admissions";
import { X, Loader2 } from "lucide-react";

interface EnquiryFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function EnquiryForm({ onSuccess, onClose }: EnquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    courseInterested: "",
    source: "online",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createEnquiry(formData);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Failed to create enquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full relative z-50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">New Admission Enquiry</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Full Name</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all rounded-xl px-4 py-2.5 text-sm outline-none text-slate-800"
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Phone Number</label>
            <input
              required
              type="tel"
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all rounded-xl px-4 py-2.5 text-sm outline-none text-slate-800"
              placeholder="+91 98765-43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Email Address</label>
            <input
              required
              type="email"
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all rounded-xl px-4 py-2.5 text-sm outline-none text-slate-800"
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Course Interested</label>
          <select
            required
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all rounded-xl px-4 py-2.5 text-sm outline-none text-slate-800 appearance-none"
            value={formData.courseInterested}
            onChange={(e) => setFormData({ ...formData, courseInterested: e.target.value })}
          >
            <option value="">Select a Course</option>
            <option value="B.Tech Computer Science">B.Tech Computer Science</option>
            <option value="B.Tech Data Science">B.Tech Data Science</option>
            <option value="B.Tech Electronics">B.Tech Electronics</option>
            <option value="MBA Marketing">MBA Marketing</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Lead Source</label>
          <div className="flex gap-4">
            {["online", "walk-in", "referral"].map((source) => (
              <label key={source} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:bg-indigo-600 has-[:checked]:text-white has-[:checked]:border-indigo-600">
                <input
                  type="radio"
                  name="source"
                  className="hidden"
                  checked={formData.source === source}
                  onChange={() => setFormData({ ...formData, source: source as any })}
                />
                <span className="text-xs font-bold capitalize">{source}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin text-white" /> : "Submit Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}

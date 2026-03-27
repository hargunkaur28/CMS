// FILE: apps/web-shell/src/components/admissions/EnquiryForm.tsx
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
    <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-ambient border border-outline-variant max-w-lg w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-bold text-on-surface">New Admission Enquiry</h3>
        <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-lg text-on-surface/40 hover:text-on-surface transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-on-surface/40 uppercase mb-1 block">Full Name</label>
          <input
            required
            type="text"
            className="w-full bg-surface-container-low border-transparent focus:border-primary-indigo/30 focus:bg-white transition-all rounded-xl px-4 py-2.5 text-sm outline-none border"
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-on-surface/40 uppercase mb-1 block">Phone Number</label>
            <input
              required
              type="tel"
              className="w-full bg-surface-container-low border-transparent focus:border-primary-indigo/30 focus:bg-white transition-all rounded-xl px-4 py-2.5 text-sm outline-none border"
              placeholder="+91 98765-43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-on-surface/40 uppercase mb-1 block">Email Address</label>
            <input
              required
              type="email"
              className="w-full bg-surface-container-low border-transparent focus:border-primary-indigo/30 focus:bg-white transition-all rounded-xl px-4 py-2.5 text-sm outline-none border"
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-on-surface/40 uppercase mb-1 block">Course Interested</label>
          <select
            required
            className="w-full bg-surface-container-low border-transparent focus:border-primary-indigo/30 focus:bg-white transition-all rounded-xl px-4 py-2.5 text-sm outline-none border appearance-none"
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
          <label className="text-xs font-bold text-on-surface/40 uppercase mb-1 block">Lead Source</label>
          <div className="flex gap-4">
            {["online", "walk-in", "referral"].map((source) => (
              <label key={source} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container transition-all has-[:checked]:bg-black has-[:checked]:text-white has-[:checked]:border-transparent">
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
            className="w-full py-3 bg-white text-black border-2 border-primary-indigo rounded-xl font-bold text-sm shadow-ambient hover:bg-surface-container-low transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin text-primary-indigo" /> : "Submit Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}

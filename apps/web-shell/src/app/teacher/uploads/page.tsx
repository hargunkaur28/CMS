"use client";

import React, { useState, useEffect } from "react";
import UploadCenter from "@/components/teacher/UploadCenter";
import api from "@/lib/api";
import { RotateCcw, AlertTriangle } from "lucide-react";

export default function UploadsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teacher/materials');
      setMaterials(res.data.data);
    } catch (err: any) {
      setError("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (formData: FormData) => {
    try {
      await api.post('/teacher/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchData(); // Refresh list
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      await api.delete(`/teacher/materials/${id}`);
      fetchData();
    } catch (err: any) {
      alert("Failed to delete material");
    }
  };

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
    <div className="grid grid-cols-3 gap-8">
       <div className="h-[500px] bg-slate-100 rounded-2xl"></div>
       <div className="col-span-2 h-[500px] bg-slate-100 rounded-2xl"></div>
    </div>
  </div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assignment & Resource Center</h1>
          <p className="text-slate-500 mt-1">Upload study materials, assignments, and reference documents for your classes.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <RotateCcw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      <UploadCenter 
        materials={materials} 
        onUpload={handleUpload} 
        onDelete={handleDelete} 
      />
    </div>
  );
}

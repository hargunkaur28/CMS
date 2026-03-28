"use client";

import React, { useState } from "react";
import { Upload, File, Trash2, ExternalLink, Calendar, BookOpen, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material {
  _id: string;
  title: string;
  description: string;
  type: 'Assignment' | 'Material' | 'Reference';
  fileUrl: string;
  dueDate?: string;
  subjectId: { name: string };
  classId: { name: string };
  createdAt: string;
}

interface UploadCenterProps {
  materials: Material[];
  onUpload: (formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function UploadCenter({ materials, onUpload, onDelete }: UploadCenterProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Material" as Material['type'],
    dueDate: ""
  });
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("type", formData.type);
    if (formData.dueDate) data.append("dueDate", formData.dueDate);
    
    // Mock class/subject IDs for demo
    data.append("classId", "65e1234567890abcdef12345");
    data.append("subjectId", "65e1234567890abcdef54321");

    try {
      await onUpload(data);
      setFormData({ title: "", description: "", type: "Material", dueDate: "" });
      setFile(null);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Upload Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Upload size={20} className="text-slate-400" />
            New Upload
          </h3>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Unit 1 Reference Notes"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-slate-100 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
              >
                <option value="Material">Study Material</option>
                <option value="Assignment">Assignment</option>
                <option value="Reference">Reference Link/Doc</option>
              </select>
            </div>

            {formData.type === 'Assignment' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                <input 
                  type="date" 
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none resize-none"
                placeholder="Briefly describe the contents..."
              />
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">File Attachment</label>
               <div className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all",
                  file ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"
               )}>
                  <input 
                    type="file" 
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  {file ? (
                    <div className="text-center">
                       <File size={32} className="mx-auto text-slate-900 mb-2" />
                       <p className="text-xs font-bold text-slate-900 truncate w-40">{file.name}</p>
                       <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                       <Upload size={32} className="mx-auto text-slate-300 mb-2" />
                       <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">Click to browse</p>
                    </div>
                  )}
               </div>
            </div>

            {uploadError && (
              <p className="text-[10px] font-bold text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-2">
                 <AlertCircle size={12} />
                 {uploadError}
              </p>
            )}

            <button 
              type="submit"
              disabled={isUploading || !file}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Publish Material"}
            </button>
          </form>
        </div>
      </div>

      {/* Materials List */}
      <div className="lg:col-span-2 space-y-6">
         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Published Materials</h3>
               <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm">{materials.length} TOTAL</span>
            </div>

            <div className="divide-y divide-slate-100">
               {materials.length > 0 ? materials.map((m) => (
                  <div key={m._id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
                     <div className={cn(
                        "p-3 rounded-2xl",
                        m.type === 'Assignment' ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"
                     )}>
                        <BookOpen size={24} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <h4 className="font-bold text-slate-900 truncate">{m.title}</h4>
                           <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase",
                              m.type === 'Assignment' ? "border-red-200 text-red-500" : "border-indigo-200 text-indigo-500"
                           )}>
                              {m.type}
                           </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{m.description || "No description provided."}</p>
                        
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                           <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                              <Calendar size={12} />
                              <span>Uploaded: {new Date(m.createdAt).toLocaleDateString()}</span>
                           </div>
                           {m.dueDate && (
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500">
                                <Clock size={12} />
                                <span>Due: {new Date(m.dueDate).toLocaleDateString()}</span>
                             </div>
                           )}
                           <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded uppercase tracking-tighter">{m.subjectId?.name}</span>
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded uppercase tracking-tighter">{m.classId?.name}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <a 
                          href={m.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all shadow-sm"
                        >
                           <ExternalLink size={18} />
                        </a>
                        <button 
                          onClick={() => onDelete(m._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-red-100 transition-all shadow-sm"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
               )) : (
                  <div className="p-12 text-center text-slate-400 italic">
                     No materials uploaded yet.
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function Clock({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    )
}

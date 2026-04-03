"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createAnnouncement, fetchAnnouncements, fetchBatches, fetchFaculties, fetchStudents, sendMessage } from "@/lib/api/admin";
import AnnouncementList from "@/components/admin/AnnouncementList";
import { AlertCircle, Loader2, Mail, MessageSquare, Plus, Send, Users, X } from "lucide-react";

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    body: "",
    targetClass: "all",
    priority: "Normal",
  });
  const [messageForm, setMessageForm] = useState({
    receiverId: "",
    content: "",
  });

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const [annRes, batchRes, studentRes, facultyRes] = await Promise.all([
        fetchAnnouncements(),
        fetchBatches(),
        fetchStudents(),
        fetchFaculties(),
      ]);

      if (annRes.success) setAnnouncements(annRes.data);
      if (batchRes.success) setBatches(Array.isArray(batchRes.data) ? batchRes.data : []);
      if (studentRes.success) setStudents(Array.isArray(studentRes.data) ? studentRes.data : []);
      if (facultyRes.success) setFaculties(Array.isArray(facultyRes.data) ? facultyRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recipientOptions = useMemo(() => {
    const studentOptions = students
      .map((student) => ({
        value: String(student?.userId?._id || student?.userId || student?._id || ""),
        label: `${student?.personalInfo?.firstName || ""} ${student?.personalInfo?.lastName || ""}`.trim() || student?.personalInfo?.email || "Student",
        group: "Student",
      }))
      .filter((item) => item.value);

    const facultyOptions = faculties
      .map((faculty) => ({
        value: String(faculty?.userId?._id || faculty?.userId || faculty?._id || ""),
        label: faculty?.userId?.name || faculty?.name || faculty?.personalInfo?.name || faculty?.userId?.email || "Faculty",
        group: "Faculty",
      }))
      .filter((item) => item.value);

    return [...studentOptions, ...facultyOptions];
  }, [students, faculties]);

  const handleAnnouncementSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setFeedback(null);
      await createAnnouncement({
        title: announcementForm.title,
        body: announcementForm.body,
        content: announcementForm.body,
        targetClass: announcementForm.targetClass,
        targetAudience: "all",
        priority: announcementForm.priority,
        type: announcementForm.priority.toLowerCase(),
      });
      setAnnouncementForm({ title: "", body: "", targetClass: "all", priority: "Normal" });
      setShowAnnouncementModal(false);
      setFeedback("Announcement posted successfully.");
      await loadCommunications();
    } catch (err: any) {
      setFeedback(err?.response?.data?.message || "Failed to post announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessageSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setFeedback(null);
      await sendMessage({
        receiverId: messageForm.receiverId,
        content: messageForm.content,
      });
      setMessageForm({ receiverId: "", content: "" });
      setShowMessageModal(false);
      setFeedback("Direct message sent successfully.");
    } catch (err: any) {
      setFeedback(err?.response?.data?.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase font-sans">Communication Hub</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Institutional Engagement & Information Control</p>
        </div>

        <div className="flex items-center gap-3">
        <button onClick={() => setShowMessageModal(true)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Mail size={14} /> Direct Message
           </button>
        <button onClick={() => setShowAnnouncementModal(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2">
              <Plus size={14} /> New Announcement
           </button>
        </div>
      </div>

    {feedback && (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
       <AlertCircle size={16} className="text-amber-500" />
       <span>{feedback}</span>
      </div>
    )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Feed */}
         <div className="lg:col-span-2">
           {loading ? (
             <div className="h-96 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Global Feed...</p>
             </div>
           ) : (
             <AnnouncementList announcements={announcements} />
           )}
         </div>

         {/* Sidebar Tools */}
         <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Users size={60} />
               </div>
               <h3 className="text-xs font-black uppercase tracking-widest mb-4">Targeted Blast</h3>
               <p className="text-[10px] font-medium text-slate-400 leading-relaxed mb-6">Send urgent SMS or Email notifications to specific student cohorts or faculty departments.</p>
              <button onClick={() => setShowAnnouncementModal(true)} className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                  Launch Campaign
               </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">System Health</h3>
               <div className="space-y-4">
                  <HealthItem label="Email Gateway" status="Operational" />
                  <HealthItem label="SMS API" status="Operational" />
                  <HealthItem label="Push Notifications" status="Operational" />
               </div>
            </div>
         </div>
      </div>

      {showAnnouncementModal && (
        <Modal title="New Announcement" onClose={() => setShowAnnouncementModal(false)}>
          <form className="space-y-4" onSubmit={handleAnnouncementSubmit}>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Title</label>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                value={announcementForm.title}
                onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Batch</label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                value={announcementForm.targetClass}
                onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, targetClass: event.target.value }))}
              >
                <option value="all">All Classes</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>{batch.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Priority</label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                value={announcementForm.priority}
                onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, priority: event.target.value }))}
              >
                <option>Normal</option>
                <option>Important</option>
                <option>Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message</label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 min-h-32"
                value={announcementForm.body}
                onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, body: event.target.value }))}
                required
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAnnouncementModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60 flex items-center gap-2">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Post
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showMessageModal && (
        <Modal title="Direct Message" onClose={() => setShowMessageModal(false)}>
          <form className="space-y-4" onSubmit={handleMessageSubmit}>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Recipient</label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                value={messageForm.receiverId}
                onChange={(event) => setMessageForm((prev) => ({ ...prev, receiverId: event.target.value }))}
                required
              >
                <option value="">Select recipient</option>
                {recipientOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.group}: {option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message</label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 min-h-32"
                value={messageForm.content}
                onChange={(event) => setMessageForm((prev) => ({ ...prev, content: event.target.value }))}
                required
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowMessageModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60 flex items-center gap-2">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                Send
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-4xl bg-white shadow-2xl border border-slate-100 p-6" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HealthItem({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{status}</span>
       </div>
    </div>
  );
}

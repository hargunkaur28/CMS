"use client";

import React, { useState, useEffect } from "react";
import AnnouncementComposer from "@/components/teacher/AnnouncementComposer";
import api from "@/lib/api";
import { MessageSquare, Bell, Send, User, RotateCcw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'announcements' | 'messages'>('announcements');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, stuRes] = await Promise.all([
        api.get('/teacher/announcements'),
        api.get('/teacher/students')
      ]);
      setAnnouncements(annRes.data.data);
      setStudents(stuRes.data.data);
    } catch (err: any) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (studentId: string) => {
    try {
      const res = await api.get(`/teacher/messages/${studentId}`);
      setMessages(res.data.data);
    } catch (err) {
      console.error("Failed to fetch messages");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchMessages(selectedStudent.userId._id);
      const interval = setInterval(() => fetchMessages(selectedStudent.userId._id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedStudent]);

  const handlePostAnnouncement = async (data: any) => {
    await api.post('/teacher/announcements', data);
    fetchData();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage || !selectedStudent) return;

    try {
      await api.post('/teacher/messages', {
        receiverId: selectedStudent.userId._id,
        content: newMessage
      });
      setNewMessage("");
      fetchMessages(selectedStudent.userId._id);
    } catch (err) {
      alert("Failed to send message");
    }
  };

  if (loading) return <div className="animate-pulse space-y-8">
     <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[600px] bg-slate-100 rounded-3xl"></div>
        <div className="h-[600px] bg-slate-100 rounded-3xl"></div>
     </div>
  </div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Communication Hub</h1>
          <p className="text-slate-500 mt-1">Send announcements to classes or direct messages to students.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
           <button 
             onClick={() => setActiveTab('announcements')}
             className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'announcements' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-400 hover:text-slate-600")}
           >
              Announcements
           </button>
           <button 
             onClick={() => setActiveTab('messages')}
             className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'messages' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-400 hover:text-slate-600")}
           >
              Direct Messages
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeTab === 'announcements' ? (
           <>
              <div className="lg:col-span-2">
                 <AnnouncementComposer onPost={handlePostAnnouncement} />
              </div>
              <div className="space-y-6">
                 <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Sent</h3>
                       <RotateCcw size={16} className="text-slate-400 animate-spin-slow" />
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
                       {announcements.map((ann: any) => (
                         <div key={ann._id} className="p-5 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                               <span className={cn(
                                 "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border",
                                 ann.priority === 'Urgent' ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-500 border-slate-100"
                               )}>
                                  {ann.priority}
                               </span>
                               <span className="text-[9px] text-slate-400 font-medium">{new Date(ann.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">{ann.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ann.body}</p>
                         </div>
                       ))}
                       {announcements.length === 0 && (
                          <div className="p-12 text-center text-slate-400 text-xs italic">No announcements sent yet.</div>
                       )}
                    </div>
                 </div>
              </div>
           </>
        ) : (
           /* Messaging Section */
           <>
              <div className="lg:col-span-1 space-y-4">
                 <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-6 border-b border-slate-100">
                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Contacts</h3>
                       <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Find student..."
                            className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none"
                          />
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                       {students.map((stu: any) => (
                         <button 
                           key={stu._id}
                           onClick={() => setSelectedStudent(stu)}
                           className={cn(
                             "w-full p-4 flex items-center gap-3 transition-all text-left",
                             selectedStudent?._id === stu._id ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                           )}
                         >
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", selectedStudent?._id === stu._id ? "bg-white text-slate-900" : "bg-slate-100 text-slate-400")}>
                               {stu.name[0]}
                            </div>
                            <div className="min-w-0">
                               <p className="text-sm font-bold truncate">{stu.name}</p>
                               <p className={cn("text-[10px] uppercase font-medium tracking-tighter truncate", selectedStudent?._id === stu._id ? "text-slate-400" : "text-slate-500")}>{stu.rollNumber}</p>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="lg:col-span-2">
                 <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    {selectedStudent ? (
                       <>
                          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                                {selectedStudent.name[0]}
                             </div>
                             <div>
                                <h3 className="font-bold text-slate-900">{selectedStudent.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Conversation</p>
                             </div>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/20">
                             {messages.map((msg: any) => (
                               <div key={msg._id} className={cn("flex flex-col max-w-[80%]", msg.senderId === selectedStudent.userId._id ? "items-start" : "items-end ml-auto")}>
                                  <div className={cn(
                                     "p-4 rounded-3xl text-sm shadow-sm",
                                     msg.senderId === selectedStudent.userId._id ? "bg-white text-slate-900 rounded-tl-none border border-slate-100" : "bg-slate-900 text-white rounded-tr-none"
                                  )}>
                                     {msg.content}
                                  </div>
                                  <span className="text-[10px] text-slate-400 mt-1 px-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               </div>
                             ))}
                             {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                                   <MessageSquare size={48} />
                                   <p className="text-xs font-bold uppercase tracking-widest">Start a conversation</p>
                                </div>
                             )}
                          </div>

                          <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-100 bg-white">
                             <div className="flex items-center gap-4">
                                <input 
                                  type="text" 
                                  value={newMessage}
                                  onChange={e => setNewMessage(e.target.value)}
                                  placeholder="Type your message here..."
                                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-slate-100 transition-all font-medium"
                                />
                                <button 
                                  type="submit"
                                  className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
                                >
                                   <Send size={20} />
                                </button>
                             </div>
                          </form>
                       </>
                    ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-6">
                          <div className="p-8 rounded-full bg-slate-50">
                             <User size={64} />
                          </div>
                          <div className="text-center">
                             <h3 className="text-lg font-bold text-slate-400">Select a Contact</h3>
                             <p className="text-xs font-medium uppercase tracking-widest mt-1">to begin direct messaging</p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </>
        )}
      </div>
    </div>
  );
}

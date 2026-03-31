"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  fetchMyAnnouncements,
  fetchTeachersForRole,
  fetchConversation,
  sendDirectMessage,
  fetchUnreadCount,
} from "@/lib/api/communication";
import {
  MessageSquare,
  Bell,
  Send,
  User,
  Clock,
  Megaphone,
  Search,
  ArrowLeft,
  CheckCheck,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/components/providers/SocketProvider";

export default function CommunicationPage() {
  const { socket } = useSocket();
  const [user, setUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"announcements" | "messages">("announcements");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(savedUser);
    fetchData();
    loadUnreadCount();
  }, []);

  // Real-time message listener
  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (data: any) => {
        // If we're viewing this conversation, add the message
        if (selectedTeacher && data.from?._id === (selectedTeacher.userId?._id || selectedTeacher.userId)) {
          setMessages((prev) => [...prev, data.message]);
          scrollToBottom();
        }
        loadUnreadCount();
      });
      return () => {
        socket.off("newMessage");
      };
    }
  }, [socket, selectedTeacher]);

  // Poll for new messages in active conversation
  useEffect(() => {
    if (selectedTeacher) {
      const teacherUserId = selectedTeacher.userId?._id || selectedTeacher.userId;
      loadConversation(teacherUserId);
      const interval = setInterval(() => loadConversation(teacherUserId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTeacher]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, teachRes] = await Promise.all([
        fetchMyAnnouncements(),
        fetchTeachersForRole(),
      ]);
      if (annRes.success) setAnnouncements(annRes.data);
      if (teachRes.success) setTeachers(teachRes.data);
    } catch (err) {
      console.error("Failed to load communication data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (teacherUserId: string) => {
    try {
      const res = await fetchConversation(teacherUserId);
      if (res.success) setMessages(res.data);
    } catch (err) {
      console.error("Failed to load conversation", err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await fetchUnreadCount();
      if (res.success) setUnreadCount(res.data.count);
    } catch {
      // Silently fail
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTeacher || sending) return;

    const teacherUserId = selectedTeacher.userId?._id || selectedTeacher.userId;
    setSending(true);

    try {
      const res = await sendDirectMessage(teacherUserId, newMessage.trim());
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        setNewMessage("");
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleLabel = user?.role === "PARENT" ? "Parent" : "Student";
  const getTeacherInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "T";

  const priorityStyle: Record<string, string> = {
    Normal: "bg-slate-50 text-slate-500 border-slate-100",
    Important: "bg-amber-50 text-amber-600 border-amber-100",
    Urgent: "bg-red-50 text-red-600 border-red-100",
  };

  // Loading skeleton
  if (loading)
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-72 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[600px] bg-slate-100 rounded-3xl" />
          <div className="h-[600px] bg-slate-100 rounded-3xl" />
        </div>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* === Header === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Communication Hub
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {user?.role === "PARENT"
              ? "Stay connected with your child's teachers and institution."
              : "View announcements and message your teachers directly."}
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab("announcements")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === "announcements"
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Bell size={14} />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={cn(
              "relative px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === "messages"
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <MessageSquare size={14} />
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* === Content === */}
      {activeTab === "announcements" ? (
        <AnnouncementsView
          announcements={announcements}
          priorityStyle={priorityStyle}
          roleLabel={roleLabel}
        />
      ) : (
        <MessagingView
          teachers={filteredTeachers}
          selectedTeacher={selectedTeacher}
          setSelectedTeacher={setSelectedTeacher}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          sending={sending}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
          getTeacherInitials={getTeacherInitials}
          messagesEndRef={messagesEndRef}
          chatContainerRef={chatContainerRef}
        />
      )}
    </div>
  );
}

// ======================================================================
// ANNOUNCEMENTS VIEW
// ======================================================================
function AnnouncementsView({
  announcements,
  priorityStyle,
  roleLabel,
}: {
  announcements: any[];
  priorityStyle: Record<string, string>;
  roleLabel: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <div className="p-6 rounded-full bg-slate-50 mb-6">
              <Megaphone size={48} className="text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-400 mb-2">
              No Announcements Yet
            </h3>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest max-w-sm">
              Your teachers haven't posted any announcements for your batch.
              Check back later.
            </p>
          </div>
        ) : (
          announcements.map((ann: any) => (
            <div
              key={ann._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
                    {ann.senderId?.name?.[0] || "A"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {ann.senderId?.name || "Administration"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {ann.senderId?.role === "TEACHER"
                        ? "Faculty"
                        : "Administration"}{" "}
                      •{" "}
                      {new Date(ann.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border",
                    priorityStyle[ann.priority] || priorityStyle.Normal
                  )}
                >
                  {ann.priority || "Normal"}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {ann.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                {ann.body}
              </p>

              {ann.targetClass && ann.targetClass !== "all" && (
                <div className="mt-4 flex items-center gap-2">
                  <Users size={12} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Target: {ann.targetClass}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Sidebar */}
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-3">
              {roleLabel} Portal
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
              All announcements from your teachers and institution appear here
              in real-time. Switch to the Messages tab to directly communicate
              with faculty.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live Updates Active
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <QuickStat
              label="Total Announcements"
              value={announcements.length.toString()}
            />
            <QuickStat
              label="Urgent"
              value={
                announcements
                  .filter((a) => a.priority === "Urgent")
                  .length.toString()
              }
              isAlert={
                announcements.filter((a) => a.priority === "Urgent").length > 0
              }
            />
            <QuickStat
              label="This Week"
              value={
                announcements
                  .filter(
                    (a) =>
                      new Date(a.createdAt) >
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  )
                  .length.toString()
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  label,
  value,
  isAlert,
}: {
  label: string;
  value: string;
  isAlert?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 last:pb-0">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-black",
          isAlert ? "text-red-600" : "text-slate-900"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ======================================================================
// MESSAGING VIEW
// ======================================================================
function MessagingView({
  teachers,
  selectedTeacher,
  setSelectedTeacher,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  sending,
  searchQuery,
  setSearchQuery,
  user,
  getTeacherInitials,
  messagesEndRef,
  chatContainerRef,
}: {
  teachers: any[];
  selectedTeacher: any;
  setSelectedTeacher: (t: any) => void;
  messages: any[];
  newMessage: string;
  setNewMessage: (v: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  sending: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  user: any;
  getTeacherInitials: (name: string) => string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Contacts Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
              Faculty Contacts
            </h3>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-100 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
            {teachers.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No Teachers Found
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Contact your institution if needed.
                </p>
              </div>
            ) : (
              teachers.map((teacher: any) => {
                const teacherId =
                  teacher.userId?._id || teacher.userId;
                const selectedId =
                  selectedTeacher?.userId?._id || selectedTeacher?.userId;
                const isSelected = teacherId === selectedId;

                return (
                  <button
                    key={teacher._id}
                    onClick={() => setSelectedTeacher(teacher)}
                    className={cn(
                      "w-full p-4 flex items-center gap-3 transition-all duration-200 text-left group",
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all",
                        isSelected
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"
                      )}
                    >
                      {getTeacherInitials(teacher.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">
                        {teacher.name}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest truncate",
                          isSelected ? "text-slate-400" : "text-slate-400"
                        )}
                      >
                        {teacher.department || teacher.designation || "Faculty"}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      className={cn(
                        "shrink-0 transition-all",
                        isSelected
                          ? "text-slate-400"
                          : "text-slate-200 group-hover:text-slate-400"
                      )}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {selectedTeacher ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-600/20">
                  {getTeacherInitials(selectedTeacher.name)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">
                    {selectedTeacher.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {selectedTeacher.department || "Faculty"} •{" "}
                    {selectedTeacher.designation || "Professor"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                    Active
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                    <div className="p-6 rounded-full bg-slate-50">
                      <MessageSquare size={40} className="text-slate-200" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold uppercase tracking-widest mb-1">
                        Start a conversation
                      </p>
                      <p className="text-[10px] text-slate-400 max-w-xs">
                        Send a message to {selectedTeacher.name} to begin your
                        conversation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Date separator */}
                    <div className="flex items-center justify-center">
                      <div className="px-4 py-1 bg-slate-100 rounded-full">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Conversation
                        </span>
                      </div>
                    </div>

                    {messages.map((msg: any, idx: number) => {
                      const currentUserId = user?._id || user?.id;
                      const senderId = msg.senderId?._id || msg.senderId;
                      const isMine = senderId === currentUserId;
                      const showTime =
                        idx === 0 ||
                        new Date(msg.createdAt).getTime() -
                          new Date(messages[idx - 1].createdAt).getTime() >
                          300000;

                      return (
                        <React.Fragment key={msg._id || idx}>
                          {showTime && idx > 0 && (
                            <div className="flex justify-center my-2">
                              <span className="text-[9px] text-slate-400 font-bold bg-white px-3 py-1 rounded-full border border-slate-100">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                          <div
                            className={cn(
                              "flex flex-col max-w-[75%]",
                              isMine ? "items-end ml-auto" : "items-start"
                            )}
                          >
                            <div
                              className={cn(
                                "px-4 py-3 rounded-2xl text-sm shadow-sm transition-all",
                                isMine
                                  ? "bg-slate-900 text-white rounded-br-md"
                                  : "bg-white text-slate-900 rounded-bl-md border border-slate-100"
                              )}
                            >
                              {msg.content}
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-1">
                              <span className="text-[9px] text-slate-400 font-medium">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMine && msg.isRead && (
                                <CheckCheck
                                  size={12}
                                  className="text-indigo-500"
                                />
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-100 bg-white"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className={cn(
                      "p-3 rounded-2xl transition-all shadow-lg flex items-center justify-center",
                      newMessage.trim() && !sending
                        ? "bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700"
                        : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
                    )}
                  >
                    <Send size={18} className={sending ? "animate-pulse" : ""} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* No teacher selected */
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-6">
              <div className="relative">
                <div className="p-8 rounded-full bg-slate-50">
                  <User size={56} className="text-slate-200" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <MessageSquare size={14} className="text-white" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-400 mb-1">
                  Select a Teacher
                </h3>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest max-w-xs">
                  Choose a faculty member from the contacts panel to begin a
                  direct conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// FILE: apps/web-shell/src/lib/api/attendance.ts
import { ApiResponse } from "./students";

const API_URL = "http://localhost:5000/api";

export interface AttendanceRecord {
  _id: string;
  studentId: {
    _id: string;
    personalInfo: { firstName: string; lastName: string };
    uniqueStudentId: string;
  };
  subjectId: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
}

export interface AttendanceStats {
  studentId: string;
  name: string;
  uniqueId: string;
  totalClasses: number;
  presentCount: number;
  percentage: number;
  isShortage: boolean;
}

export interface LeaveRequest {
  _id: string;
  studentId: any;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  supportingDoc?: string;
}

export const markBulkAttendance = async (data: any): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/attendance/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getAttendanceReport = async (params: any): Promise<ApiResponse<AttendanceRecord[]>> => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/attendance?${query}`);
  return res.json();
};

export const getShortageList = async (batchId: string, subjectId?: string): Promise<ApiResponse<AttendanceStats[]>> => {
  const query = subjectId ? `?subjectId=${subjectId}` : "";
  const res = await fetch(`${API_URL}/attendance/stats/${batchId}${query}`);
  return res.json();
};

export const submitLeaveRequest = async (data: any): Promise<ApiResponse<LeaveRequest>> => {
  const res = await fetch(`${API_URL}/attendance/leaves`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getLeaveRequests = async (params?: any): Promise<ApiResponse<LeaveRequest[]>> => {
  const query = params ? new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_URL}/attendance/leaves?${query}`);
  return res.json();
};

export const reviewLeave = async (id: string, data: any): Promise<ApiResponse<LeaveRequest>> => {
  const res = await fetch(`${API_URL}/attendance/leaves/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getHubStats = async (): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/attendance/hub-stats`);
  return res.json();
};

export const getTodaySchedule = async (): Promise<ApiResponse<any[]>> => {
  const res = await fetch(`${API_URL}/attendance/schedule`);
  return res.json();
};

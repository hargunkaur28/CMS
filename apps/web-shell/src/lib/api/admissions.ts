// FILE: apps/web-shell/src/lib/api/admissions.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

export const getEnquiries = async (params?: any): Promise<ApiResponse<any[]>> => {
  const query = params ? new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_URL}/admissions/enquiries?${query}`);
  return res.json();
};

export const createEnquiry = async (data: any): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateEnquiryStatus = async (id: string, status: string, note?: string): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/enquiries/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note }),
  });
  return res.json();
};

export const getApplications = async (params?: any): Promise<ApiResponse<any[]>> => {
  const query = params ? new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_URL}/admissions/applications?${query}`);
  return res.json();
};

export const submitApplication = async (formData: FormData): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/applications`, {
    method: "POST",
    body: formData, // FormData handles multipart/form-data automatically
  });
  return res.json();
};

export const updateApplicationStatus = async (id: string, status: string): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/applications/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const getSeats = async (): Promise<ApiResponse<any[]>> => {
  const res = await fetch(`${API_URL}/admissions/seats`);
  return res.json();
};

export const configureSeats = async (data: any): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/seats/configure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getAdmissionsReport = async (): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/reports`);
  return res.json();
};

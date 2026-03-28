// FILE: apps/web-shell/src/lib/api/admissions.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const getHeaders = (isMultipart = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const headers: any = {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  if (!isMultipart) headers["Content-Type"] = "application/json";
  return headers;
};

export const getEnquiries = async (params?: any): Promise<ApiResponse<any[]>> => {
  const query = params ? new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_URL}/admissions/enquiries?${query}`, { headers: getHeaders() });
  return res.json();
};

export const createEnquiry = async (data: any): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/enquiries`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateEnquiryStatus = async (id: string, status: string, note?: string): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/enquiries/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status, note }),
  });
  return res.json();
};

export const getApplications = async (params?: any): Promise<ApiResponse<any[]>> => {
  const query = params ? new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_URL}/admissions/applications?${query}`, { headers: getHeaders() });
  return res.json();
};

export const submitApplication = async (formData: FormData): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/applications`, {
    method: "POST",
    headers: getHeaders(true),
    body: formData,
  });
  return res.json();
};

export const updateApplicationStatus = async (id: string, status: string): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/applications/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const getSeats = async (): Promise<ApiResponse<any[]>> => {
  const res = await fetch(`${API_URL}/admissions/seats`, { headers: getHeaders() });
  return res.json();
};

export const configureSeats = async (data: any): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/seats/configure`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getAdmissionsReport = async (): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admissions/reports`, { headers: getHeaders() });
  return res.json();
};

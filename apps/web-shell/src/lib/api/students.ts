// FILE: apps/web-shell/src/lib/api/students.ts

const API_URL = "http://localhost:5005/api";

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

export const getStudents = async (params?: any): Promise<ApiResponse<any[]>> => {
  const query = params ? new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_URL}/students?${query}`, { headers: getHeaders() });
  return res.json();
};

export const getStudentById = async (id: string): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students/${id}`, { headers: getHeaders() });
  return res.json();
};

export const getMyStudent = async (): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students/me`, { headers: getHeaders() });
  return res.json();
};

export const createStudent = async (data: any): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateStudent = async (id: string, data: any): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const uploadPhoto = async (id: string, formData: FormData): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students/${id}/photo`, {
    method: "POST",
    headers: getHeaders(true),
    body: formData,
  });
  return res.json();
};

export const bulkImportStudents = async (formData: FormData): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
    headers: getHeaders(true),
    body: formData,
  });
  return res.json();
};

export const getStudentStats = async (): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students/stats`);
  return res.json();
};

export const getDepartments = async (): Promise<ApiResponse<any[]>> => {
  const res = await fetch(`${API_URL}/departments`);
  return res.json();
};

export const uploadDocuments = async (formData: FormData): Promise<ApiResponse<any[]>> => {
  const res = await fetch(`${API_URL}/students/upload-docs`, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

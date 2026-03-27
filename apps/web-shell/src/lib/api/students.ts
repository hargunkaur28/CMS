// FILE: apps/web-shell/src/lib/api/students.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const getStudents = async (params?: any): Promise<ApiResponse<any[]>> => {
  const query = params ? new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_URL}/students?${query}`);
  return res.json();
};

export const getStudentById = async (id: string): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students/${id}`);
  return res.json();
};

export const createStudent = async (data: any): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateStudent = async (id: string, data: any): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const uploadPhoto = async (id: string, formData: FormData): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students/${id}/photo`, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

export const bulkImportStudents = async (formData: FormData): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
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

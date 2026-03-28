// FILE: apps/web-shell/src/lib/api/academics.ts

const API_URL = "http://localhost:5005/api";

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// --- Departments ---
export const getDepartments = async (): Promise<any> => {
  const res = await fetch(`${API_URL}/departments`, { headers: getHeaders() });
  return res.json();
};

export const createDepartment = async (data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/departments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

// --- Courses ---
export const getCourses = async (): Promise<any> => {
  const res = await fetch(`${API_URL}/courses`, { headers: getHeaders() });
  return res.json();
};

export const createCourse = async (data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/courses`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

// --- Batches ---
export const getBatches = async (): Promise<any> => {
  const res = await fetch(`${API_URL}/batches`, { headers: getHeaders() });
  return res.json();
};

export const createBatch = async (data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/batches`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

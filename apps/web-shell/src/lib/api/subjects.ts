const API_URL = "http://localhost:5000/api";

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getSubjects = async (courseId?: string): Promise<any> => {
  const url = courseId ? `${API_URL}/subjects?courseId=${courseId}` : `${API_URL}/subjects`;
  const res = await fetch(url, { headers: getHeaders() });
  return res.json();
};

export const createSubject = async (data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/subjects`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

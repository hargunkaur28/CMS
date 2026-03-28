const API_URL = "http://localhost:5000/api";

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const markBulkAttendance = async (data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/attendance/bulk`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getAttendanceStats = async (batchId: string): Promise<any> => {
  const res = await fetch(`${API_URL}/attendance/stats/${batchId}`, { headers: getHeaders() });
  return res.json();
};

export const getHubStats = async (): Promise<any> => {
  const res = await fetch(`${API_URL}/attendance/hub-stats`, { headers: getHeaders() });
  return res.json();
};

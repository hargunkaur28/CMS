const API_URL = "http://localhost:5005/api";

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const createExam = async (data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/exams`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getExams = async (params: any = {}): Promise<any> => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/exams?${query}`, { headers: getHeaders() });
  return res.json();
};

export const getExamById = async (examId: string): Promise<any> => {
  const res = await fetch(`${API_URL}/exams/${examId}`, { headers: getHeaders() });
  return res.json();
};

export const updateExam = async (examId: string, data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/exams/${examId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const scheduleExam = async (examId: string): Promise<any> => {
  const res = await fetch(`${API_URL}/exams/${examId}/schedule`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  return res.json();
};

export const enterMarks = async (examId: string, data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/exams/${examId}/marks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMarks = async (examId: string, params: any = {}): Promise<any> => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/exams/${examId}/marks?${query}`, { headers: getHeaders() });
  return res.json();
};

export const bulkImportMarks = async (examId: string, data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/exams/${examId}/marks/bulk-import`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const publishResults = async (examId: string): Promise<any> => {
  const res = await fetch(`${API_URL}/exams/${examId}/publish`, {
    method: "POST",
    headers: getHeaders(),
  });
  return res.json();
};

export const getResults = async (params: any = {}): Promise<any> => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/exams/results?${query}`, { headers: getHeaders() });
  return res.json();
};

export const getHallTicket = async (studentId: string, examId: string): Promise<any> => {
  const res = await fetch(`${API_URL}/exams/hall-tickets/${studentId}/${examId}`, { headers: getHeaders() });
  return res.json();
};

export const generateExamAnalysis = async (examId: string): Promise<any> => {
  const res = await fetch(`${API_URL}/exams/reports/exam-analysis?examId=${examId}`, { headers: getHeaders() });
  return res.json();
};

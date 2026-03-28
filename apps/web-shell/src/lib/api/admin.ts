import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api/admin";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// --- Admissions ---

export const fetchEnquiries = async () => {
  const response = await axios.get(`${API_URL}/enquiries`, { headers: getAuthHeader() });
  return response.data;
};

export const updateEnquiryStatus = async (id: string, status: string) => {
  const response = await axios.put(`${API_URL}/enquiries/${id}`, { status }, { headers: getAuthHeader() });
  return response.data;
};

export const fetchApplications = async () => {
  const response = await axios.get(`${API_URL}/applications`, { headers: getAuthHeader() });
  return response.data;
};

export const updateApplicationStatus = async (id: string, status: string, rejectionReason?: string) => {
  const response = await axios.put(`${API_URL}/applications/${id}`, { status, rejectionReason }, { headers: getAuthHeader() });
  return response.data;
};

export const enrollStudent = async (data: { applicationId: string; batchId: string; section: string; rollNumber: string }) => {
  const response = await axios.post(`${API_URL}/applications/enroll`, data, { headers: getAuthHeader() });
  return response.data;
};

export const fetchAdmissionReports = async () => {
  const response = await axios.get(`${API_URL}/admissions/reports`, { headers: getAuthHeader() });
  return response.data;
};

// --- SIS (Student Information System) ---

export const fetchStudents = async (filters: any = {}) => {
  const response = await axios.get(`${API_URL}/students`, { 
    headers: getAuthHeader(),
    params: filters
  });
  return response.data;
};

export const fetchStudentById = async (id: string) => {
  const response = await axios.get(`${API_URL}/students/${id}`, { headers: getAuthHeader() });
  return response.data;
};

export const updateStudent = async (id: string, data: any) => {
  const response = await axios.put(`${API_URL}/students/${id}`, data, { headers: getAuthHeader() });
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await axios.delete(`${API_URL}/students/${id}`, { headers: getAuthHeader() });
  return response.data;
};

// --- Faculty Management ---

export const fetchFaculties = async (filters: any = {}) => {
  const response = await axios.get(`${API_URL}/faculty`, { 
    headers: getAuthHeader(),
    params: filters
  });
  return response.data;
};

export const fetchFacultyById = async (id: string) => {
  const response = await axios.get(`${API_URL}/faculty/${id}`, { headers: getAuthHeader() });
  return response.data;
};

export const createFaculty = async (data: any) => {
  const response = await axios.post(`${API_URL}/faculty`, data, { headers: getAuthHeader() });
  return response.data;
};

export const updateFaculty = async (id: string, data: any) => {
  const response = await axios.put(`${API_URL}/faculty/${id}`, data, { headers: getAuthHeader() });
  return response.data;
};

export const deleteFaculty = async (id: string) => {
  const response = await axios.delete(`${API_URL}/faculty/${id}`, { headers: getAuthHeader() });
  return response.data;
};

export const assignFacultySubjects = async (id: string, subjectIds: string[]) => {
  const response = await axios.put(`${API_URL}/faculty/${id}/assign`, { subjectIds }, { headers: getAuthHeader() });
  return response.data;
};

// --- Academics (Courses, Subjects, Batches) ---

export const fetchCourses = async () => {
  const response = await axios.get(`${API_URL}/courses`, { headers: getAuthHeader() });
  return response.data;
};

export const createCourse = async (data: any) => {
  const response = await axios.post(`${API_URL}/courses`, data, { headers: getAuthHeader() });
  return response.data;
};

export const fetchSubjects = async (filters: any = {}) => {
  const response = await axios.get(`${API_URL}/subjects`, { 
    headers: getAuthHeader(),
    params: filters
  });
  return response.data;
};

export const createSubject = async (data: any) => {
  const response = await axios.post(`${API_URL}/subjects`, data, { headers: getAuthHeader() });
  return response.data;
};

export const fetchBatches = async (filters: any = {}) => {
  const response = await axios.get(`${API_URL}/batches`, { 
    headers: getAuthHeader(),
    params: filters
  });
  return response.data;
};

export const createBatch = async (data: any) => {
  const response = await axios.post(`${API_URL}/batches`, data, { headers: getAuthHeader() });
  return response.data;
};

// --- Attendance Management ---

export const fetchAttendanceOverview = async () => {
  const response = await axios.get(`${API_URL}/attendance/overview`, { headers: getAuthHeader() });
  return response.data;
};

export const fetchAttendanceReports = async (params: any = {}) => {
  const response = await axios.get(`${API_URL}/attendance/reports`, { 
    headers: getAuthHeader(),
    params
  });
  return response.data;
};

export const fetchShortageList = async (threshold?: number) => {
  const response = await axios.get(`${API_URL}/attendance/shortage`, { 
    headers: getAuthHeader(),
    params: { threshold }
  });
  return response.data;
};

// --- Exams & Results ---

export const fetchExams = async (filters: any = {}) => {
  const response = await axios.get(`${API_URL}/exams`, { 
    headers: getAuthHeader(),
    params: filters
  });
  return response.data;
};

export const createExam = async (data: any) => {
  const response = await axios.post(`${API_URL}/exams`, data, { headers: getAuthHeader() });
  return response.data;
};

export const publishExamResults = async (examId: string) => {
  const response = await axios.post(`${API_URL}/exams/${examId}/publish`, {}, { headers: getAuthHeader() });
  return response.data;
};

export const fetchExamAnalysis = async (examId: string) => {
  const response = await axios.get(`${API_URL}/exams/reports/analysis`, { 
    headers: getAuthHeader(),
    params: { examId }
  });
  return response.data;
};

// --- Fee Management ---

export const fetchFeeStructures = async () => {
  const response = await axios.get(`${API_URL}/fees/structures`, { headers: getAuthHeader() });
  return response.data;
};

export const fetchPayments = async (filters: any = {}) => {
  const response = await axios.get(`${API_URL}/fees/payments`, { 
    headers: getAuthHeader(),
    params: filters
  });
  return response.data;
};

export const recordPayment = async (data: any) => {
  const response = await axios.post(`${API_URL}/fees/payments`, data, { headers: getAuthHeader() });
  return response.data;
};

export const fetchFinancialSummary = async () => {
  const response = await axios.get(`${API_URL}/fees/summary`, { headers: getAuthHeader() });
  return response.data;
};

// --- Communication & Notifications ---

export const fetchAnnouncements = async (filters: any = {}) => {
  const response = await axios.get(`${API_URL}/communication/announcements`, { 
    headers: getAuthHeader(),
    params: filters
  });
  return response.data;
};

export const createAnnouncement = async (data: any) => {
  const response = await axios.post(`${API_URL}/communication/announcements`, data, { headers: getAuthHeader() });
  return response.data;
};

export const fetchMessages = async () => {
  const response = await axios.get(`${API_URL}/communication/messages`, { headers: getAuthHeader() });
  return response.data;
};

export const sendMessage = async (data: any) => {
  const response = await axios.post(`${API_URL}/communication/messages`, data, { headers: getAuthHeader() });
  return response.data;
};

// --- NAAC & Compliance ---

export const fetchNaacDocuments = async (filters: any = {}) => {
  const response = await axios.get(`${API_URL}/naac/documents`, { 
    headers: getAuthHeader(),
    params: filters
  });
  return response.data;
};

export const uploadNaacDocument = async (data: any) => {
  const response = await axios.post(`${API_URL}/naac/documents`, data, { headers: getAuthHeader() });
  return response.data;
};

export const updateNaacStatus = async (id: string, status: string) => {
  const response = await axios.put(`${API_URL}/naac/documents/${id}/status`, { status }, { headers: getAuthHeader() });
  return response.data;
};

export const fetchNaacStats = async () => {
  const response = await axios.get(`${API_URL}/naac/stats`, { headers: getAuthHeader() });
  return response.data;
};

// --- General Dashboard Stats ---

export const fetchDashboardStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, { headers: getAuthHeader() });
  return response.data;
};

// --- Academic Assignments ---

export const fetchAssignments = async () => {
  const response = await axios.get(`${API_URL}/assignments`, { headers: getAuthHeader() });
  return response.data;
};

export const assignTeacher = async (payload: { teacherId: string; subjectId: string; batchId: string }) => {
  const response = await axios.post(`${API_URL}/assign-teacher`, payload, { headers: getAuthHeader() });
  return response.data;
};

export const removeTeacherAssignment = async (payload: { teacherId: string; subjectId: string; batchId: string }) => {
  const response = await axios.delete(`${API_URL}/assign-teacher`, { data: payload, headers: getAuthHeader() });
  return response.data;
};

export const assignStudentToBatch = async (payload: { studentId: string; batchId: string }) => {
  const response = await axios.post(`${API_URL}/assign-student-batch`, payload, { headers: getAuthHeader() });
  return response.data;
};

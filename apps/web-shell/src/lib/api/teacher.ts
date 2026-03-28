import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";
const TEACHER_URL = `${API_URL}/teacher`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

/** Fetch teacher dashboard aggregated stats */
export const fetchTeacherDashboardStats = async () => {
  const response = await axios.get(`${TEACHER_URL}/dashboard`, { headers: getAuthHeader() });
  return response.data;
};

/** Fetch only the batches this teacher is assigned to */
export const fetchMyBatches = async () => {
  const response = await axios.get(`${TEACHER_URL}/my-batches`, { headers: getAuthHeader() });
  return response.data;
};

/** Fetch subjects for this teacher, optionally filtered by batchId */
export const fetchMySubjects = async (batchId?: string) => {
  const url = batchId ? `${TEACHER_URL}/my-subjects?batchId=${batchId}` : `${TEACHER_URL}/my-subjects`;
  const response = await axios.get(url, { headers: getAuthHeader() });
  return response.data;
};

/** Fetch today's timetable */
export const fetchTodayTimetable = async () => {
  const response = await axios.get(`${TEACHER_URL}/timetable/today`, { headers: getAuthHeader() });
  return response.data;
};

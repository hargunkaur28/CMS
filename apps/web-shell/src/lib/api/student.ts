import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

/**
 * Fetch the logged-in student's profile
 */
export const fetchMyProfile = async () => {
  const response = await axios.get(`${API_URL}/students/me`, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch the logged-in student's attendance records
 */
export const fetchMyAttendance = async () => {
  const response = await axios.get(`${API_URL}/attendance/me`, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch the logged-in student's results
 */
export const fetchMyResults = async () => {
  const response = await axios.get(`${API_URL}/exams/results`, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch the logged-in student's full weekly timetable
 */
export const fetchMyTimetable = async () => {
  const response = await axios.get(`${API_URL}/students/timetable`, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch the logged-in student's schedule for today
 */
export const fetchMyTodaySchedule = async () => {
  const response = await axios.get(`${API_URL}/students/timetable/today`, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch the logged-in student's financial portfolio
 */
export const fetchMyFees = async () => {
  const response = await axios.get(`${API_URL}/students/fees`, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch the logged-in student's academic materials (PDFs, Notes)
 */
export const fetchMyMaterials = async () => {
  const response = await axios.get(`${API_URL}/students/materials`, { headers: getAuthHeader() });
  return response.data;
};


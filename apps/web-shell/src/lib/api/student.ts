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
 * Fetch the logged-in student's timetable
 * (Note: Currently uses general timetable, but can be filtered in the future)
 */
export const fetchMyTimetable = async () => {
  const response = await axios.get(`${API_URL}/teacher/timetable`, { headers: getAuthHeader() });
  return response.data;
};

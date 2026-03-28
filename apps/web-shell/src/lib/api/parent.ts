import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api/parent";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

/**
 * Fetch the linked student's profile (from parent context)
 */
export const fetchMyStudentProfile = async () => {
  const response = await axios.get(`${API_URL}/me/student`, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch the linked student's attendance (from parent context)
 */
export const fetchMyStudentAttendance = async () => {
  const response = await axios.get(`${API_URL}/me/attendance`, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch the linked student's results (from parent context)
 */
export const fetchMyStudentResults = async () => {
  const response = await axios.get(`${API_URL}/me/results`, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch a comprehensive overview of all linked children (Legacy)
 */
export const fetchChildrenOverview = async () => {
  const response = await axios.get(`${API_URL}/children/overview`, { headers: getAuthHeader() });
  return response.data;
};

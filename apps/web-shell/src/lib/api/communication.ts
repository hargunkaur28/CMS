import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

const getRole = (): string => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.role || "STUDENT";
  } catch {
    return "STUDENT";
  }
};

/**
 * Get the base URL prefix for communication endpoints based on role
 */
const getCommBase = (): string => {
  const role = getRole();
  if (role === "PARENT") return `${API_URL}/parent/me`;
  return `${API_URL}/students`;
};

/**
 * Fetch announcements (batch-filtered for students, child-filtered for parents)
 */
export const fetchMyAnnouncements = async () => {
  const base = getCommBase();
  const response = await axios.get(`${base}/announcements`, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch the list of teachers assigned to the student's/child's batch
 */
export const fetchMyTeachers = async () => {
  const role = getRole();
  const base = role === "PARENT" ? `${API_URL}/parent/me` : `${API_URL}/students`;
  const response = await axios.get(`${base}/teachers${role === "PARENT" ? "" : ""}`, {
    headers: getAuthHeader(),
  });
  // Parent uses /me/teachers, Student uses /my-teachers
  return response.data;
};

/**
 * Correctly routed teacher fetch
 */
export const fetchTeachersForRole = async () => {
  const role = getRole();
  let url: string;
  if (role === "PARENT") {
    url = `${API_URL}/parent/me/teachers`;
  } else {
    url = `${API_URL}/students/my-teachers`;
  }
  const response = await axios.get(url, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Fetch conversation thread with a specific user
 */
export const fetchConversation = async (otherUserId: string) => {
  const base = getCommBase();
  const response = await axios.get(`${base}/messages/${otherUserId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Send a direct message
 */
export const sendDirectMessage = async (receiverId: string, content: string) => {
  const base = getCommBase();
  const response = await axios.post(
    `${base}/messages`,
    { receiverId, content },
    { headers: getAuthHeader() }
  );
  return response.data;
};

/**
 * Get count of unread messages
 */
export const fetchUnreadCount = async () => {
  const base = getCommBase();
  const response = await axios.get(`${base}/messages/unread-count`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Mark a specific message as read
 */
export const markMessageAsRead = async (messageId: string) => {
  const base = getCommBase();
  const response = await axios.put(
    `${base}/messages/${messageId}/read`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

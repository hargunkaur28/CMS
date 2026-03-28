import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api/library";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

/**
 * Fetch books with optional filtering
 */
export const fetchBooks = async (filters: { search?: string; category?: string } = {}) => {
  const response = await axios.get(API_URL, { 
    headers: getAuthHeader(),
    params: filters
  });
  return response.data;
};

/**
 * Add a new book (Admin only)
 */
export const addBook = async (data: any) => {
  const response = await axios.post(API_URL, data, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Update a book (Admin only)
 */
export const updateBook = async (id: string, data: any) => {
  const response = await axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeader() });
  return response.data;
};

/**
 * Delete a book (Admin only)
 */
export const deleteBook = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
  return response.data;
};

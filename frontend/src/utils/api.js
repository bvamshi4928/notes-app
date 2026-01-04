import axios from "axios";

export const API_BASE_URL = "http://3.135.190.15:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Attach JWT from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

import axios from "axios";
import { auth } from "../config/firebase";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    // 1. Prioritize token from localStorage for immediate availability
    let token = localStorage.getItem("token");

    // 2. Fallback: If not in localStorage, try getting it from Firebase auth
    if (!token && auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
        if (token) localStorage.setItem("token", token);
      } catch (error) {
        console.warn("Failed to get token from Firebase:", error.message);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

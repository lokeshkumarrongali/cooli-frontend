import axios from "axios";
import { auth } from "../config/firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request Interceptor to attach Authorization header
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        // Token error handled silently; retry logic will catch it if needed
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

import { io } from "socket.io-client";

// Ensure backend socket points to your correct backend URL (5000 is default local backend port)
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  auth: {
    token: localStorage.getItem("token")
  }
});

export default socket;

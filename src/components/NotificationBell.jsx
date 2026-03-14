import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import NotificationDropdown from "./NotificationDropdown";
import { showToast } from "./ToastNotifications";
import socket from "../services/socket";
import { useUserProfile } from "../context/useUserProfile";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { profileData } = useUserProfile();

  // ---- Fetch ----
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data?.data) setNotifications(res.data.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // ---- Close on outside click ----
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ---- Real-time socket: prepend new notif + fire toast ----
  useEffect(() => {
    if (!profileData?._id) return;
    socket.connect();
    socket.emit("register", profileData._id);
    socket.on("notification", (newNotif) => {
      setNotifications(prev => [{ ...newNotif, isRead: false, read: false }, ...prev]);
      showToast(newNotif);
    });
    return () => {
      socket.off("notification");
    };
  }, [profileData?._id]);

  // ---- Actions ----
  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length;

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>

      {/* Bell button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "6px",
          position: "relative",
          lineHeight: 1
        }}
        title="Notifications"
        aria-label="Notifications"
      >
        {/* SVG bell icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block", color: "var(--color-text, #333)" }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "0px",
            right: "0px",
            background: "#e03131",
            color: "white",
            fontSize: "9px",
            fontWeight: "700",
            borderRadius: "50%",
            minWidth: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 2px",
            lineHeight: 1,
            transform: "translate(30%, -20%)"
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllRead}
          unreadCount={unreadCount}
        />
      )}
    </div>
  );
}

export default NotificationBell;

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";
import { useUserProfile } from "../context/useUserProfile";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import socket from "../services/socket";
import api from "../api/axios";
import { sanitizeImageUrl } from "../api/imageUtils";

function Navbar() {
  const { logout, firebaseUser, isAuthenticated } = useAuth();
  const { activeRole } = useRole();
  const { profileData } = useUserProfile();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profileData?._id || !isAuthenticated) return;

    // Initial fetch
    api.get("/chat/unread-count")
       .then(res => setUnreadCount(res.data.data.count))
       .catch(() => {});

    // Listen for new messages
    const handleNewMessage = (msg) => {
      if (msg.senderId !== profileData._id && !msg.read) {
        setUnreadCount(prev => prev + 1);
      }
    };

    if (!socket.connected) {
      socket.auth.token = localStorage.getItem("token");
      socket.connect();
    }
    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
    };
  }, [profileData]);

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  const handleLogout = async () => {
    await logout();
    socket.disconnect();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-secondary-brand">
        <Logo size="sm" />
      </div>

      <div className="navbar-links">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        
        {activeRole === "worker" && (
          <>
            <NavLink to="/worker/home" className={linkClass}>
              Worker Home
            </NavLink>
            <NavLink to="/worker/jobs" className={linkClass}>
              Find Jobs
            </NavLink>
            <NavLink to="/worker/profile" className={linkClass}>
              Profile
            </NavLink>
          </>
        )}

        {activeRole === "employer" && (
          <>
            <NavLink to="/employer/home" className={linkClass}>Employer Home</NavLink>
            <NavLink to="/employer/jobs" className={linkClass}>My Jobs</NavLink>
            <NavLink to="/workers" className={linkClass}>Find Workers</NavLink>
            <NavLink to="/employer/profile" className={linkClass}>Business Profile</NavLink>
          </>
        )}
      </div>

      <div className="navbar-user">
        {firebaseUser && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="navbar-user-info" style={{ textAlign: "right", display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                {profileData?.sharedProfile?.name || firebaseUser.email.split('@')[0]}
              </span>
              <span style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--color-primary)", fontWeight: "bold" }}>
                {activeRole ? `${activeRole} Mode` : "Select Role"}
              </span>
            </div>

            <div style={{ position: "relative" }}>
              <NotificationBell />
            </div>

            <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "#f8f9fa", border: "1px solid var(--color-border)" }} onClick={() => { setUnreadCount(0); navigate("/messages"); }}>
              <span style={{ fontSize: "1.2rem" }}>✉️</span>
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: -2, right: -2, background: "red", color: "white", fontSize: "10px", fontWeight: "bold", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>

            <img 
              src={sanitizeImageUrl(profileData?.sharedProfile?.photo)} 
              alt="Avatar" 
              className="navbar-avatar"
              onClick={() => navigate(activeRole ? `/${activeRole}/profile` : "/dashboard")}
            />
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

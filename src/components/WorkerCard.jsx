import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { sanitizeImageUrl } from "../api/imageUtils";

function WorkerCard({ worker }) {
  const navigate = useNavigate();

  const avatarUrl = sanitizeImageUrl(worker.photo, `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker._id}`);

  const stars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return Array(5).fill(0).map((_, i) => {
      if (i < full) return "★";
      if (i === full && half) return "½";
      return "☆";
    }).join("");
  };

  const getAvailabilityBadge = (status) => {
    switch (status) {
      case "available": return <span style={{ color: "#2ecc71", fontSize: "12px", fontWeight: "bold" }}>🟢 Available Now</span>;
      case "busy": return <span style={{ color: "#f1c40f", fontSize: "12px", fontWeight: "bold" }}>🟡 Busy</span>;
      case "offline": return <span style={{ color: "#e74c3c", fontSize: "12px", fontWeight: "bold" }}>🔴 Not Available</span>;
      default: return <span style={{ color: "#2ecc71", fontSize: "12px", fontWeight: "bold" }}>🟢 Available Now</span>;
    }
  };

  const startChat = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.post("/chat/conversations", {
        otherUserId: worker._id
      });
      const conversationId = res.data.data._id;
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      alert("Failed to start chat.");
      console.error(error);
    }
  };

  return (
    <div
      className="card interactive-card"
      style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {/* Avatar + name row */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <img
          src={avatarUrl}
          alt={worker.name}
          style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)", flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: "0 0 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {worker.name}
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#f59f00", fontSize: "13px", letterSpacing: "1px" }}>
              {stars(worker.rating)}
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              {worker.rating > 0 ? worker.rating.toFixed(1) : "No rating"} ({worker.totalReviews})
            </span>
          </div>
          <div style={{ marginTop: "4px" }}>
            {getAvailabilityBadge(worker.availability)}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {worker.skills?.slice(0, 4).map((skill, i) => (
          <span key={i} className="badge badge-role" style={{ fontSize: "11px" }}>{skill}</span>
        ))}
        {worker.skills?.length > 4 && (
          <span className="badge badge-role" style={{ fontSize: "11px" }}>+{worker.skills.length - 4}</span>
        )}
        {(!worker.skills || worker.skills.length === 0) && (
          <span className="text-muted" style={{ fontSize: "12px" }}>No skills listed</span>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--color-text-muted)" }}>
        <span>Exp: <strong>{worker.experience}</strong></span>
        <span>{worker.jobsCompleted} jobs done</span>
        {worker.expectedWage && (
          <span style={{ color: "#0ca678", fontWeight: "bold" }}>Rs.{worker.expectedWage}/day</span>
        )}
      </div>

      {/* Location */}
      <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {worker.location}
      </p>

      {/* Action */}
      <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
          onClick={() => navigate(`/workers/${worker._id}`)}
        >
          View Profile
        </button>
        <button
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, border: "1px solid var(--color-primary)", color: "var(--color-primary)" }}
          onClick={startChat}
        >
          Chat
        </button>
      </div>
    </div>
  );
}

export default WorkerCard;

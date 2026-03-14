import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function ApplicantCard({ applicant, jobId, onStatusUpdate }) {
  const navigate = useNavigate();
  const worker = applicant.workerId;
  const status = applicant.status || "applied"; // "applied", "hired", "rejected"
  
  if (!worker) return null;

  const getAvailabilityBadge = (status) => {
    switch (status) {
      case "available": return <span style={{ color: "#2ecc71", fontSize: "12px", fontWeight: "bold" }}>🟢 Available Now</span>;
      case "busy": return <span style={{ color: "#f1c40f", fontSize: "12px", fontWeight: "bold" }}>🟡 Busy</span>;
      case "offline": return <span style={{ color: "#e74c3c", fontSize: "12px", fontWeight: "bold" }}>🔴 Not Available</span>;
      default: return <span style={{ color: "#2ecc71", fontSize: "12px", fontWeight: "bold" }}>🟢 Available Now</span>;
    }
  };

  const handleHire = async () => {
    try {
      await api.post(`/jobs/${jobId}/hire`, { workerId: worker._id });
      onStatusUpdate(worker._id, "hired");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to hire worker");
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/jobs/${jobId}/reject`, { workerId: worker._id });
      onStatusUpdate(worker._id, "rejected");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject worker");
    }
  };

  const startChat = async () => {
    try {
      const res = await api.post("/chat/conversations", {
        otherUserId: worker._id,
        jobId: jobId
      });
      const conversationId = res.data.data._id;
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      alert("Failed to start chat.");
      console.error(error);
    }
  };

  const viewProfile = () => {
    navigate(`/workers/${worker._id}`);
  };

  return (
    <div className="card" style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
      <img 
        src={worker.sharedProfile?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (worker.name || 'User')} 
        alt="Worker Avatar" 
        style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)" }}
      />
      
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: "0 0 5px 0", display: "flex", gap: "10px", alignItems: "center" }}>
          {worker.sharedProfile?.name || worker.name}
          {getAvailabilityBadge(worker.workerProfile?.availability)}
        </h3>
        
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
          <span className="badge badge-role">★ {worker.workerProfile?.stats?.rating || "New"}</span>
          <span className="text-muted" style={{ fontSize: "12px" }}>
            Experience: {worker.workerProfile?.experience || "Not specified"}
          </span>
        </div>
        
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "15px" }}>
          {worker.workerProfile?.skills?.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="badge badge-verified" style={{ fontSize: "10px" }}>{skill}</span>
          ))}
          {worker.workerProfile?.skills?.length > 3 && (
            <span className="badge badge-verified" style={{ fontSize: "10px" }}>+{worker.workerProfile.skills.length - 3}</span>
          )}
        </div>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "120px" }}>
        {status === "applied" && (
          <>
            <button className="btn btn-primary btn-sm" onClick={handleHire}>
              Hire
            </button>
            <button className="btn btn-secondary btn-sm" style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }} onClick={handleReject}>
              Reject
            </button>
          </>
        )}
        
        {status === "hired" && (
          <div style={{ textAlign: "center", padding: "8px", background: "#d3f9d8", color: "#2b8a3e", borderRadius: "6px", fontWeight: "bold", fontSize: "14px" }}>
            ✔ Hired
          </div>
        )}

        {status === "rejected" && (
          <div style={{ textAlign: "center", padding: "8px", background: "#ffe3e3", color: "#c92a2a", borderRadius: "6px", fontWeight: "bold", fontSize: "14px" }}>
            ❌ Rejected
          </div>
        )}

        <button className="btn btn-secondary btn-sm" style={{ border: "1px solid var(--color-border)" }} onClick={viewProfile}>
          View Profile
        </button>
        <button className="btn btn-secondary btn-sm" style={{ border: "1px solid var(--color-primary)", color: "var(--color-primary)" }} onClick={startChat}>
          Chat
        </button>
      </div>
    </div>
  );
}

export default ApplicantCard;

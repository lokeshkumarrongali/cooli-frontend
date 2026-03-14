import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function JobCard({ job, initiallySaved = false, onRemoveSaved }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(initiallySaved);
  const [loading, setLoading] = useState(false);

  const handleSaveJob = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (saved) {
        await api.delete(`/jobs/${job._id || job.id}/save`);
        setSaved(false);
        if (onRemoveSaved) onRemoveSaved(job._id || job.id);
      } else {
        await api.post(`/jobs/${job._id || job.id}/save`);
        setSaved(true);
      }
    } catch (error) {
      console.error("Failed to toggle save state", error);
      alert("Error saving job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card interactive-card" style={{ padding: "var(--space-4)" }} onClick={() => navigate(`/jobs/${job._id || job.id}`)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h4 style={{ margin: 0, color: "var(--color-primary)" }}>{job.title}</h4>
          <p className="text-muted" style={{ fontSize: "12px", margin: "5px 0" }}>
            📍 {job.location?.address || job.location || "Location Unknown"} • {job.jobType || "Full-time"}
          </p>
          <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
            {job.requiredSkills?.map((skill, sIdx) => (
              <span key={sIdx} className="badge badge-role">{skill}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontWeight: "700", color: "#0ca678", display: "block" }}>₹{job.wage}/day</span>
          <button 
            className="btn btn-sm"
            style={{ 
              marginTop: "10px", 
              backgroundColor: saved ? "transparent" : "var(--color-bg-muted)",
              border: saved ? "1px solid red" : "1px solid var(--color-border)",
              color: saved ? "red" : "var(--text-color)" 
            }} 
            onClick={handleSaveJob}
            disabled={loading}
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job._id || job.id}`) }}>Apply</button>
        {saved && onRemoveSaved && (
          <button className="btn btn-secondary btn-sm" onClick={handleSaveJob}>Remove</button>
        )}
      </div>
    </div>
  );
}

export default JobCard;

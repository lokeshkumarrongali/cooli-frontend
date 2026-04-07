import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useRole } from "../context/RoleContext";
import { useUserProfile } from "../context/useUserProfile";

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeRole } = useRole();
  const navigate = useNavigate();
  const { profileData } = useUserProfile();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        if (response.data?.data) {
          setJob(response.data.data);
        }
      } catch (err) {
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  const handleApply = async () => {
    try {
      await api.post(`/jobs/${id}/apply`, { workerId: profileData?._id });
      alert("Successfully applied for this job!");
      navigate("/worker/home");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply for job");
    }
  };

  if (loading) return <div className="page-container"><p>Loading job details...</p></div>;
  if (error) return <div className="page-container"><p className="text-muted">{error}</p></div>;
  if (!job) return <div className="page-container"><p className="text-muted">Job not found.</p></div>;

  return (
    <div className="page-container">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: "var(--space-4)" }}>← Back</button>
      
      <div className="card" style={{ marginBottom: "var(--space-6)", padding: "var(--space-6)" }}>
        <h1 className="page-title" style={{ color: "var(--color-primary)", marginBottom: "var(--space-2)" }}>{job.title}</h1>
        <p className="text-muted" style={{ display: "flex", gap: "var(--space-4)", fontSize: "14px", marginBottom: "var(--space-5)" }}>
          <span>📍 {job.location?.address || "Remote / Unspecified"}</span>
          <span>💼 {job.jobType}</span>
          <span style={{ fontWeight: "700", color: "#0ca678" }}>₹{job.wage}</span>
        </p>

        <div className="section-header">
          <span className="section-icon">📝</span>
          <h3 style={{ margin: 0 }}>Description</h3>
        </div>
        <p style={{ lineHeight: "1.6", marginBottom: "var(--space-5)" }}>{job.description || "No specific details provided."}</p>

        <div className="section-header">
          <span className="section-icon">🛠️</span>
          <h3 style={{ margin: 0 }}>Required Skills</h3>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "var(--space-5)" }}>
          {job.requiredSkills?.map((skill, idx) => (
            <span key={idx} className="badge badge-role" style={{ padding: "8px 12px" }}>{skill}</span>
          ))}
          {(!job.requiredSkills || job.requiredSkills.length === 0) && <span className="text-muted">General labor</span>}
        </div>

        <div className="section-header">
          <span className="section-icon">🏢</span>
          <h3 style={{ margin: 0 }}>Employer Info</h3>
        </div>
        <p className="prop-value" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <strong>{job.employerId?.employerProfile?.businessName || job.employerId?.sharedProfile?.name || "Private Employer"}</strong>
          {job.employerId?.employerProfile?.businessDocuments?.length > 0 && <span className="badge badge-verified" style={{ fontSize: "10px" }}>✔ Business Verified</span>}
          {job.employerId?.employerProfile?.businessType && ` (${job.employerId.employerProfile.businessType})`}
        </p>
      </div>

      {activeRole === "worker" && job.status === "open" && (
        <button className="btn btn-primary" style={{ width: "100%", padding: "var(--space-4)", fontSize: "1.1rem" }} onClick={handleApply}>
          Apply for this Job
        </button>
      )}

      {activeRole === "worker" && job.status === "in-progress" && job.hiredWorker === profileData?._id && (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-4)", border: "2px solid #0ca678", backgroundColor: "#e6fcf5" }}>
          <h3 style={{ color: "#0ca678", margin: 0 }}>You are hired for this job!</h3>
          <p className="text-muted" style={{ margin: "5px 0 0 0" }}>Work is currently in progress.</p>
        </div>
      )}

      {activeRole === "worker" && job.status === "completed" && job.hiredWorker === profileData?._id && (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <div className="card" style={{ textAlign: "center", padding: "var(--space-4)", backgroundColor: "var(--color-bg-muted)" }}>
            <h3 style={{ margin: 0 }}>Job Completed!</h3>
            <p className="text-muted" style={{ margin: "5px 0 0 0" }}>Great work! Make sure to rate your employer.</p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "var(--space-4)", fontSize: "1.1rem" }} 
            onClick={() => navigate(`/reviews/new?jobId=${job._id}&receiverId=${job.employerId._id}`)}
          >
            Leave a Review for Employer
          </button>
        </div>
      )}
    </div>
  );
}

export default JobDetails;

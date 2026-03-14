import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../../context/useUserProfile";
import api from "../../api/axios";
import JobCard from "../../components/JobCard";

function WorkerHome() {
  const navigate = useNavigate();
  const { profileData } = useUserProfile();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  const firstName = profileData?.sharedProfile?.name?.split(' ')[0] || "Worker";

  const calculateCompletion = () => {
    let score = 0;
    const fields = [
      profileData?.sharedProfile?.photo,
      profileData?.sharedProfile?.bio,
      profileData?.workerProfile?.skills?.length > 0,
      profileData?.workerProfile?.experience,
      profileData?.sharedProfile?.address?.village || profileData?.sharedProfile?.address?.district,
      profileData?.workerProfile?.portfolio?.length > 0
    ];
    fields.forEach(field => {
      if (field) score += Math.ceil(100 / fields.length); 
    });
    return Math.min(score, 100);
  };
  
  const completionScore = calculateCompletion();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const skillsArray = profileData?.workerProfile?.skills || [];
        const skillsQuery = skillsArray.join(",");
        
        let url = "/jobs"; // Fallback to all jobs if no skills
        if (skillsQuery) {
          url = `/jobs/search?q=${skillsQuery}`;
        }
        
        const response = await api.get(url);
        if (response.data?.data) {
          setRecommendedJobs(response.data.data.slice(0, 3)); // Top 3
        }
      } catch (error) {
        console.error("Failed to load recommendations", error);
      }
    };
    if (profileData) {
      fetchRecommendations();
    }
  }, [profileData]);

  useEffect(() => {
    api.get("/users/saved-jobs").then(res => {
      if (res.data?.data) {
        setSavedJobIds(new Set(res.data.data.map(j => j._id || j.id)));
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="page-container">
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 className="page-title" style={{ color: "var(--color-primary)" }}>Good Morning, {firstName}!</h1>
        <p className="text-muted">You are currently in <strong>Worker Mode</strong>. Here is your activity overview.</p>
        
        <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "var(--color-bg-muted)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <strong style={{ fontSize: "14px" }}>Profile Completion ({completionScore}%)</strong>
            {completionScore < 100 && <span style={{ fontSize: "12px", color: "var(--color-primary)", cursor: "pointer", fontWeight: "bold" }} onClick={() => navigate("/worker/profile")}>Complete Profile</span>}
          </div>
          <div style={{ width: "100%", height: "10px", backgroundColor: "#e9ecef", borderRadius: "5px", overflow: "hidden" }}>
            <div style={{ width: `${completionScore}%`, height: "100%", backgroundColor: completionScore === 100 ? "#0ca678" : "var(--color-primary)", transition: "width 0.3s ease" }}></div>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        <div className="card" style={{ borderLeft: "4px solid #0ca678" }}>
          <span className="stat-label">Worker Rating</span>
          <span className="stat-value" style={{ color: "#0ca678" }}>{profileData?.workerProfile?.stats?.rating || "0.0"} <span style={{ fontSize: "18px" }}>★</span></span>
          <p style={{ fontSize: "10px", marginTop: "5px" }}>{profileData?.workerProfile?.stats?.totalReviews || 0} Reviews</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
          <span className="stat-label">Jobs Completed</span>
          <span className="stat-value">{profileData?.workerProfile?.stats?.jobsCompleted || 0}</span>
          <p style={{ fontSize: "10px", marginTop: "5px" }}>Successfully finished</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #1c7ed6" }}>
          <span className="stat-label">Available Jobs</span>
          <span className="stat-value">View All</span>
          <button className="btn btn-primary btn-sm" style={{ marginTop: "10px", width: "100%" }} onClick={() => navigate("/worker/jobs")}>Browse Directory</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}>
        <div>
          <div className="section-header">
            <span className="section-icon">⭐</span>
            <h3 style={{ margin: 0 }}>Recommended Jobs For You</h3>
          </div>
          
          {recommendedJobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "30px" }}>
              <p className="text-muted">No specific recommendations right now. Ensure your skills are added!</p>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate("/worker/jobs")}>Browse All Jobs</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "15px" }}>
              {recommendedJobs.map((job, idx) => (
                <JobCard 
                  key={job._id || idx}
                  job={job}
                  initiallySaved={savedJobIds.has(job._id || job.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="section-header">
            <h3 style={{ margin: 0 }}>Quick Actions</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate("/worker/profile")}>
              Update My Profile
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }}>
              Set Availability
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => navigate("/dashboard")}>
              Switch to Employer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerHome;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import JobCard from "../../components/JobCard";
import { useUserProfile } from "../../context/useUserProfile";

function SavedJobs() {
  const navigate = useNavigate();
  const { profileData } = useUserProfile();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await api.get("/users/saved-jobs");
        if (response.data && response.data.data) {
          setSavedJobs(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load saved jobs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, []);

  const handleRemove = (jobId) => {
    setSavedJobs(prev => prev.filter(job => (job._id || job.id) !== jobId));
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="page-title" style={{ color: "var(--color-primary)" }}>Saved Jobs</h1>
        <p className="text-muted">Review and apply to jobs you have bookmarked.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}><p className="text-muted">Loading saved jobs...</p></div>
      ) : savedJobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-8)" }}>
          <h3 className="mt-4">No saved jobs yet</h3>
          <p className="text-muted">Browse jobs and save them for later.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate("/worker/jobs")}>Browse Jobs</button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {savedJobs.map((job, idx) => (
            <JobCard 
              key={idx} 
              job={job} 
              workerId={profileData?._id}
              initiallySaved={true} 
              onRemoveSaved={handleRemove} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedJobs;

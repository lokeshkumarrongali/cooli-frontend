import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployerJobs = async () => {
      try {
        const response = await api.get("/jobs/employer");
        if (response.data?.data) {
          setJobs(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch employer jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployerJobs();
  }, []);

  const handleComplete = async (jobId) => {
    if(!window.confirm("Are you sure you want to mark this job as completed?")) return;
    try {
      await api.post(`/jobs/${jobId}/complete`);
      alert("Job marked as completed!");
      setJobs(jobs.map(j => j._id === jobId ? { ...j, status: "completed" } : j));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to complete job");
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 className="page-title">My Posted Jobs</h1>
          <p className="text-muted">Manage your active projects and review candidates.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/employer/post-job")}>+ Post Job</button>
      </div>

      {loading ? (
        <p>Loading your jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-8)" }}>
          <span style={{ fontSize: "3rem" }}>📋</span>
          <h3 className="mt-4">You haven't posted any jobs yet</h3>
          <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>Create your first job listing to start hiring today.</p>
          <button className="btn btn-primary" onClick={() => navigate("/employer/post-job")}>Create Job Posting</button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {jobs.map(job => (
            <div key={job._id} className="card interactive-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>{job.title}</h3>
                <p className="text-muted" style={{ fontSize: "12px", margin: "0 0 10px 0" }}>
                  Posted on: {new Date(job.createdAt).toLocaleDateString()} • Status: <span style={{ textTransform: "capitalize", fontWeight: "bold", color: job.status === "open" ? "#0ca678" : job.status === "completed" ? "gray" : "#e67700" }}>{job.status}</span>
                </p>
                <div>
                  <span className="badge badge-role" style={{ backgroundColor: "#e6f7ff", color: "#1890ff", textTransform: "uppercase" }}>
                    {job.applicants?.length || 0} APPLICANTS
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  View Job
                </button>
                {job.status === "open" && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/employer/jobs/${job._id}/applicants`)}
                    disabled={job.applicants?.length === 0}
                  >
                    Review Applicants
                  </button>
                )}
                {job.status === "in-progress" && (
                  <button 
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: "#0ca678", border: "none" }}
                    onClick={() => handleComplete(job._id)}
                  >
                    Complete Job
                  </button>
                )}
                {job.status === "completed" && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/reviews/new?jobId=${job._id}&receiverId=${job.hiredWorker?._id}`)}
                    disabled={!job.hiredWorker?._id}
                  >
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployerJobs;

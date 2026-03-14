import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../../context/useUserProfile";
import api from "../../api/axios";

function EmployerHome() {
  const navigate = useNavigate();
  const { profileData } = useUserProfile();
  const [jobs, setJobs] = useState([]);

  const businessName = profileData?.employerProfile?.businessName || "Employer";

  const calculateCompletion = () => {
    let score = 0;
    const fields = [
      profileData?.sharedProfile?.photo,
      profileData?.employerProfile?.businessName,
      profileData?.employerProfile?.companyDescription,
      profileData?.sharedProfile?.address?.village || profileData?.sharedProfile?.address?.district,
      profileData?.employerProfile?.businessDocuments?.length > 0
    ];
    fields.forEach(field => {
      if (field) score += 20; 
    });
    return score;
  };
  
  const completionScore = calculateCompletion();

  useEffect(() => {
    const fetchEmployerJobs = async () => {
      try {
        const response = await api.get("/jobs/employer");
        if (response.data?.data) {
          setJobs(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load jobs", error);
      }
    };
    fetchEmployerJobs();
  }, []);

  const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'in-progress');
  const openJobs = jobs.filter(j => j.status === 'open');
  const totalApplicants = openJobs.reduce((acc, job) => acc + (job.applicants?.length || 0), 0);
  const workersHired = profileData?.employerProfile?.stats?.workersHired || 0;

  return (
    <div className="page-container">
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 className="page-title" style={{ color: "#1c7ed6" }}>Welcome, {businessName}</h1>
        <p className="text-muted">You are in <strong>Employer Mode</strong>. Manage your workforce and active projects.</p>

        <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "var(--color-bg-muted)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <strong style={{ fontSize: "14px" }}>Verification & Profile ({completionScore}%)</strong>
            {completionScore < 100 && <span style={{ fontSize: "12px", color: "var(--color-primary)", cursor: "pointer", fontWeight: "bold" }} onClick={() => navigate("/employer/profile")}>Complete Verification</span>}
          </div>
          <div style={{ width: "100%", height: "10px", backgroundColor: "#e9ecef", borderRadius: "5px", overflow: "hidden" }}>
            <div style={{ width: `${completionScore}%`, height: "100%", backgroundColor: completionScore === 100 ? "#1c7ed6" : "#e67700", transition: "width 0.3s ease" }}></div>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        <div className="card" style={{ borderLeft: "4px solid #1c7ed6" }}>
          <span className="stat-label">Active Jobs</span>
          <span className="stat-value" style={{ color: "#1c7ed6" }}>{activeJobs.length}</span>
          <p style={{ fontSize: "10px", marginTop: "5px" }}>Currently running or open</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #e67700" }}>
          <span className="stat-label">New Applicants</span>
          <span className="stat-value" style={{ color: "#e67700" }}>{totalApplicants}</span>
          <p style={{ fontSize: "10px", marginTop: "5px" }}>Review needed</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #0ca678" }}>
          <span className="stat-label">Workers Hired</span>
          <span className="stat-value" style={{ color: "#0ca678" }}>{workersHired}</span>
          <p style={{ fontSize: "10px", marginTop: "5px" }}>Lifetime hires</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}>
        <div>
          <div className="section-header">
            <h3 style={{ margin: 0 }}>Current Active Projects</h3>
          </div>
          
          {activeJobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "30px" }}>
              <p className="text-muted">No active projects running at the moment.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/employer/post-job")}>Post a Job</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "15px" }}>
              {activeJobs.slice(0, 3).map((job) => (
                <div key={job._id} className="card interactive-card" style={{ padding: "var(--space-4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{job.title}</h4>
                      <p className="text-muted" style={{ fontSize: "12px", margin: "5px 0" }}>
                        {job.status === "open" ? `${job.applicants?.length || 0} applicants` : "1 Worker Assigned"} • {job.jobType}
                      </p>
                      <div style={{ marginTop: "10px" }}>
                        <span className="badge badge-role" style={{ backgroundColor: job.status === "open" ? "#e67700" : "#0ca678", color: "#fff", textTransform: "capitalize" }}>{job.status}</span>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: "15px" }} onClick={() => navigate(`/jobs/${job._id}`)}>Manage</button>
                  </div>
                </div>
              ))}
              {activeJobs.length > 3 && (
                <button className="btn btn-secondary w-100" onClick={() => navigate("/employer/jobs")}>View All Projects</button>
              )}
            </div>
          )}
        </div>

        <div>
           <div className="section-header">
            <h3 style={{ margin: 0 }}>Discover Workers</h3>
          </div>
          <div className="card" style={{ padding: "15px", marginBottom: "var(--space-4)", textAlign: "center", backgroundColor: "var(--color-bg-muted)" }}>
            <p className="text-muted" style={{ fontSize: "14px", marginBottom: "15px" }}>Find nearby matched workers actively looking for work.</p>
            <button className="btn btn-primary w-100" onClick={() => navigate("/workers")}>
              Search Workers
            </button>
          </div>

          <div className="section-header">
            <h3 style={{ margin: 0 }}>Employer Tools</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate("/employer/post-job")}>
              Post a New Job +
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => navigate("/employer/profile")}>
              Business Profile
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => navigate("/employer/jobs")}>
              Manage My Jobs
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => navigate("/dashboard")}>
              Switch to Worker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployerHome;

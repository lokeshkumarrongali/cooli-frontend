import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ApplicantCard from "../../components/ApplicantCard";

function EmployerApplicant() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await api.get(`/jobs/${id}/applicants`);
        if (response.data?.data) {
          setApplicants(response.data.data);
        }
        
        // Let's also fetch job data for title
        const jobRes = await api.get(`/jobs/${id}`);
        if(jobRes.data?.data) {
           setJob(jobRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch applicants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [id]);

  const handleStatusUpdate = (workerId, newStatus) => {
    setApplicants((prev) =>
      prev.map((app) =>
        app.workerId?._id === workerId ? { ...app, status: newStatus } : app
      )
    );
  };

  return (
    <div className="page-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate("/employer/jobs")} style={{ marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "5px" }}>
        <span>←</span> Back to Jobs
      </button>
      
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="page-title">{job ? `Review Applicants: ${job.title}` : "Review Applicants"}</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
           <p className="text-muted" style={{ margin: 0 }}>Review the workers who applied for this job and select the best fit.</p>
           {!loading && applicants.length > 0 && (
             <span className="badge badge-primary">{applicants.length} APPLICANTS</span>
           )}
        </div>
      </div>

      {loading ? (
        <p>Loading applicants...</p>
      ) : applicants.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-8)" }}>
          <span style={{ fontSize: "3rem" }}>👥</span>
          <h3 className="mt-4">No applicants yet.</h3>
          <p className="text-muted">Workers are still discovering your job posting.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {applicants.map((applicant, index) => (
            <ApplicantCard 
              key={index} 
              applicant={applicant} 
              jobId={id} 
              onStatusUpdate={handleStatusUpdate} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployerApplicant;

import { useNavigate } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { useUserProfile } from "../../context/useUserProfile";

function RoleDashboard() {
  const navigate = useNavigate();
  const { setActiveRole } = useRole();
  const { profileData } = useUserProfile();

  const enterWorker = () => {
    setActiveRole("worker");
    navigate("/worker/home");
  };

  const enterEmployer = () => {
    setActiveRole("employer");
    navigate("/employer/home");
  };

  const userName = profileData?.sharedProfile?.name || "there";

  return (
    <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div style={{ maxWidth: "800px", width: "100%", textAlign: "center" }}>
        <h1 className="page-title" style={{ fontSize: "2.5rem", marginBottom: "10px" }}>Hi {userName}! 👋</h1>
        <p className="text-muted" style={{ fontSize: "1.1rem", marginBottom: "40px" }}>
          Ready to get things moving? Choose how you want to use Cooli today.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          {/* Worker Card */}
          <div 
            className="card interactive-card" 
            onClick={enterWorker}
            style={{ 
              padding: "40px", 
              cursor: "pointer", 
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              border: "2px solid transparent"
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "20px" }}>👷‍♂️</div>
            <h2 style={{ color: "#0ca678", marginBottom: "10px" }}>I'm a Worker</h2>
            <p className="text-muted">Find jobs near you, manage your schedule, and get paid daily.</p>
            <div style={{ marginTop: "20px", color: "#0ca678", fontWeight: "bold" }}>Enter Worker Mode →</div>
          </div>

          {/* Employer Card */}
          <div 
            className="card interactive-card" 
            onClick={enterEmployer}
            style={{ 
              padding: "40px", 
              cursor: "pointer", 
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              border: "2px solid transparent"
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "20px" }}>💼</div>
            <h2 style={{ color: "#1c7ed6", marginBottom: "10px" }}>I'm an Employer</h2>
            <p className="text-muted">Hire skilled daily-wage workers, post jobs, and track project progress.</p>
            <div style={{ marginTop: "20px", color: "#1c7ed6", fontWeight: "bold" }}>Enter Employer Mode →</div>
          </div>
        </div>

        <p className="text-muted" style={{ marginTop: "40px", fontSize: "0.9rem" }}>
          You can switch roles anytime from the sidebar or dashboard.
        </p>
      </div>
    </div>
  );
}

export default RoleDashboard;

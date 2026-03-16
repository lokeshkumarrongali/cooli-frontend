import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWorkerById } from "../../services/workerService";
import api from "../../api/axios";
import { sanitizeImageUrl } from "../../api/imageUtils";

function WorkerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchWorkerById(id)
      .then(data => setWorker(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "80px" }}>
        <p className="text-muted">Loading profile...</p>
      </div>
    );
  }

  if (notFound || !worker) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "80px" }}>
        <h3>Worker not found</h3>
        <button className="btn btn-secondary mt-4" onClick={() => navigate("/workers")}>Back to Search</button>
      </div>
    );
  }

  const avatarUrl = sanitizeImageUrl(worker.photo, `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker._id}`);

  const fullAddress = [
    worker.address?.village,
    worker.address?.mandal,
    worker.address?.district,
    worker.address?.state
  ].filter(Boolean).join(", ") || "Location not set";

  const starRating = (r) => {
    const full = Math.floor(r);
    return Array(5).fill(0).map((_, i) => (
      <span key={i} style={{ color: i < full ? "#f59f00" : "#dee2e6", fontSize: "18px" }}>★</span>
    ));
  };

  const startChat = async () => {
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

  const TABS = ["overview", "skills", "portfolio", "reviews"];

  return (
    <div className="page-container" style={{ padding: "0" }}>
      {/* Banner */}
      <div className="profile-banner" style={{ background: "linear-gradient(135deg, #0ca678 0%, #1c7ed6 100%)" }} />

      <div style={{ padding: "0 20px" }}>
        <div className="card" style={{ marginTop: "0", position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-end", marginBottom: "var(--space-4)" }}>
            <div className="avatar-wrapper">
              <img src={avatarUrl} alt={worker.name} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ margin: 0, fontSize: "var(--font-size-xl)" }}>{worker.name}</h1>
                {worker.stats.jobsCompleted > 0 && (
                  <span className="badge badge-verified">Verified Worker</span>
                )}
              </div>
              <p className="text-muted" style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
                {worker.skills?.slice(0, 3).join(" • ") || "No skills listed"}
              </p>
              <p className="text-muted" style={{ margin: "2px 0 0 0", fontSize: "12px" }}>
                {fullAddress}
              </p>
            </div>

            {/* Top-right action */}
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "8px" }}>
              {worker.expectedWage && (
                <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#0ca678" }}>
                  Rs.{worker.expectedWage}<span style={{ fontSize: "12px", fontWeight: "normal" }}>/day</span>
                </div>
              )}
              <button
                className="btn btn-secondary btn-sm"
                style={{ border: "1px solid var(--color-primary)", color: "var(--color-primary)" }}
                onClick={startChat}
              >
                Chat
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/employer/post-job`)}
              >
                Invite to Job
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate("/workers")}
              >
                Back to Search
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="stats-grid" style={{ marginBottom: "var(--space-4)" }}>
            <div className="stat-card">
              <div>{starRating(worker.stats.rating)}</div>
              <span className="stat-value">{worker.stats.rating > 0 ? worker.stats.rating.toFixed(1) : "—"}</span>
              <span className="stat-label">Rating ({worker.stats.totalReviews} reviews)</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{worker.stats.jobsCompleted}</span>
              <span className="stat-label">Jobs Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{worker.experience}</span>
              <span className="stat-label">Experience</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{worker.availability || "Open"}</span>
              <span className="stat-label">Availability</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-container">
            {TABS.map(tab => (
              <div
                key={tab}
                className={`tab-item ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ marginTop: "var(--space-4)" }}>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div style={{ display: "grid", gap: "var(--space-4)" }}>
                <div className="section-header">
                  <h3 style={{ margin: 0 }}>About</h3>
                </div>
                <p className="text-muted" style={{ lineHeight: "1.8" }}>
                  {worker.bio || "No bio provided yet."}
                </p>

                <div className="section-header">
                  <h3 style={{ margin: 0 }}>Location</h3>
                </div>
                <div className="prop-grid">
                  <span className="prop-label">Village / Town</span>
                  <span className="prop-value">{worker.address?.village || "—"}</span>
                  <span className="prop-label">District</span>
                  <span className="prop-value">{worker.address?.district || "—"}</span>
                  <span className="prop-label">State</span>
                  <span className="prop-value">{worker.address?.state || "—"}</span>
                </div>
              </div>
            )}

            {/* SKILLS */}
            {activeTab === "skills" && (
              <div style={{ display: "grid", gap: "var(--space-4)" }}>
                <div className="section-header">
                  <h3 style={{ margin: 0 }}>Skills</h3>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {worker.skills?.length > 0 ? worker.skills.map((s, i) => (
                    <span key={i} className="badge badge-role" style={{ fontSize: "13px", padding: "6px 14px" }}>{s}</span>
                  )) : <p className="text-muted">No skills listed.</p>}
                </div>

                <div className="prop-grid" style={{ marginTop: "var(--space-4)" }}>
                  <span className="prop-label">Experience</span>
                  <span className="prop-value">{worker.experience || "Not specified"}</span>
                  <span className="prop-label">Expected Daily Wage</span>
                  <span className="prop-value">{worker.expectedWage ? `Rs.${worker.expectedWage}` : "Not specified"}</span>
                  <span className="prop-label">Availability</span>
                  <span className="prop-value">{worker.availability || "Not specified"}</span>
                </div>
              </div>
            )}

            {/* PORTFOLIO */}
            {activeTab === "portfolio" && (
              <div style={{ display: "grid", gap: "var(--space-6)" }}>
                {/* Images */}
                <div>
                  <h4 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>Work Images</h4>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                    {worker.portfolio?.filter(p => p.type === "image").map((item, i) => (
                      <img key={i} src={item.url} alt="work" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--color-border)" }} />
                    ))}
                    {worker.portfolio?.filter(p => p.type === "image").length === 0 && (
                      <p className="text-muted">No images uploaded.</p>
                    )}
                  </div>
                </div>

                {/* Certificates */}
                <div>
                  <h4 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>Certificates</h4>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                    {worker.portfolio?.filter(p => p.type === "certificate").map((item, i) => (
                      <img key={i} src={item.url} alt="cert" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--color-border)" }} />
                    ))}
                    {worker.portfolio?.filter(p => p.type === "certificate").length === 0 && (
                      <p className="text-muted">No certificates uploaded.</p>
                    )}
                  </div>
                </div>

                {/* Links */}
                <div>
                  <h4 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>Portfolio Links</h4>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
                    {worker.portfolio?.filter(p => p.type === "link").map((item, i) => (
                      <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                        style={{ padding: "8px 14px", backgroundColor: "var(--color-bg-muted)", borderRadius: "8px", textDecoration: "none", color: "var(--color-primary)", fontSize: "13px", border: "1px solid var(--color-border)" }}>
                        Link {i + 1}
                      </a>
                    ))}
                    {worker.portfolio?.filter(p => p.type === "link").length === 0 && (
                      <p className="text-muted">No links provided.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              <div style={{ display: "grid", gap: "var(--space-4)" }}>
                {worker.stats.totalReviews === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <p className="text-muted">No reviews yet for this worker.</p>
                  </div>
                ) : (
                  <p className="text-muted">Reviews coming soon.</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerProfilePage;

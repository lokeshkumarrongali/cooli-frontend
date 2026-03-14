import { useState, useEffect } from "react";
import { useUserProfile } from "../../context/useUserProfile";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ImageUploader from "../../components/ImageUploader";
import SkillTagSelector from "../../components/SkillTagSelector";
import JobCard from "../../components/JobCard";

function WorkerProfile() {
  const { profileData, updateSharedProfile, updateWorkerProfile } = useUserProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [workHistory, setWorkHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Local state for form editing
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    photo: "",
    bio: "",
    address: { 
      houseNo: "", street: "", village: "", mandal: "", district: "", state: "", country: "", pincode: "" 
    },
    skills: [], // Change to array for SkillTagSelector
    experience: "",
    expectedWage: "",
    availability: "",
    portfolio: []
  });

  // Sync formData when profileData changes (e.g. after backend fetch)
  useEffect(() => {
    if (profileData && !isEditing) {
      setFormData({
        name: profileData.sharedProfile?.name || "",
        phone: profileData.sharedProfile?.phone || "",
        photo: profileData.sharedProfile?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Cooli",
        bio: profileData.sharedProfile?.bio || "",
        address: { country: "", ...profileData.sharedProfile?.address },
        skills: Array.isArray(profileData.workerProfile?.skills) 
          ? profileData.workerProfile.skills 
          : [],
        experience: profileData.workerProfile?.experience || "",
        expectedWage: profileData.workerProfile?.expectedWage || "",
        availability: profileData.workerProfile?.availability || "",
        portfolio: profileData.workerProfile?.portfolio || []
      });
    }
  }, [profileData, isEditing]);

  useEffect(() => {
    if (activeTab === "savedJobs" && savedJobs.length === 0) {
      setLoadingSaved(true);
      api.get("/users/saved-jobs").then(res => {
        if (res.data?.data) {
          setSavedJobs(res.data.data);
        }
      }).catch(console.error).finally(() => setLoadingSaved(false));
    }
    if (activeTab === "history" && workHistory.length === 0) {
      setLoadingHistory(true);
      api.get("/jobs/worker-history").then(res => {
        if (res.data?.data) {
          setWorkHistory(res.data.data);
        }
      }).catch(console.error).finally(() => setLoadingHistory(false));
    }
    if (activeTab === "reviews" && reviews.length === 0 && profileData._id) {
      setLoadingReviews(true);
      api.get(`/reviews/users/${profileData._id}`).then(res => {
        if (res.data?.data?.reviews) {
          setReviews(res.data.data.reviews);
        }
      }).catch(console.error).finally(() => setLoadingReviews(false));
    }
  }, [activeTab, profileData._id]);

  const handleSkillsChange = (newSkills) => {
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    updateSharedProfile({
      name: formData.name,
      phone: formData.phone,
      photo: formData.photo,
      bio: formData.bio,
      address: formData.address,
    });
    
    updateWorkerProfile({
      skills: formData.skills,
      experience: formData.experience,
      expectedWage: formData.expectedWage,
      availability: formData.availability,
      portfolio: formData.portfolio
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    setUploading(true);
    try {
      const response = await api.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const imageUrl = response.data.data.imageUrl;
      // Instantly update the backend and context
      updateSharedProfile({ photo: imageUrl });
      setFormData(prev => ({ ...prev, photo: imageUrl }));
      alert("Profile photo updated successfully!");
    } catch (error) {
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleAvailabilityChange = async (e) => {
    const value = e.target.value;
    try {
      await api.patch("/workers/availability", { availability: value });
      updateWorkerProfile({ availability: value });
      setFormData(prev => ({ ...prev, availability: value }));
    } catch (err) {
      console.error(err);
      alert("Failed to update availability");
    }
  };

  // Helper to get first skill safely
  const firstSkill = Array.isArray(profileData.workerProfile?.skills) 
    ? profileData.workerProfile.skills[0] 
    : (profileData.workerProfile?.skills?.split(',')[0] || "Worker");

  const skillsList = Array.isArray(profileData.workerProfile?.skills)
    ? profileData.workerProfile.skills
    : (profileData.workerProfile?.skills ? profileData.workerProfile.skills.split(',') : []);

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

  const formatUrl = (url) => {
    if (!url) return "#";
    let clean = url.replace(/['"]/g, '').trim();
    if (clean.match(/^https?:\/\//i)) return clean;
    return `https://${clean}`;
  };

  return (
    <div className="page-container" style={{ padding: "0" }}>
      <div className="profile-banner" style={{ background: "linear-gradient(135deg, #0ca678 0%, #37b24d 100%)" }}></div>
      
      <div style={{ padding: "0 20px" }}>
        <div className="card" style={{ marginTop: "0", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-end", marginBottom: "var(--space-6)" }}>
            <div className="avatar-wrapper" style={{ position: "relative" }}>
              <img src={profileData.sharedProfile?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Cooli"} alt="Profile" style={{ opacity: uploading ? 0.5 : 1 }} />
              <div 
                className="avatar-edit-overlay" 
                onClick={() => document.getElementById("photo-upload").click()}
                style={{ cursor: "pointer" }}
              >
                {uploading ? "Uploading..." : "Change"}
              </div>
              <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                style={{ display: "none" }} 
                onChange={handlePhotoUpload} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "5px" }}>
                <h1 style={{ margin: 0, fontSize: "var(--font-size-xl)" }}>{profileData.sharedProfile?.name || "New User"}</h1>
                <span className="badge badge-verified">✔ Verified Worker</span>
                
                <select 
                  value={profileData.workerProfile?.availability || "available"} 
                  onChange={handleAvailabilityChange}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "20px",
                    border: "1px solid var(--color-border)",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: profileData.workerProfile?.availability === "busy" ? "#f1c40f" : profileData.workerProfile?.availability === "offline" ? "#e74c3c" : "#2ecc71",
                    backgroundColor: "white",
                    cursor: "pointer",
                    outline: "none"
                  }}
                >
                  <option value="available">🟢 Available</option>
                  <option value="busy">🟡 Busy</option>
                  <option value="offline">🔴 Not Available</option>
                </select>
              </div>
              <p className="text-muted" style={{ margin: "5px 0 0 0" }}>Expert {firstSkill}</p>
              <p className="text-muted" style={{ fontSize: "var(--font-size-sm)", marginTop: "2px" }}>
                📍 {[profileData.sharedProfile?.address?.village, profileData.sharedProfile?.address?.mandal, profileData.sharedProfile?.address?.district, profileData.sharedProfile?.address?.state].filter(Boolean).join(', ') || "Location not set"}
              </p>
            </div>
            {!isEditing && (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>

          {!isEditing && (
            <div style={{ marginTop: "15px", marginBottom: "15px", padding: "15px", backgroundColor: "var(--color-bg-muted)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <strong style={{ fontSize: "14px" }}>Profile Completion ({completionScore}%)</strong>
              </div>
              <div style={{ width: "100%", height: "10px", backgroundColor: "#e9ecef", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${completionScore}%`, height: "100%", backgroundColor: completionScore === 100 ? "#0ca678" : "#f59f00", transition: "width 0.3s ease" }}></div>
              </div>
            </div>
          )}

          <div className="tab-container">
            <div className={`tab-item ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</div>
            <div className={`tab-item ${activeTab === "skills" ? "active" : ""}`} onClick={() => setActiveTab("skills")}>Skills & Experience</div>
            <div className={`tab-item ${activeTab === "portfolio" ? "active" : ""}`} onClick={() => setActiveTab("portfolio")}>Portfolio</div>
            <div className={`tab-item ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>Work History</div>
            <div className={`tab-item ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>Reviews</div>
            <div className={`tab-item ${activeTab === "savedJobs" ? "active" : ""}`} onClick={() => setActiveTab("savedJobs")}>Saved Jobs</div>
          </div>

          {isEditing ? (
            <div style={{ display: "grid", gap: "var(--space-6)" }}>
              {/* Edit Mode UI */}
              <div className="section-header">
                <span className="section-icon">👤</span>
                <h3 style={{ margin: 0 }}>Basic Identity</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div>
                  <label className="prop-label">Full Name</label>
                  <input className="input" name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div>
                  <label className="prop-label">Phone</label>
                  <input className="input" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="section-header" style={{ marginTop: "var(--space-4)" }}>
                <span className="section-icon">🛠</span>
                <h3 style={{ margin: 0 }}>Worker Details</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="prop-label">Skills</label>
                  <SkillTagSelector 
                    selectedSkills={formData.skills} 
                    onChange={handleSkillsChange} 
                  />
                </div>
                <div>
                  <label className="prop-label">Experience</label>
                  <input className="input" name="experience" value={formData.experience} onChange={handleChange} />
                </div>
                <div>
                  <label className="prop-label">Expected Wage (per day)</label>
                  <input className="input" name="expectedWage" value={formData.expectedWage} onChange={handleChange} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="prop-label">Your Bio (Tell employers why to hire you)</label>
                  <textarea className="input" name="bio" value={formData.bio} onChange={handleChange} style={{ minHeight: "100px" }} />
                </div>
              </div>

              <div className="section-header" style={{ marginTop: "var(--space-4)" }}>
                <span className="section-icon">📍</span>
                <h3 style={{ margin: 0 }}>Home Address</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)" }}>
                <div>
                  <label className="prop-label">House No</label>
                  <input className="input" name="address.houseNo" value={formData.address.houseNo || ''} onChange={handleChange} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="prop-label">Street</label>
                  <input className="input" name="address.street" value={formData.address.street || ''} onChange={handleChange} />
                </div>
                <div>
                  <label className="prop-label">Village</label>
                  <input className="input" name="address.village" value={formData.address.village || ''} onChange={handleChange} />
                </div>
                <div>
                  <label className="prop-label">Mandal</label>
                  <input className="input" name="address.mandal" value={formData.address.mandal || ''} onChange={handleChange} />
                </div>
                <div>
                  <label className="prop-label">District</label>
                  <input className="input" name="address.district" value={formData.address.district || ''} onChange={handleChange} />
                </div>
                <div>
                  <label className="prop-label">State</label>
                  <input className="input" name="address.state" value={formData.address.state || ''} onChange={handleChange} />
                </div>
                <div>
                  <label className="prop-label">Country</label>
                  <input className="input" name="address.country" value={formData.address.country || ''} onChange={handleChange} />
                </div>
                <div>
                  <label className="prop-label">Pincode</label>
                  <input className="input" name="address.pincode" value={formData.address.pincode || ''} onChange={handleChange} />
                </div>
              </div>

              <div className="section-header" style={{ marginTop: "var(--space-4)" }}>
                <span className="section-icon">📁</span>
                <h3 style={{ margin: 0 }}>Portfolio Uploads</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)" }}>
                <div>
                  <ImageUploader 
                    label="Image" 
                    onUploadSuccess={(url) => setFormData(p => ({ ...p, portfolio: [...(p.portfolio || []), { type: 'image', url }] }))} 
                  />
                </div>
                <div>
                  <ImageUploader 
                    label="Certificate Document" 
                    onUploadSuccess={(url) => setFormData(p => ({ ...p, portfolio: [...(p.portfolio || []), { type: 'certificate', url }] }))} 
                  />
                </div>
                <div>
                  <label className="prop-label">Add external link</label>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <input className="input" id="link-input" placeholder="https://" />
                    <button className="btn btn-primary btn-sm" type="button" onClick={() => {
                      const input = document.getElementById("link-input");
                      let val = input.value.trim();
                      if (val) {
                        if (!val.match(/^https?:\/\//i)) {
                          val = 'https://' + val;
                        }
                        setFormData(p => ({ ...p, portfolio: [...(p.portfolio || []), { type: 'link', url: val }] }));
                        input.value = "";
                      }
                    }}>Add</button>
                  </div>
                </div>
              </div>
              {formData.portfolio?.length > 0 && (
                <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {formData.portfolio.map((item, idx) => (
                    <div key={idx} style={{ position: "relative", border: "1px solid var(--color-border)", padding: "5px", borderRadius: "5px" }}>
                      {item.type === 'link' ? (
                        <div style={{ padding: "10px", backgroundColor: "var(--color-bg-muted)", fontSize: "12px", width: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🔗 {item.url}</div>
                      ) : (
                        <img src={item.url} alt={item.type} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                      )}
                      <button 
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, portfolio: p.portfolio.filter((_, i) => i !== idx) }))}
                        style={{ position: "absolute", top: -5, right: -5, background: "red", color: "white", borderRadius: "50%", border: "none", cursor: "pointer", width: "20px", height: "20px" }}
                      >&times;</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="nav-actions" style={{ justifyContent: "flex-end", borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
                <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          ) : (
            <div>
              {activeTab === "overview" && (
                <div style={{ display: "grid", gap: "var(--space-6)" }}>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-value">{profileData.workerProfile?.stats?.rating || "0.0"} ★</span>
                      <span className="stat-label">Worker Rating</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{profileData.workerProfile?.stats?.jobsCompleted || "0"}</span>
                      <span className="stat-label">Jobs Done</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{profileData.workerProfile?.stats?.earnings || "₹0"}</span>
                      <span className="stat-label">Total Earnings</span>
                    </div>
                  </div>

                  <div className="section-header">
                    <span className="section-icon">👤</span>
                    <h3 style={{ margin: 0 }}>About Me</h3>
                  </div>
                  <p className="text-muted" style={{ lineHeight: "1.8" }}>
                    {profileData.sharedProfile?.bio || "No bio provided."}
                  </p>

                  <div className="section-header">
                    <span className="section-icon">📍</span>
                    <h3 style={{ margin: 0 }}>Location</h3>
                  </div>
                  <p className="prop-value">
                    {profileData.sharedProfile?.address?.houseNo || "-"}, {profileData.sharedProfile?.address?.street || ""},<br />
                    {profileData.sharedProfile?.address?.village || ""}, {profileData.sharedProfile?.address?.mandal || ""},<br />
                    {profileData.sharedProfile?.address?.district || ""}, {profileData.sharedProfile?.address?.state || ""} {profileData.sharedProfile?.address?.country || ""}<br />
                    PIN: {profileData.sharedProfile?.address?.pincode || ""}
                  </p>
                </div>
              )}

              {activeTab === "skills" && (
                <div style={{ display: "grid", gap: "var(--space-6)" }}>
                  <div className="prop-grid">
                    <span className="prop-label">Key Skills</span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {skillsList.map((skill, idx) => (
                        <span key={idx} className="badge badge-role" style={{ fontSize: "12px" }}>{skill.trim()}</span>
                      ))}
                      {skillsList.length === 0 && <span className="text-muted">No skills added yet.</span>}
                    </div>
                    
                    <span className="prop-label">Experience</span>
                    <span className="prop-value">{profileData.workerProfile?.experience || "Not set"}</span>

                    <span className="prop-label">Daily Wage</span>
                    <span className="prop-value">{profileData.workerProfile?.expectedWage || "Not set"}</span>

                    <span className="prop-label">Availability</span>
                    <span className="prop-value">{profileData.workerProfile?.availability || "Not set"}</span>
                  </div>
                </div>
              )}

              {activeTab === "portfolio" && (
                <div style={{ display: "grid", gap: "var(--space-6)" }}>
                  <div>
                    <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>Work Images</h3>
                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                      {profileData.workerProfile?.portfolio?.filter(p => p.type === 'image').length > 0 ? (
                        profileData.workerProfile.portfolio.filter(p => p.type === 'image').map((item, idx) => (
                          <img key={idx} src={item.url} alt="Work Sample" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--color-border)" }} />
                        ))
                      ) : (
                        <p className="text-muted">No images uploaded.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>Certifications</h3>
                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                      {profileData.workerProfile?.portfolio?.filter(p => p.type === 'certificate').length > 0 ? (
                        profileData.workerProfile.portfolio.filter(p => p.type === 'certificate').map((item, idx) => (
                          <img key={idx} src={item.url} alt="Certificate" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--color-border)" }} />
                        ))
                      ) : (
                        <p className="text-muted">No certificates uploaded.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>Portfolio Links</h3>
                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                      {profileData.workerProfile?.portfolio?.filter(p => p.type === 'link').length > 0 ? (
                        profileData.workerProfile.portfolio.filter(p => p.type === 'link').map((item, idx) => (
                          <a key={idx} href={formatUrl(item.url)} target="_blank" rel="noopener noreferrer" style={{ padding: "10px", backgroundColor: "var(--color-bg-muted)", borderRadius: "8px", textDecoration: "none", color: "var(--color-primary)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "250px" }}>
                            🔗 {item.url}
                          </a>
                        ))
                      ) : (
                        <p className="text-muted">No links provided.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div style={{ display: "grid", gap: "var(--space-4)" }}>
                  {loadingHistory ? (
                    <p className="text-muted" style={{ textAlign: "center", padding: "20px" }}>Loading work history...</p>
                  ) : workHistory.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
                      <span style={{ fontSize: "3rem" }}>📜</span>
                      <h3 className="mt-4">Job history is empty</h3>
                      <p className="text-muted">Completed jobs will appear here automatically.</p>
                    </div>
                  ) : (
                    workHistory.map((job, idx) => {
                      const employer = job.employerId;
                      const employerName = employer?.employerProfile?.businessName ||
                        employer?.sharedProfile?.name || "Employer";
                      const completedDate = new Date(job.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric", month: "short", day: "numeric"
                      });
                      return (
                        <div key={idx} className="card" style={{ padding: "var(--space-4)", backgroundColor: "var(--color-bg-muted)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <strong style={{ fontSize: "15px" }}>{job.title}</strong>
                              <p className="text-muted" style={{ margin: "4px 0 0 0", fontSize: "13px" }}>🏢 {employerName}</p>
                              {job.location?.address && (
                                <p className="text-muted" style={{ margin: "2px 0 0 0", fontSize: "13px" }}>📍 {job.location.address}</p>
                              )}
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span className="badge" style={{ backgroundColor: "#0ca67822", color: "#0ca678", padding: "4px 10px", borderRadius: "12px", fontSize: "12px" }}>✅ Completed</span>
                              <p className="text-muted" style={{ margin: "6px 0 0 0", fontSize: "12px" }}>{completedDate}</p>
                            </div>
                          </div>
                          {job.wage && (
                            <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "var(--color-text)" }}>💰 ₹{job.wage} · {job.jobType || "contract"}</p>
                          )}
                          {job.requiredSkills?.length > 0 && (
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                              {job.requiredSkills.map((skill, i) => (
                                <span key={i} className="badge badge-role" style={{ fontSize: "11px" }}>{skill}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div style={{ display: "grid", gap: "var(--space-4)" }}>
                  {loadingReviews ? (
                    <p className="text-muted" style={{ textAlign: "center", padding: "20px" }}>Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
                      <span style={{ fontSize: "3rem" }}>⭐</span>
                      <h3 className="mt-4">No reviews yet</h3>
                      <p className="text-muted">Reviews from employers will appear here after completed jobs.</p>
                    </div>
                  ) : (
                    reviews.map((review, idx) => {
                      const reviewerName = review.reviewerId?.sharedProfile?.name ||
                        review.reviewerId?.name || "Employer";
                      const jobTitle = review.jobId?.title || "";
                      const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
                      const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric", month: "short", day: "numeric"
                      });
                      return (
                        <div key={idx} className="card" style={{ padding: "var(--space-4)", backgroundColor: "var(--color-bg-muted)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <strong>{reviewerName}</strong>
                              {jobTitle && <p className="text-muted" style={{ margin: "2px 0 0 0", fontSize: "12px" }}>for "{jobTitle}"</p>}
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ color: "gold", fontSize: "16px" }}>{stars}</span>
                              <p className="text-muted" style={{ margin: "2px 0 0 0", fontSize: "12px" }}>{date}</p>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-muted" style={{ fontSize: "var(--font-size-sm)", marginTop: "10px", fontStyle: "italic" }}>
                              "{review.comment}"
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "savedJobs" && (
                <div style={{ display: "grid", gap: "var(--space-4)" }}>
                  <div className="section-header" style={{ marginBottom: "0" }}>
                    <h3 style={{ margin: 0 }}>Saved Jobs</h3>
                  </div>
                  {loadingSaved ? (
                     <p className="text-muted" style={{ textAlign: "center", padding: "20px" }}>Loading saved jobs...</p>
                  ) : savedJobs.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "40px" }}>
                      <h3 className="mt-4">No saved jobs yet</h3>
                      <p className="text-muted">Browse jobs and save them for later.</p>
                      <button className="btn btn-primary mt-4" onClick={() => navigate("/worker/jobs")}>Browse Jobs</button>
                    </div>
                  ) : (
                    savedJobs.map((job, idx) => (
                      <JobCard 
                        key={idx} 
                        job={job} 
                        initiallySaved={true} 
                        onRemoveSaved={(id) => setSavedJobs(prev => prev.filter(j => (j._id || j.id) !== id))} 
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="nav-actions" style={{ marginBottom: "var(--space-8)" }}>
          <button className="btn btn-secondary" onClick={() => navigate("/worker/home")}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}

export default WorkerProfile;

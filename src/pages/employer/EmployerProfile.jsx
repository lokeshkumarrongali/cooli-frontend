import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../../context/useUserProfile";
import api from "../../api/axios";
import ImageUploader from "../../components/ImageUploader";

function EmployerProfile() {
  const { profileData, updateSharedProfile, updateEmployerProfile } = useUserProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [postedJobs, setPostedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Local state for form editing
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    photo: "",
    bio: "",
    address: { 
      houseNo: "", street: "", village: "", mandal: "", district: "", state: "", country: "", pincode: "" 
    },
    businessName: "",
    businessType: "Construction",
    companyDescription: "",
    gstNumber: "",
    yearsInOperation: "",
    employeeCount: "",
    website: "",
    tagline: "",
    businessDocuments: [],
  });

  // Sync formData when profileData changes (e.g. after backend fetch)
  useEffect(() => {
    if (profileData && !isEditing) {
      setFormData({
        name: profileData.sharedProfile?.name || "",
        phone: profileData.sharedProfile?.phone || "",
        photo: profileData.sharedProfile?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Employer",
        bio: profileData.sharedProfile?.bio || "",
        address: { country: "", ...profileData.sharedProfile?.address },
        businessName: profileData.employerProfile?.businessName || "",
        businessType: profileData.employerProfile?.businessType || "Construction",
        companyDescription: profileData.employerProfile?.companyDescription || "",
        gstNumber: profileData.employerProfile?.gstNumber || "",
        yearsInOperation: profileData.employerProfile?.yearsInOperation || "",
        employeeCount: profileData.employerProfile?.employeeCount || "",
        website: profileData.employerProfile?.website || "",
        tagline: profileData.employerProfile?.tagline || "",
        businessDocuments: profileData.employerProfile?.businessDocuments || [],
      });
    }
  }, [profileData, isEditing]);

  useEffect(() => {
    if (activeTab === "jobs" && postedJobs.length === 0) {
      setLoadingJobs(true);
      api.get("/jobs/employer")
        .then(res => { if (res.data?.data) setPostedJobs(res.data.data); })
        .catch(console.error)
        .finally(() => setLoadingJobs(false));
    }
  }, [activeTab]);

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
    updateEmployerProfile({
      businessName: formData.businessName,
      businessType: formData.businessType,
      companyDescription: formData.companyDescription,
      gstNumber: formData.gstNumber,
      yearsInOperation: formData.yearsInOperation,
      employeeCount: formData.employeeCount,
      website: formData.website,
      tagline: formData.tagline,
      businessDocuments: formData.businessDocuments,
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
      updateSharedProfile({ photo: imageUrl });
      setFormData(prev => ({ ...prev, photo: imageUrl }));
      alert("Company logo updated successfully!");
    } catch (error) {
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: "0" }}>
      <div className="profile-banner" style={{ background: "linear-gradient(135deg, #1c7ed6 0%, #228be6 100%)" }}></div>
      
      <div style={{ padding: "0 20px" }}>
        <div className="card" style={{ marginTop: "0", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-end", marginBottom: "var(--space-6)" }}>
            <div className="avatar-wrapper" style={{ position: "relative" }}>
              <img src={profileData.sharedProfile?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Employer"} alt="Profile" style={{ opacity: uploading ? 0.5 : 1 }} />
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
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ margin: 0, fontSize: "var(--font-size-xl)" }}>{profileData.sharedProfile?.name || "New Employer"}</h1>
                <span className="badge badge-verified">✔ Verified Employer</span>
              </div>
              <p className="text-muted" style={{ margin: "5px 0 0 0" }}>{profileData.employerProfile?.tagline || "Employer"}</p>
              <p className="text-muted" style={{ fontSize: "var(--font-size-sm)", marginTop: "2px" }}>
                📍 {profileData.sharedProfile?.address?.village || "Location not set"}, {profileData.sharedProfile?.address?.district || ""}
              </p>
            </div>
            {!isEditing && (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>

          <div className="tab-container">
            <div className={`tab-item ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</div>
            <div className={`tab-item ${activeTab === "business" ? "active" : ""}`} onClick={() => setActiveTab("business")}>Business Info</div>
            <div className={`tab-item ${activeTab === "documents" ? "active" : ""}`} onClick={() => setActiveTab("documents")}>Documents</div>
            <div className={`tab-item ${activeTab === "jobs" ? "active" : ""}`} onClick={() => setActiveTab("jobs")}>Jobs Posted</div>
            <div className={`tab-item ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>Reviews</div>
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
                <span className="section-icon">🏢</span>
                <h3 style={{ margin: 0 }}>Business Info</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div>
                  <label className="prop-label">Business Name</label>
                  <input className="input" name="businessName" value={formData.businessName} onChange={handleChange} />
                </div>
                <div>
                  <label className="prop-label">Business Type</label>
                  <select className="input" name="businessType" value={formData.businessType} onChange={handleChange}>
                    <option value="Construction">Construction</option>
                    <option value="Catering">Catering</option>
                    <option value="Transport">Transport</option>
                    <option value="Farming">Farming</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="prop-label">Tagline</label>
                  <input className="input" name="tagline" value={formData.tagline} onChange={handleChange} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="prop-label">Company Description</label>
                  <textarea className="input" name="companyDescription" value={formData.companyDescription} onChange={handleChange} style={{ minHeight: "100px" }} />
                </div>
              </div>

              <div className="section-header" style={{ marginTop: "var(--space-4)" }}>
                <span className="section-icon">📁</span>
                <h3 style={{ margin: 0 }}>Business Documents</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-4)" }}>
                <div>
                  <ImageUploader 
                    label="Business License / GST Doc" 
                    onUploadSuccess={(url) => setFormData(p => ({ ...p, businessDocuments: [...p.businessDocuments, url] }))} 
                  />
                  {formData.businessDocuments.length > 0 && (
                    <div style={{ marginTop: "10px", display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      {formData.businessDocuments.map((doc, idx) => (
                        <div key={idx} style={{ position: "relative" }}>
                          <img src={doc} alt="doc" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                          <button 
                            onClick={() => setFormData(p => ({ ...p, businessDocuments: p.businessDocuments.filter((_, i) => i !== idx) }))}
                            style={{ position: "absolute", top: -5, right: -5, background: "red", color: "white", borderRadius: "50%", border: "none", cursor: "pointer", width: "20px", height: "20px" }}
                          >&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="section-header" style={{ marginTop: "var(--space-4)" }}>
                <span className="section-icon">📍</span>
                <h3 style={{ margin: 0 }}>Office Address</h3>
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
                      <span className="stat-value">{profileData.employerProfile?.stats?.rating || "0.0"} ★</span>
                      <span className="stat-label">Employer Rating</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{profileData.employerProfile?.stats?.jobsPosted || "0"}</span>
                      <span className="stat-label">Jobs Posted</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{profileData.employerProfile?.stats?.workersHired || "0"}</span>
                      <span className="stat-label">Workers Hired</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{profileData.employerProfile?.stats?.completionRate || "0"}%</span>
                      <span className="stat-label">Comp. Rate</span>
                    </div>
                  </div>

                  <div className="section-header">
                    <span className="section-icon">📝</span>
                    <h3 style={{ margin: 0 }}>Company Description</h3>
                  </div>
                  <p className="text-muted" style={{ lineHeight: "1.8" }}>
                    {profileData.employerProfile?.companyDescription || "No description provided."}
                  </p>

                  <div className="section-header">
                    <span className="section-icon">🔗</span>
                    <h3 style={{ margin: 0 }}>Quick Links</h3>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-4)" }}>
                    <a href={profileData.employerProfile?.website ? `http://${profileData.employerProfile.website}` : "#"} className="btn btn-secondary" style={{ textDecoration: "none" }}>🌐 Website</a>
                    <button className="btn btn-secondary">✉ Contact Info</button>
                  </div>
                </div>
              )}

              {activeTab === "business" && (
                <div style={{ display: "grid", gap: "var(--space-6)" }}>
                  <div className="prop-grid">
                    <span className="prop-label">Business Name</span>
                    <span className="prop-value">{profileData.employerProfile?.businessName || "-"}</span>
                    
                    <span className="prop-label">Entity Type</span>
                    <span className="prop-value">{profileData.employerProfile?.businessType || "-"}</span>

                    <span className="prop-label">GST Number</span>
                    <span className="prop-value">{profileData.employerProfile?.gstNumber || "Not provided"}</span>

                    <span className="prop-label">Operation Since</span>
                    <span className="prop-value">{profileData.employerProfile?.yearsInOperation || "-"}</span>

                    <span className="prop-label">Total Employees</span>
                    <span className="prop-value">{profileData.employerProfile?.employeeCount || "-"}</span>
                  </div>

                  <div className="section-header" style={{ marginTop: "var(--space-4)" }}>
                    <span className="section-icon">📍</span>
                    <h3 style={{ margin: 0 }}>Registered Office</h3>
                  </div>
                  <div className="prop-grid">
                    <span className="prop-label">Full Address</span>
                    <span className="prop-value">
                      {profileData.sharedProfile?.address?.houseNo || "-"}, {profileData.sharedProfile?.address?.street || ""},<br />
                      {profileData.sharedProfile?.address?.village || ""}, {profileData.sharedProfile?.address?.mandal || ""},<br />
                      {profileData.sharedProfile?.address?.district || ""}, {profileData.sharedProfile?.address?.state || ""} {profileData.sharedProfile?.address?.country || ""}<br />
                      PIN: {profileData.sharedProfile?.address?.pincode || ""}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div style={{ display: "grid", gap: "var(--space-6)" }}>
                  <div>
                    <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>Verification Documents</h3>
                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                      {profileData.employerProfile?.businessDocuments?.length > 0 ? (
                        profileData.employerProfile.businessDocuments.map((doc, idx) => (
                          <img key={idx} src={doc} alt="Document" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--color-border)" }} />
                        ))
                      ) : (
                        <p className="text-muted">No business documents uploaded.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "jobs" && (
                <div style={{ display: "grid", gap: "var(--space-4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                    <h3 style={{ margin: 0 }}>Jobs Posted</h3>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate("/employer/post-job")}>+ Post New Job</button>
                  </div>

                  {loadingJobs ? (
                    <p className="text-muted" style={{ textAlign: "center", padding: "20px" }}>Loading jobs...</p>
                  ) : postedJobs.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "40px" }}>
                      <h3 className="mt-4">No jobs posted yet</h3>
                      <p className="text-muted">Post your first job to start finding skilled workers.</p>
                      <button className="btn btn-primary mt-4" onClick={() => navigate("/employer/post-job")}>Post a Job</button>
                    </div>
                  ) : (
                    postedJobs.map(job => (
                      <div key={job._id} className="card" style={{ padding: "var(--space-4)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                              <h4 style={{ margin: 0 }}>{job.title}</h4>
                              <span style={{
                                padding: "3px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                backgroundColor:
                                  job.status === "open" ? "#d3f9d8" :
                                  job.status === "in-progress" ? "#fff3bf" : "#e9ecef",
                                color:
                                  job.status === "open" ? "#2f9e44" :
                                  job.status === "in-progress" ? "#e67700" : "#868e96"
                              }}>
                                {job.status === "open" ? "Open" : job.status === "in-progress" ? "In Progress" : "Completed"}
                              </span>
                            </div>
                            <p className="text-muted" style={{ fontSize: "12px", margin: "0 0 8px 0" }}>
                              {job.location?.address || "Location not set"} &bull; {job.jobType || ""}
                            </p>
                            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                              {job.requiredSkills?.map((skill, idx) => (
                                <span key={idx} className="badge badge-role">{skill}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", minWidth: "120px" }}>
                            <div style={{ fontWeight: "bold", color: "#0ca678", fontSize: "1.1rem", marginBottom: "6px" }}>
                              Rs.{job.wage}{job.jobType === "hourly" ? "/hr" : job.jobType === "daily" ? "/day" : ""}
                            </div>
                            <div style={{ fontSize: "11px", color: "gray", marginBottom: "10px" }}>
                              {job.applicants?.length || 0} applicant{job.applicants?.length !== 1 ? "s" : ""}
                            </div>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ width: "100%" }}
                              onClick={() => navigate(`/employer/jobs/${job._id}/applicants`)}
                            >
                              View Applicants
                            </button>
                          </div>
                        </div>
                        <div style={{ marginTop: "12px", borderTop: "1px solid var(--color-border)", paddingTop: "10px", fontSize: "11px", color: "gray" }}>
                          Posted on {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div style={{ display: "grid", gap: "var(--space-4)" }}>
                  <div className="card" style={{ padding: "var(--space-4)", backgroundColor: "var(--color-bg-muted)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>Ramesh K.</strong>
                      <span style={{ color: "gold" }}>★★★★★</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: "var(--font-size-sm)", marginTop: "10px" }}>
                      "Very good employer. Professional behavior and timely payments. Would highly recommend."
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="nav-actions" style={{ marginBottom: "var(--space-8)" }}>
          <button className="btn btn-secondary" onClick={() => navigate("/employer/home")}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}

export default EmployerProfile;

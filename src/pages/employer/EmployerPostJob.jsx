import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function EmployerPostJob() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    wage: "",
    jobType: "daily",
    location: {
      address: "",
      lat: null,
      lng: null
    }
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          alert("Location captured automatically!");
        },
        (error) => {
          alert("Could not get location. Ensure location permissions are granted.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      if (!formData.location.lng || !formData.location.lat) {
        alert("Please capture your location data before posting.");
        return;
      }

      const jobData = {
        title: formData.title,
        description: formData.description,
        wage: Number(formData.wage),
        jobType: formData.jobType,
        requiredSkills: formData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
        location: {
          address: formData.location.address,
          type: "Point",
          coordinates: [formData.location.lng, formData.location.lat]
        }
      };

      await api.post("/jobs", jobData);
      alert("Job posted successfully!");
      navigate("/employer/jobs");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to post job");
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="page-title">Post a New Job</h1>
        <p className="text-muted">Fill out the details below to find the right workers for your project.</p>
      </div>

      <div className="card">
        <form onSubmit={handlePostJob} style={{ display: "grid", gap: "var(--space-4)" }}>
          <div>
            <label className="prop-label">Job Title</label>
            <input className="input" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Masonry Helper" required />
          </div>

          <div>
            <label className="prop-label">Description</label>
            <textarea className="input" name="description" value={formData.description} onChange={handleChange} placeholder="Details about the work..." style={{ minHeight: "100px" }} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label className="prop-label">Job Type</label>
              <select className="input" name="jobType" value={formData.jobType} onChange={handleChange}>
                <option value="hourly">Hourly pay</option>
                <option value="daily">Daily wage</option>
                <option value="contract">Fixed contract</option>
              </select>
            </div>
            <div>
              <label className="prop-label">Wage (₹)</label>
              <input type="number" className="input" name="wage" value={formData.wage} onChange={handleChange} placeholder="e.g. 500" required />
            </div>
          </div>

          <div>
            <label className="prop-label">Required Skills (Comma separated)</label>
            <input className="input" name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} placeholder="e.g. Masonry, Cementing, Heavy lifting" />
          </div>

          <div>
            <label className="prop-label">Exact Location Address</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input className="input" name="location.address" value={formData.location.address} onChange={handleChange} placeholder="Neighborhood or Street..." required style={{ flex: 1 }} />
              <button type="button" className="btn btn-secondary" onClick={handleGetLocation}>
                {formData.location.lat ? "📍 Location Captured" : "📍 Get GPS"}
              </button>
            </div>
          </div>

          <div className="nav-actions" style={{ justifyContent: "flex-end", marginTop: "var(--space-6)" }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/employer/home")}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish Job</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployerPostJob;

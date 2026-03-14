import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useUserProfile } from "../../context/useUserProfile";
import JobCard from "../../components/JobCard";
import JobMap from "../../components/JobMap";

function WorkerJobs() {
  const navigate = useNavigate();
  const { profileData } = useUserProfile();

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Location state
  const [userCoords, setUserCoords] = useState(null);      // [lat, lng]
  const [locationStatus, setLocationStatus] = useState("pending"); // pending | granted | denied

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(20);
  const [jobType, setJobType] = useState("all");

  // View mode
  const [viewMode, setViewMode] = useState("list");

  // ── Fetch jobs via search endpoint ────────────────────────────────────────
  const fetchJobs = useCallback(async (lat, lng, q = "", r = 20, type = "all") => {
    setLoading(true);
    try {
      let url = lat && lng
        ? `/jobs/search?lat=${lat}&lng=${lng}&radius=${r}`
        : `/jobs/search?radius=${r}`;
      if (q)                    url += `&q=${encodeURIComponent(q)}`;
      if (type && type !== "all") url += `&jobType=${type}`;

      const res = await api.get(url);
      if (res.data?.data) setJobs(res.data.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch nearby jobs specifically for map view ───────────────────────────
  const fetchNearbyForMap = useCallback(async (lat, lng, r = 20) => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs/nearby?lat=${lat}&lng=${lng}&radius=${r}`);
      if (res.data?.data) setJobs(res.data.data);
    } catch (err) {
      console.error("Failed to fetch nearby jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── On mount: request geolocation ─────────────────────────────────────────
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("denied");
      fetchJobs(null, null, "", radius, jobType);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        setUserCoords([latitude, longitude]);
        setLocationStatus("granted");
        fetchJobs(latitude, longitude, "", radius, jobType);
      },
      (err) => {
        console.warn("Geolocation denied:", err);
        setLocationStatus("denied");
        fetchJobs(null, null, "", radius, jobType);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── When radius / jobType filters change, re-fetch ────────────────────────
  useEffect(() => {
    if (locationStatus === "pending") return; // wait for geo result first
    if (viewMode === "map" && userCoords) {
      fetchNearbyForMap(userCoords[0], userCoords[1], radius);
    } else {
      const [lat, lng] = userCoords ?? [null, null];
      fetchJobs(lat, lng, searchQuery, radius, jobType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, jobType]);

  // ── When switching to map view, fetch nearby ──────────────────────────────
  useEffect(() => {
    if (viewMode === "map" && userCoords && locationStatus === "granted") {
      fetchNearbyForMap(userCoords[0], userCoords[1], radius);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // ── Saved jobs ─────────────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/users/saved-jobs").then((res) => {
      if (res.data?.data)
        setSavedJobIds(new Set(res.data.data.map((j) => j._id || j.id)));
    }).catch(console.error);
  }, []);

  // ── Search submit ──────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    const [lat, lng] = userCoords ?? [null, null];
    fetchJobs(lat, lng, searchQuery, radius, jobType);
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const locationBadge = {
    pending: { bg: "#fff3cd", color: "#856404", icon: "⏳", text: "Locating you…" },
    granted: { bg: "#d3f9d8", color: "#2b8a3e", icon: "📍", text: "Location active" },
    denied:  { bg: "#ffe3e3", color: "#c92a2a", icon: "⚠️", text: "Location unavailable — showing all open jobs" },
  }[locationStatus];

  return (
    <div className="page-container">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: "4px" }}>Discover Jobs</h1>
          <p className="text-muted">Find matching opportunities near you.</p>
        </div>

        {/* View Toggle */}
        <div style={{
          display: "flex", background: "#f1f3f5",
          borderRadius: "10px", padding: "4px", gap: "4px"
        }}>
          {[
            { id: "list", label: "☰  List View" },
            { id: "map",  label: "🗺  Map View"  },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              style={{
                padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 600,
                transition: "all 0.2s ease",
                background: viewMode === id ? "white" : "transparent",
                color: viewMode === id ? "#0ca678" : "#868e96",
                boxShadow: viewMode === id ? "0 2px 8px rgba(0,0,0,0.10)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Location Status Badge ───────────────────────────────────────────── */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        background: locationBadge.bg, color: locationBadge.color,
        padding: "6px 14px", borderRadius: "20px",
        fontSize: "12px", fontWeight: 500, marginBottom: "var(--space-4)"
      }}>
        {locationBadge.icon} {locationBadge.text}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "var(--space-5)", padding: "var(--space-4)" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", pointerEvents: "none" }}>🔍</span>
            <input
              className="input"
              placeholder="Search jobs, skills, keywords…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "38px", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <select
            className="input"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ width: "140px", flexShrink: 0 }}
          >
            <option value={5}>📍 Within 5 km</option>
            <option value={10}>📍 Within 10 km</option>
            <option value={20}>📍 Within 20 km</option>
            <option value={50}>📍 Within 50 km</option>
          </select>

          <select
            className="input"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            style={{ width: "150px", flexShrink: 0 }}
          >
            <option value="all">All Job Types</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="contract">Contract</option>
          </select>

          <button className="btn btn-primary" type="submit" style={{ flexShrink: 0, minWidth: "90px" }}>
            Search
          </button>
        </form>
      </div>

      {/* ── Map View ─────────────────────────────────────────────────────────── */}
      {viewMode === "map" && (
        <div style={{ marginBottom: "var(--space-6)" }}>
          {locationStatus === "denied" && (
            <div style={{
              background: "#fff3cd", border: "1px solid #ffc107",
              borderRadius: "10px", padding: "14px 18px",
              marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px",
              fontSize: "13px", color: "#856404"
            }}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <div>
                <strong>Location access denied.</strong> The map is centered on India. Enable location in your browser for nearby job discovery.
              </div>
            </div>
          )}
          <JobMap
            jobs={jobs}
            userCoords={userCoords}
            radius={radius}
            loading={loading}
          />
          {/* Quick stats row */}
          <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
            {[
              { label: "Jobs on map",    value: jobs.filter(j => j.location?.coordinates).length, icon: "📍" },
              { label: "Radius",         value: `${radius} km`,     icon: "📡" },
              { label: "Location",       value: locationStatus === "granted" ? "Active" : "Off", icon: "🛰" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                flex: 1, minWidth: "100px",
                background: "white", border: "1px solid var(--color-border)",
                borderRadius: "10px", padding: "10px 14px", textAlign: "center"
              }}>
                <div style={{ fontSize: "18px" }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "#212529" }}>{value}</div>
                <div style={{ fontSize: "11px", color: "#868e96" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── List View ─────────────────────────────────────────────────────────── */}
      {viewMode === "list" && (
        <>
          {loading ? (
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="card" style={{ padding: "var(--space-4)", opacity: 0.5 }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: "18px", background: "#e9ecef", borderRadius: "6px", width: "60%", marginBottom: "10px" }} />
                      <div style={{ height: "12px", background: "#e9ecef", borderRadius: "6px", width: "40%" }} />
                    </div>
                    <div style={{ height: "40px", background: "#e9ecef", borderRadius: "6px", width: "80px" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "var(--space-8)" }}>
              <span style={{ fontSize: "3rem" }}>📭</span>
              <h3 className="mt-4">No open jobs found</h3>
              <p className="text-muted">Try expanding the radius or changing your search terms.</p>
              <button className="btn btn-secondary" style={{ marginTop: "16px" }} onClick={() => setRadius(50)}>
                Expand to 50 km
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <p className="text-muted" style={{ fontSize: "13px" }}>
                Showing <strong>{jobs.length}</strong> {jobs.length === 1 ? "job" : "jobs"}
                {userCoords && ` within ${radius} km`}
              </p>
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  initiallySaved={savedJobIds.has(job._id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WorkerJobs;

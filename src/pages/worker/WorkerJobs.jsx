import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useUserProfile } from "../../context/useUserProfile";
import JobCard from "../../components/JobCard";
import JobMap from "../../components/JobMap";
import VoiceSearch from "../../components/VoiceSearch";

function WorkerJobs() {
  const navigate = useNavigate();
  const { profileData } = useUserProfile();
  const hasFetchedInitialRef = useRef(false);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [isVoiceFiltered, setIsVoiceFiltered] = useState(false);

  // Location state
  const [userCoords, setUserCoords] = useState(null);      // [lat, lng]
  const [locationStatus, setLocationStatus] = useState("pending"); // pending | granted | denied

  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(10000); // Default to 'Anywhere' (10000km) to ensure jobs show up
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

    let watchId;
    let isCancelled = false;
    let hasOverridden = false; // Add a simple flag to user scope if needed, or simply use a ref.

    // 1. Get a highly accurate initial position first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (isCancelled) return;
        const { latitude, longitude } = pos.coords;
        setUserCoords([latitude, longitude]);
        setLocationStatus("granted");
        fetchJobs(latitude, longitude, "", radius, jobType);

        // 2. Once we have a good initial fix, start tracking movement
        watchId = navigator.geolocation.watchPosition(
          (movePos) => {
            if (isCancelled) return;
            setUserCoords([movePos.coords.latitude, movePos.coords.longitude]);
          },
          (err) => console.warn("Watch position error:", err),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      },
      (err) => {
        if (isCancelled) return;
        console.warn("Geolocation denied/error initially:", err);
        setLocationStatus("denied");
        fetchJobs(null, null, "", radius, jobType);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      isCancelled = true;
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
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
    setIsVoiceFiltered(false); // Manually searching clears voice state
    const [lat, lng] = userCoords ?? [null, null];
    fetchJobs(lat, lng, searchQuery, radius, jobType);
  };

  const handleVoiceResults = (newJobs) => {
    setJobs(newJobs);
    setIsVoiceFiltered(true);
  };

  const clearVoiceSearch = () => {
    setIsVoiceFiltered(false);
    const [lat, lng] = userCoords ?? [null, null];
    fetchJobs(lat, lng, searchQuery, radius, jobType);
  };



  // ── UI helpers ─────────────────────────────────────────────────────────────
  const locationBadge = {
    pending: { bg: "rgba(255, 193, 7, 0.15)", color: "#b78103", icon: "⏳", text: "Finding you…" },
    granted: { bg: "rgba(34, 197, 94, 0.15)", color: "#15803d", icon: "🎯", text: "Location active" },
    denied:  { bg: "rgba(239, 68, 68, 0.15)", color: "#b91c1c", icon: "⚠️", text: "Location off — global search" },
  }[locationStatus];

  return (
    <div className="page-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>

      {/* ── Header Area ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px",
        marginBottom: "30px",
        padding: "20px 24px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.02)"
      }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>
            Discover Jobs
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0, fontWeight: "500" }}>
              Find matching opportunities near you
            </p>
            <div style={{ width: "4px", height: "4px", background: "#d1d5db", borderRadius: "50%" }} />
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: locationBadge.bg, color: locationBadge.color,
              padding: "4px 12px", borderRadius: "20px",
              fontSize: "12px", fontWeight: "600",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }}>
              {locationBadge.icon} {locationBadge.text}
            </div>
            {userCoords && (
              <div style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "SFMono-Regular, Consolas, monospace", background: "#f3f4f6", padding: "4px 8px", borderRadius: "6px" }}>
                {userCoords[0].toFixed(4)}, {userCoords[1].toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div style={{
          display: "flex", background: "#f3f4f6",
          borderRadius: "12px", padding: "4px", gap: "4px",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
        }}>
          {[
            { id: "list", label: "☰  List" },
            { id: "map",  label: "🗺  Map" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              style={{
                padding: "8px 24px", borderRadius: "8px", border: "none", cursor: "pointer",
                fontSize: "14px", fontWeight: "600",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                background: viewMode === id ? "white" : "transparent",
                color: viewMode === id ? "#FC6A03" : "#6b7280",
                boxShadow: viewMode === id ? "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Interactive Search Dashboard ─────────────────────────────────────── */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "16px 24px", 
        background: "white", 
        borderRadius: "16px", 
        boxShadow: "0 10px 30px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.03)"
      }}>
        {/* Text Search Form */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          
          <div style={{ flex: "2 1 300px", display: "flex", alignItems: "center", gap: "12px", background: "#f8f9fa", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", transition: "all 0.2s ease" }}>
            <span style={{ fontSize: "18px", color: "#9ca3af" }}>🔍</span>
            <input
              placeholder="Search jobs, skills, keywords…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: "15px", fontWeight: "500", color: "#111827" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", flex: "1 1 auto", flexWrap: "nowrap" }}>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "#fff", fontSize: "14px", fontWeight: "600", color: "#374151", outline: "none", cursor: "pointer", appearance: "none" }}
            >
              <option value={5}>📍 5 km</option>
              <option value={10}>📍 10 km</option>
              <option value={20}>📍 20 km</option>
              <option value={50}>📍 50 km</option>
              <option value={10000}>🌍 Anywhere</option>
            </select>

            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "#fff", fontSize: "14px", fontWeight: "600", color: "#374151", outline: "none", cursor: "pointer", appearance: "none" }}
            >
              <option value="all">⚡ All Types</option>
              <option value="hourly">⏱ Hourly</option>
              <option value="daily">📅 Daily</option>
              <option value="contract">📝 Contract</option>
            </select>
            
            <button type="submit" style={{ 
              padding: "0 24px", 
              background: "#FC6A03", 
              color: "white", 
              border: "none", 
              borderRadius: "12px", 
              fontSize: "15px", 
              fontWeight: "700", 
              cursor: "pointer", 
              boxShadow: "0 4px 12px rgba(252, 106, 3, 0.25)",
              transition: "transform 0.2s, boxShadow 0.2s"
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(252, 106, 3, 0.3)"; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(252, 106, 3, 0.25)"; }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Voice Filter Indicator */}
        {isVoiceFiltered && (
          <div style={{ 
            marginTop: "15px", 
            padding: "10px 15px", 
            backgroundColor: "#e7f5ff", 
            borderRadius: "8px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            border: "1px solid #a5d8ff"
          }}>
            <span style={{ fontSize: "13px", color: "#1971c2", fontWeight: "600" }}>
              ✨ Showing top AI-suggested jobs for your voice search
            </span>
            <button 
              onClick={clearVoiceSearch}
              style={{ 
                background: "transparent", 
                border: "none", 
                color: "#1971c2", 
                fontSize: "12px", 
                fontWeight: "bold", 
                cursor: "pointer", 
                textDecoration: "underline" 
              }}
            >
              Clear voice search
            </button>
          </div>
        )}
      </div>

      {/* ── Main Content Split Layout ───────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Left Column: Map or List View */}
        <div style={{ flex: "1 1 65%", minWidth: "300px" }}>
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
            <div className="card" style={{ 
              textAlign: "center", 
              padding: "var(--space-10) var(--space-4)", 
              border: "2px dashed #eee",
              backgroundColor: "#fafafa"
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🕵️‍♂️</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#2d3436" }}>No jobs found matching your criteria</h3>
              <p className="text-muted" style={{ maxWidth: "400px", margin: "10px auto 25px auto", lineHeight: 1.5 }}>
                Try expanding your search radius or using different keywords to find more opportunities.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button className="btn btn-primary" onClick={() => setRadius(50)}>
                  Expand to 50 km
                </button>
                <button className="btn btn-secondary" onClick={() => {setSearchQuery(""); setJobType("all");}}>
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid #f3f4f6" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#111827" }}>
                  Available Matches
                </h3>
                <span style={{ background: "#f3f4f6", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", color: "#4b5563" }}>
                  {jobs.length} Result{jobs.length !== 1 ? 's' : ''}
                </span>
              </div>
              {jobs.map((job, index) => (
                <JobCard
                  key={job._id || job.id}
                  job={job}
                  workerId={profileData?._id}
                  initiallySaved={savedJobIds.has(job._id || job.id)}
                  isTopPick={index === 0}
                  userCoords={userCoords}
                />
              ))}
            </div>
          )}
        </>
      )}
      </div>

        {/* Right Column: Voice Search Sidebar */}
        <div style={{ 
          flex: "1 1 30%", 
          maxWidth: "350px", 
          background: "white", 
          padding: "30px 20px", 
          borderRadius: "16px", 
          boxShadow: "0 10px 30px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
          border: "1px solid rgba(0,0,0,0.03)",
          position: "sticky",
          top: "80px"
        }}>
          <h3 style={{ textAlign: "center", fontSize: "16px", fontWeight: "700", color: "#374151", marginBottom: "20px" }}>
            AI Assistant
          </h3>
          <VoiceSearch onResults={handleVoiceResults} userCoords={userCoords} />
        </div>

      </div>
    </div>
  );
}

export default WorkerJobs;

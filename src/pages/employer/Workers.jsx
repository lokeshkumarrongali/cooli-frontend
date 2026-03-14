import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWorkers } from "../../services/workerService";
import WorkerCard from "../../components/WorkerCard";

const SKILL_SUGGESTIONS = [
  "Plumbing", "Electrical", "Carpentry", "Masonry", "Painting",
  "Welding", "Farming", "Driving", "Cooking", "Cleaning",
  "AC Repair", "Gardening", "Security", "Tailoring"
];

function Workers() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const debounceRef = useRef(null);

  const [filters, setFilters] = useState({
    q: "",
    skill: "",
    district: "",
    rating: "",
    experience: "",
    radius: "20",
    useGeo: false
  });

  // ---------- Geo detection on mount ----------
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationEnabled(true);
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => setLocationEnabled(false)
      );
    }
  }, []);

  // ---------- Core fetch ----------
  const loadWorkers = useCallback(async (page = 1, overrideFilters = filters) => {
    setLoading(true);
    try {
      const params = { ...overrideFilters, page, limit: 12 };
      if (overrideFilters.useGeo && userCoords) {
        params.lat = userCoords.lat;
        params.lng = userCoords.lng;
        params.radius = overrideFilters.radius;
      }
      const res = await fetchWorkers(params);
      setWorkers(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error("Worker fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [filters, userCoords]);

  // ---------- Initial load ----------
  useEffect(() => {
    loadWorkers(1);
  }, []); // eslint-disable-line

  // ---------- Debounce on q ----------
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadWorkers(1, filters);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [filters.q]); // eslint-disable-line

  const handleFilterChange = (field, val) => {
    setFilters(prev => ({ ...prev, [field]: val }));
  };

  const applyFilters = () => loadWorkers(1, filters);

  const clearFilters = () => {
    const cleared = { q: "", skill: "", district: "", rating: "", experience: "", radius: "20", useGeo: false };
    setFilters(cleared);
    loadWorkers(1, cleared);
  };

  const handlePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    loadWorkers(newPage, filters);
  };

  return (
    <div className="page-container">
      {/* ---- Header ---- */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="page-title">Find Workers</h1>
        <p className="text-muted">
          Discover skilled local workers. {pagination.total > 0 && <strong>{pagination.total} workers found</strong>}
        </p>
      </div>

      {/* ---- Search bar ---- */}
      <div className="card" style={{ marginBottom: "var(--space-4)", padding: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="Search by name, skill, or keyword..."
            value={filters.q}
            onChange={e => handleFilterChange("q", e.target.value)}
            style={{ flex: 1, minWidth: "220px" }}
          />
          <button className="btn btn-primary" onClick={applyFilters}>Search</button>
        </div>
        {/* Skill quick-select pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
          {SKILL_SUGGESTIONS.map(s => (
            <span
              key={s}
              onClick={() => { handleFilterChange("skill", filters.skill === s ? "" : s); }}
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                cursor: "pointer",
                backgroundColor: filters.skill === s ? "var(--color-primary)" : "var(--color-bg-muted)",
                color: filters.skill === s ? "white" : "var(--color-text)",
                border: "1px solid var(--color-border)",
                transition: "all 0.15s"
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "var(--space-6)", alignItems: "start" }}>
        {/* ---- Sidebar filters ---- */}
        <div className="card" style={{ position: "sticky", top: "80px" }}>
          <h4 style={{ margin: "0 0 16px 0", fontWeight: 600 }}>Filters</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label className="prop-label">Minimum Rating</label>
              <select className="input" value={filters.rating} onChange={e => handleFilterChange("rating", e.target.value)}>
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            <div>
              <label className="prop-label">Min. Experience (yrs)</label>
              <select className="input" value={filters.experience} onChange={e => handleFilterChange("experience", e.target.value)}>
                <option value="">Any</option>
                <option value="1">1+ Year</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
              </select>
            </div>

            <div>
              <label className="prop-label">District / Location</label>
              <input
                className="input"
                placeholder="e.g. Vizianagaram"
                value={filters.district}
                onChange={e => handleFilterChange("district", e.target.value)}
              />
            </div>

            {locationEnabled && (
              <div>
                <label className="prop-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={filters.useGeo}
                    onChange={e => handleFilterChange("useGeo", e.target.checked)}
                  />
                  Near Me
                </label>
                {filters.useGeo && (
                  <select className="input" value={filters.radius} onChange={e => handleFilterChange("radius", e.target.value)} style={{ marginTop: "6px" }}>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                )}
              </div>
            )}

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={applyFilters}>Apply</button>
            <button className="btn btn-secondary" style={{ width: "100%" }} onClick={clearFilters}>Clear</button>
          </div>
        </div>

        {/* ---- Results panel ---- */}
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <p className="text-muted">Searching workers...</p>
            </div>
          ) : workers.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "60px" }}>
              <h3>No workers found</h3>
              <p className="text-muted">Try broadening your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "var(--space-4)" }}>
                {workers.map(worker => (
                  <WorkerCard key={worker._id} worker={worker} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "var(--space-6)" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handlePage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: "14px" }}>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handlePage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Workers;

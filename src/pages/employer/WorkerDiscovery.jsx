import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function WorkerDiscovery() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [coords, setCoords] = useState([20.5937, 78.9629]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(20);
  const [minRating, setMinRating] = useState(0);

  const fetchWorkers = async (lat, lng, q, r, rating) => {
    setLoading(true);
    try {
      let url = lat && lng ? `/workers/search?lat=${lat}&lng=${lng}&radius=${r}` : "/workers/search?";
      if (q) url += `&q=${q}`;
      if (rating > 0) url += `&minRating=${rating}`;
      
      const response = await api.get(url);
      if (response.data?.data) {
        setWorkers(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch workers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationEnabled(true);
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          fetchWorkers(latitude, longitude, searchQuery, radius, minRating);
        },
        (error) => {
          console.warn("Geolocation denied/failed.", error);
          fetchWorkers(null, null, searchQuery, radius, minRating);
        }
      );
    } else {
      fetchWorkers(null, null, searchQuery, radius, minRating);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, minRating]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (locationEnabled) {
      fetchWorkers(coords[0], coords[1], searchQuery, radius, minRating);
    } else {
      fetchWorkers(null, null, searchQuery, radius, minRating);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-4)" }}>
        <div>
          <h1 className="page-title">Find Workers near you</h1>
          <p className="text-muted">Search independent and skilled local workers.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input 
            className="input" 
            placeholder="Search matching skills or names..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: "250px" }}
          />
          <select className="input" value={radius} onChange={(e) => setRadius(Number(e.target.value))} style={{ width: "auto" }}>
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={20}>Within 20 km</option>
            <option value={50}>Within 50 km</option>
          </select>
          <select className="input" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} style={{ width: "auto" }}>
            <option value={0}>Any Rating</option>
            <option value={3.5}>3.5+ Stars</option>
            <option value={4}>4.0+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
          </select>
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
      </div>

      {loading ? (
        <p>Searching for workers...</p>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {workers.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "var(--space-8)" }}>
              <span style={{ fontSize: "3rem" }}>📭</span>
              <h3 className="mt-4">No matching workers found</h3>
              <p className="text-muted">Adjust your search or filters to see more results.</p>
            </div>
          ) : (
            workers.map(worker => (
              <div key={worker._id} className="card interactive-card" style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                <img 
                  src={worker.sharedProfile?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Cooli"} 
                  alt="avatar" 
                  style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} 
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 5px 0" }}>
                    {worker.sharedProfile?.name || "Professional"} 
                    <span className="badge badge-verified" style={{ marginLeft: "10px", fontSize: "10px" }}>✔ Verified</span>
                  </h3>
                  <p className="text-muted" style={{ fontSize: "12px", margin: "0 0 10px 0" }}>
                    ⭐ {worker.workerProfile?.stats?.rating || 0} ({worker.workerProfile?.stats?.totalReviews || 0} reviews) • {worker.workerProfile?.stats?.jobsCompleted || 0} jobs done
                  </p>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {worker.workerProfile?.skills?.map((skill, idx) => (
                      <span key={idx} className="badge badge-role">{skill}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0ca678", marginBottom: "10px" }}>
                    {worker.workerProfile?.expectedWage ? `₹${worker.workerProfile?.expectedWage}` : "-"}
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default WorkerDiscovery;

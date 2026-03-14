import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Dynamically load Leaflet only in the browser (avoids SSR/Vite quirks)
let L = null;

async function getLeaflet() {
  if (L) return L;
  const leaflet = await import("leaflet");
  await import("leaflet/dist/leaflet.css");
  L = leaflet.default ?? leaflet;

  // Fix default icon paths broken by Vite
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl:       new URL("leaflet/dist/images/marker-icon.png",    import.meta.url).href,
    iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
    shadowUrl:     new URL("leaflet/dist/images/marker-shadow.png",  import.meta.url).href,
  });

  return L;
}

// ── Custom icon factories ─────────────────────────────────────────────────────
function makeJobIcon(leaflet, selected = false) {
  return leaflet.divIcon({
    className: "",
    html: `<div style="
      width:36px;height:36px;
      background:${selected ? "#0ca678" : "#f59f00"};
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 3px 14px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center">
      <span style="transform:rotate(45deg);font-size:14px">💼</span>
    </div>`,
    iconSize:    [36, 36],
    iconAnchor:  [18, 36],
    popupAnchor: [0, -40],
  });
}

function makeUserIcon(leaflet) {
  return leaflet.divIcon({
    className: "",
    html: `<style>@keyframes cpulse{0%{transform:scale(1);opacity:.7}70%{transform:scale(2.4);opacity:0}100%{transform:scale(2.4);opacity:0}}</style>
    <div style="position:relative;width:20px;height:20px">
      <div style="position:absolute;top:-4px;left:-4px;width:28px;height:28px;
        background:rgba(34,139,230,.2);border-radius:50%;animation:cpulse 2s infinite"></div>
      <div style="width:20px;height:20px;background:#228be6;border:3px solid white;
        border-radius:50%;box-shadow:0 2px 8px rgba(34,139,230,.7)"></div>
    </div>`,
    iconSize:   [20, 20],
    iconAnchor: [10, 10],
  });
}

// ── JobMap component (pure Leaflet, no react-leaflet) ─────────────────────────
export default function JobMap({ jobs = [], userCoords, radius = 10, loading = false, onSelectJob }) {
  const navigate      = useNavigate();
  const mapRef        = useRef(null);   // DOM div
  const instanceRef   = useRef(null);   // Leaflet map instance
  const markersRef    = useRef([]);     // job markers
  const userMarkerRef = useRef(null);
  const circleRef     = useRef(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const pinned = jobs.filter((j) => j.location?.coordinates?.length === 2);

  // ── Initialize map once ───────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    getLeaflet().then((leaflet) => {
      if (!mounted || !mapRef.current || instanceRef.current) return;

      const center = userCoords ?? [20.5937, 78.9629];
      const zoom   = userCoords ? 12 : 5;

      const map = leaflet.map(mapRef.current, {
        center, zoom, zoomControl: true, scrollWheelZoom: true,
      });

      leaflet.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap contributors" }
      ).addTo(map);

      instanceRef.current = map;
    });

    return () => {
      mounted = false;
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fly to user location when it becomes available ────────────────────────
  useEffect(() => {
    if (!instanceRef.current || !userCoords) return;
    instanceRef.current.flyTo(userCoords, 12, { animate: true, duration: 1 });
  }, [userCoords]);

  // ── Draw / update user marker + radius circle ─────────────────────────────
  useEffect(() => {
    if (!instanceRef.current || !userCoords) return;
    getLeaflet().then((leaflet) => {
      if (!instanceRef.current) return;

      // Remove old ones
      if (userMarkerRef.current) userMarkerRef.current.remove();
      if (circleRef.current)     circleRef.current.remove();

      userMarkerRef.current = leaflet
        .marker(userCoords, { icon: makeUserIcon(leaflet) })
        .addTo(instanceRef.current)
        .bindPopup("<div style='text-align:center;padding:4px 8px'><strong style='color:#228be6'>📱 You are here</strong></div>");

      circleRef.current = leaflet
        .circle(userCoords, {
          radius: radius * 1000,
          color: "#0ca678", fillColor: "#0ca678",
          fillOpacity: 0.05, weight: 1.5, dashArray: "6 4",
        })
        .addTo(instanceRef.current);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords, radius]);

  // ── Draw / update job markers when jobs change ────────────────────────────
  useEffect(() => {
    if (!instanceRef.current) return;
    getLeaflet().then((leaflet) => {
      if (!instanceRef.current) return;

      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      pinned.forEach((job) => {
        const [lng, lat] = job.location.coordinates;
        const marker = leaflet
          .marker([lat, lng], { icon: makeJobIcon(leaflet, false) })
          .addTo(instanceRef.current);

        const employerName =
          job.employerId?.employerProfile?.businessName ||
          job.employerId?.sharedProfile?.name ||
          "Employer";

        const skillBadges = (job.requiredSkills ?? [])
          .slice(0, 3)
          .map((s) => `<span style="font-size:10px;background:#d3f9d8;color:#2b8a3e;padding:2px 6px;border-radius:8px;margin:0 2px">${s}</span>`)
          .join("");

        marker.bindPopup(`
          <div style="min-width:185px;font-family:sans-serif">
            <p style="margin:0 0 2px;font-weight:700;font-size:14px;color:#212529">${job.title}</p>
            <p style="margin:0 0 4px;font-size:11px;color:#868e96">🏢 ${employerName}</p>
            <p style="margin:0 0 8px;font-size:11px;color:#868e96">📍 ${job.location?.address || "Map location"}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-weight:700;color:#0ca678;font-size:15px">₹${job.wage}<span style="font-weight:400;font-size:11px;color:#adb5bd">/day</span></span>
              <span style="font-size:10px;background:#f1f3f5;padding:2px 8px;border-radius:10px;text-transform:capitalize">${job.jobType || "contract"}</span>
            </div>
            <div style="margin-bottom:8px">${skillBadges}</div>
            <button
              id="popup-btn-${job._id}"
              style="width:100%;background:linear-gradient(135deg,#0ca678,#37b24d);color:white;border:none;
                     padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">
              View Job →
            </button>
          </div>
        `);

        marker.on("click",  () => setSelectedJob(job));
        marker.on("popupopen", () => {
          setTimeout(() => {
            const btn = document.getElementById(`popup-btn-${job._id}`);
            if (btn) btn.onclick = () => navigate(`/jobs/${job._id}`);
          }, 50);
        });

        markersRef.current.push(marker);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative", height: "560px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,.12)", border: "1px solid var(--color-border)" }}>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1000,
          background: "rgba(255,255,255,.82)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "12px"
        }}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{
            width: "44px", height: "44px",
            border: "4px solid #dee2e6",
            borderTop: "4px solid #0ca678",
            borderRadius: "50%", animation: "spin .8s linear infinite"
          }} />
          <p style={{ color: "#6c757d", fontWeight: 500, margin: 0 }}>Finding nearby jobs…</p>
        </div>
      )}

      {/* Stats pill */}
      <div style={{
        position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)",
        zIndex: 999, background: "white",
        padding: "6px 16px", borderRadius: "20px",
        boxShadow: "0 4px 16px rgba(0,0,0,.15)",
        fontSize: "13px", fontWeight: 600, color: "#343a40",
        display: "flex", alignItems: "center", gap: "6px",
        whiteSpace: "nowrap", pointerEvents: "none"
      }}>
        <span style={{ color: "#0ca678" }}>📍</span>
        {pinned.length} {pinned.length === 1 ? "job" : "jobs"} within {radius} km
      </div>

      {/* Map div */}
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />

      {/* Bottom slide-up panel */}
      {selectedJob && (
        <div style={{
          position: "absolute", bottom: "16px", left: "16px", right: "16px",
          zIndex: 999, background: "white",
          borderRadius: "14px",
          boxShadow: "0 8px 32px rgba(0,0,0,.18)",
          padding: "14px 18px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: "12px",
        }}>
          <style>{`@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
          <div style={{ flex: 1, minWidth: 0, animation: "slideUp .22s ease" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#212529", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedJob.title}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#868e96" }}>
              📍 {selectedJob.location?.address || "Map location"}
            </p>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "6px" }}>
              {selectedJob.requiredSkills?.slice(0, 4).map((s, i) => (
                <span key={i} style={{ fontSize: "10px", background: "#d3f9d8", color: "#2b8a3e", padding: "2px 6px", borderRadius: "8px", fontWeight: 500 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
            <span style={{ fontWeight: 800, fontSize: "17px", color: "#0ca678" }}>
              ₹{selectedJob.wage}
              <span style={{ fontWeight: 400, fontSize: "11px", color: "#adb5bd" }}>/day</span>
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setSelectedJob(null)}
                style={{ background: "#f1f3f5", border: "none", borderRadius: "8px", padding: "7px 12px", fontSize: "12px", cursor: "pointer", color: "#495057" }}
              >✕</button>
              <button
                onClick={() => navigate(`/jobs/${selectedJob._id}`)}
                style={{
                  background: "linear-gradient(135deg,#0ca678,#37b24d)",
                  color: "white", border: "none",
                  padding: "7px 16px", borderRadius: "8px",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer"
                }}
              >Apply Now →</button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && pinned.length === 0 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", zIndex: 998,
          background: "white", borderRadius: "16px",
          padding: "24px 32px", textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,.15)"
        }}>
          <p style={{ fontSize: "2.5rem", margin: 0 }}>📭</p>
          <p style={{ fontWeight: 700, margin: "10px 0 4px", color: "#212529" }}>No jobs nearby</p>
          <p style={{ color: "#868e96", fontSize: "13px", margin: 0 }}>Try increasing the search radius</p>
        </div>
      )}
    </div>
  );
}

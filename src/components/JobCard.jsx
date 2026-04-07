import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const JobCard = ({ job, workerId, onApplySuccess, isTopPick, initiallySaved, onRemoveSaved, userCoords }) => {
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(initiallySaved || false);

  const matchPercent = Math.round((job.hasOwnProperty('skillMatch') ? job.skillMatch : (job.score || 0)) * 100);

  // Calculate Haversine distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  };

  let liveDistanceKm = null;
  if (userCoords && job.location?.coordinates?.length >= 2) {
    const [uLat, uLng] = userCoords;
    
    // Auto-detect Lat/Lng inversion. 
    // In India, Longitude is ~68 to 97. Latitude is ~8 to 37.
    // If the coordinates array was accidentally saved as [Lat, Lng] in MongoDB, we fix it dynamically.
    let jLng = job.location.coordinates[0];
    let jLat = job.location.coordinates[1];
    
    // If index 0 is too small to be Indian longitude, and index 1 is large enough, they are inverted!
    if (jLng < 40 && jLat > 60) {
       jLng = job.location.coordinates[1];
       jLat = job.location.coordinates[0];
    }

    const dist = calculateDistance(uLat, uLng, jLat, jLng);
    if (dist !== null) {
      liveDistanceKm = dist.toFixed(1);
    }
  }

  const distanceKm = liveDistanceKm || ((job.distance || job.dist) ? ((job.distance || job.dist) / 1000).toFixed(1) : null);
  
  const handleApply = async (e) => {
    e.stopPropagation();
    if (applied || applying) return;

    try {
      setApplying(true);

      // Actual apply call
      await api.post(`/jobs/${job._id || job.id}/apply`, { workerId });
      setApplied(true);
      if (onApplySuccess) onApplySuccess(job._id || job.id);
    } catch (err) {
      console.error("Apply failed:", err);
      const msg = err.response?.data?.message || "Failed to apply. Please try again.";
      alert(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleInteraction = async () => {
     navigate(`/jobs/${job._id || job.id}`);
  };

  const toggleSave = async (e) => {
    e.stopPropagation();
    try {
      const jobId = job._id || job.id;
      if (isSaved) {
        await api.delete(`/jobs/${jobId}/save`);
        if (onRemoveSaved) onRemoveSaved(jobId);
      } else {
        await api.post(`/jobs/${jobId}/save`);
        alert("Job saved successfully!");
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save job. Please try again.");
    }
  };

  return (
    <div 
      onClick={handleInteraction}
      className={`card job-card-interactive ${isTopPick ? 'top-pick-card' : ''}`}
      style={{ 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 5. Top Pick Badge */}
      {isTopPick && (
        <div className="badge-top-pick">
          ⭐ TOP PICK
        </div>
      )}

      {/* Header: Title & Save */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
             <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
               {job.title}
             </h4>
             {matchPercent >= 80 ? (
               <span className="badge" style={{ fontSize: '10px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', fontWeight: '900' }}>
                 🟢 HIGH MATCH ({matchPercent}%)
               </span>
             ) : matchPercent >= 50 ? (
               <span className="badge" style={{ fontSize: '10px', backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a', fontWeight: '900' }}>
                 🟡 MEDIUM MATCH ({matchPercent}%)
               </span>
             ) : (
               <span className="badge" style={{ fontSize: '10px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: '900' }}>
                 🔴 LOW MATCH ({matchPercent}%)
               </span>
             )}
          </div>
          <p className="text-muted" style={{ fontSize: '12px', margin: 0, fontWeight: '500' }}>
             {job.location?.city || job.location?.address || 'Across India'} • {job.jobType || 'Daily'} • {distanceKm ? `${distanceKm} km away` : 'Nearby'}
          </p>
        </div>
        
        <button 
          onClick={toggleSave}
          className="btn-icon"
          style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: isSaved ? 'var(--color-primary)' : 'var(--color-bg-muted)',
            color: isSaved ? 'white' : '#888',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: isSaved ? '0 3px 10px rgba(252, 106, 3, 0.3)' : 'none'
          }}
        >
          {isSaved ? '🔖' : '📑'}
        </button>
      </div>

      {/* Middle: Wage & Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
         <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', color: '#888', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Expected Pay</span>
            <div style={{ color: 'var(--color-primary)', fontWeight: '900', fontSize: '20px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '14px' }}>₹</span>
              {job.wage || '---'}
              <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#888' }}>/day</span>
            </div>
         </div>
         
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: '#888', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Profile Match</span>
            <div style={{ color: 'var(--color-primary)', fontWeight: '900', fontSize: '18px' }}>
              {matchPercent}%
            </div>
         </div>
      </div>

      {/* Tags Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {(job.requiredSkills || job.skills)?.slice(0, 3).map((skill, i) => (
          <span key={i} className="badge badge-role" style={{ fontSize: '10px' }}>
            {skill}
          </span>
        ))}
        {distanceKm && (
          <span className="badge" style={{ fontSize: '10px', backgroundColor: '#f1f3f5', color: '#666' }}>
             📍 {distanceKm} KM AWAY
          </span>
        )}
      </div>

      {/* Bottom: Apply Button */}
      <button 
        onClick={handleApply}
        disabled={applied || applying}
        className={`btn ${applied ? 'btn-secondary' : 'btn-primary'}`}
        style={{ 
          width: '100%', 
          marginTop: '4px',
          backgroundColor: applied ? '#e6fcf5' : 'var(--color-primary)',
          color: applied ? '#0ca678' : 'white',
          border: applied ? '1px solid #12b886' : 'none'
        }}
      >
        {applying ? 'Processing...' : applied ? '✓ Successfully Applied' : 'Apply Now'}
      </button>
    </div>
  );
};

export default JobCard;

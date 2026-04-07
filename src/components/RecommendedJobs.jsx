import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import JobCard from './JobCard';

const RecommendedJobs = ({ workerId: propWorkerId }) => {
  const workerId = propWorkerId;
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workerId) {
      setLoading(false);
      return;
    }

    const fetchJobs = async (lat = null, lng = null) => {
      try {
        setLoading(true);
        let url = `/jobs/recommended/${workerId}`;
        if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
        
        const res = await api.get(url);
        const data = res.data;
        
        let mappedJobs = data?.data?.jobs || data?.data || data || [];
        
        // Sorting by score DESC & Limit to top 3
        if (Array.isArray(mappedJobs)) {
           mappedJobs = mappedJobs
             .sort((a, b) => (b.score || 0) - (a.score || 0))
             .slice(0, 3);
        }

        setJobs(Array.isArray(mappedJobs) ? mappedJobs : []);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to load suggestions";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Grab location if possible for better consistency
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchJobs(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchJobs(); // Fallback to profile location if denied
        },
        { timeout: 5000 }
      );
    } else {
      fetchJobs();
    }
  }, [workerId]);

  if (loading) {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-8 bg-gray-50 rounded-lg w-1/2 mb-4"></div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
             <div key={i} className="h-36 bg-gray-50 border border-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 border border-dashed border-red-200 bg-red-50/10 rounded-2xl flex flex-col items-center gap-2">
        <div className="text-[10px] font-black text-red-400 uppercase tracking-widest break-all text-center px-4">
          Error: {error}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="text-[9px] font-black text-red-500 uppercase tracking-[2px] transition-all hover:scale-105 active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="w-full p-8 border-2 border-dashed border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col items-center gap-4 text-center">
        <div className="text-gray-400 font-bold uppercase text-[9px] tracking-[4px]">No matches found</div>
        <button 
          className="px-6 py-2.5 bg-[#FC6A03] hover:bg-[#e85e00] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-orange-100"
          onClick={() => window.location.href="/worker/profile"}
        >
          Update My Profile
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Product Header */}
      <div className="flex justify-between items-end mb-5 border-b border-gray-50 pb-3">
        <div>
          <h3 className="text-[14px] font-black text-gray-900 flex items-center gap-2 leading-none">
            <span className="text-[#FC6A03]">⭐</span>
            Recommended
          </h3>
          <p className="text-[9px] text-gray-400 font-bold mt-1 tracking-tight">Best picks for your profile</p>
        </div>
        <button 
           onClick={() => window.location.href = "/worker/jobs"}
           style={{
             fontSize: '9px',
             fontWeight: '900',
             color: 'var(--color-primary)',
             backgroundColor: 'transparent',
             border: 'none',
             textTransform: 'uppercase',
             letterSpacing: '1px',
             display: 'flex',
             alignItems: 'center',
             cursor: 'pointer',
             transition: 'all 0.2s'
           }}
        >
          View All
          <span style={{ marginLeft: '4px' }}>→</span>
        </button>
      </div>
      
      {/* Modular Compact List */}
      <div className="flex flex-col gap-3 mt-3">
        {jobs.map((job, index) => (
          <JobCard 
            key={job._id || job.id} 
            job={job} 
            workerId={workerId}
            isTopPick={index === 0}
            onApplySuccess={(id) => {
               console.log("Optimistic apply captured:", id);
            }} 
          />
        ))}
      </div>

      {/* Trust Line */}
      <div className="mt-4 flex justify-between items-center px-1">
         <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
            {jobs.length} Top suggestions
         </p>
         <div className="h-[1px] bg-gray-100 flex-1 mx-3"></div>
         <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
            Updated Now
         </p>
      </div>
    </div>
  );
};

export default RecommendedJobs;

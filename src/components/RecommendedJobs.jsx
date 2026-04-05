import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const RecommendedJobs = ({ workerId }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/jobs/recommended/${workerId}`);
        const fetchedJobs = response.data?.data || response.data || [];
        setJobs(fetchedJobs);
      } catch (err) {
        setError("Failed to load recommended jobs");
      } finally {
        setLoading(false);
      }
    };

    if (workerId) {
      fetchRecommendedJobs();
    }
  }, [workerId]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <div className="animate-pulse text-gray-500 font-medium">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg flex flex-col items-center gap-3">
        <div className="text-gray-500 font-medium">No recommendations yet</div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
          Update Skills
        </button>
      </div>
    );
  }

  const sortedJobs = [...jobs].sort((a, b) => (b.score || 0) - (a.score || 0));
  const normalizedJobs = sortedJobs.map(job => ({
    ...job,
    title: job.title || job.jobId?.title,
    wage: job.wage || job.jobId?.wage
  }));

  return (
    <div className="w-full">
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-3">
        {normalizedJobs.slice(0, 5).map((job, index) => {
          const score = job.score || 0;
          const matchPercent = Math.round(score * 100);
          const distance = job.distance || Infinity;
          const wageScore = job.wageScore || 0;
          const isTopMatch = index === 0;
          
          const cardClass = `relative border rounded-2xl p-5 shadow-sm bg-white flex flex-col gap-4 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
            isTopMatch ? 'border-primary ring-1 ring-primary/30' : 'border-gray-200'
          }`;

          return (
            <div key={job._id || job.jobId?._id} className={cardClass}>
              {isTopMatch && (
                <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: 'var(--color-primary, #1c7ed6)' }}>
                  ⭐ Top Pick
                </div>
              )}
              
              <div className="flex justify-between items-start gap-3 mt-1">
                <h4 className="font-bold text-gray-900 text-lg m-0 truncate leading-tight">
                  {job.title}
                </h4>
                <div className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">
                  {matchPercent}% Match
                </div>
              </div>
              
              <div className="text-gray-800 font-semibold text-sm">
                {job.wage ? `Rs. ${job.wage}/day` : 'Competitive Wage'}
              </div>

              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                {score > 0.8 && (
                  <span className="bg-orange-50 border border-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium">🔥 Best Match</span>
                )}
                {distance < 5000 && (
                  <span className="bg-blue-50 border border-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">📍 Near You</span>
                )}
                {wageScore === 1 && (
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">💰 Good Pay</span>
                )}
              </div>

              <button className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-medium transition-colors duration-200" style={{ backgroundColor: 'var(--color-primary, #1c7ed6)' }}>
                Apply Now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedJobs;

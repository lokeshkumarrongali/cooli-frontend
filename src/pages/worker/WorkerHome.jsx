import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../../context/useUserProfile";
import api from "../../api/axios";
import JobCard from "../../components/JobCard";
import RecommendedJobs from "../../components/RecommendedJobs";

function WorkerHome() {
  const navigate = useNavigate();
  const { profileData } = useUserProfile();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  useEffect(() => {
    // Fetch saved jobs to show count and state
    api.get("/users/saved-jobs").then(res => {
      if (res.data?.data) {
        setSavedJobIds(new Set(res.data.data.map(j => j._id || j.id)));
      }
    }).catch(console.error);
  }, []);

  const firstName = profileData?.sharedProfile?.name?.split(' ')[0] || "Worker";

  const calculateCompletion = () => {
    let score = 0;
    const fields = [
      profileData?.sharedProfile?.photo,
      profileData?.sharedProfile?.bio,
      profileData?.workerProfile?.skills?.length > 0,
      profileData?.workerProfile?.experience,
      profileData?.sharedProfile?.address?.village || profileData?.sharedProfile?.address?.district,
      profileData?.workerProfile?.portfolio?.length > 0
    ];
    fields.forEach(field => {
      if (field) score += Math.ceil(100 / fields.length); 
    });
    return Math.min(score, 100);
  };
  
  const completionScore = calculateCompletion();

  const handleToggleAvailability = async () => {
    try {
      const current = profileData?.workerProfile?.availability || 'available';
      const nextStatus = current === 'available' ? 'busy' : 'available';
      
      const res = await api.patch("/workers/availability", { availability: nextStatus });
      if (res.data?.success) {
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Failed to update availability", err);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 60px 20px' }}>
      <style>
        {`
          .stat-card-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .ai-onboarding-card {
            background: linear-gradient(135deg, #fffaf6 0%, #fff 100%);
            border: 1px solid #ffe8cc;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 35px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(252, 106, 3, 0.05);
          }
          .ai-onboarding-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(252, 106, 3, 0.1);
          }
          .ai-pulse-icon {
            font-size: 2.5rem;
            animation: pulse-simple 2s infinite ease-in-out;
          }
          @keyframes pulse-simple {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          .main-content-split {
            display: grid;
            grid-template-columns: 2.2fr 1fr;
            gap: 30px;
          }
          @media (max-width: 900px) {
            .main-content-split { grid-template-columns: 1fr; }
          }
          .quick-action-btn {
            width: 100%;
            padding: 14px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 13px;
            letter-spacing: 0.5px;
          }
        `}
      </style>

      {/* Header & Status Section */}
      <div style={{ marginBottom: "30px" }}>
        <h1 className="page-title" style={{ color: "#2d3436", fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Good Morning, <span style={{ color: "var(--color-primary)" }}>{firstName}!</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '15px' }}>
          Explore New Opportunities • Manage Your Schedule • Track Earnings
        </p>
        
        <div style={{ 
          marginTop: "20px", 
          padding: "20px", 
          backgroundColor: "#fff", 
          borderRadius: "16px", 
          border: "1px solid #edf2f7",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: '#4a5568' }}>📊 Profile Strength</span>
            <span style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate("/worker/profile")}>
              {completionScore < 100 ? "Finish Setting Up →" : "Profile Complete ✓"}
            </span>
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#f1f3f5", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ width: `${completionScore}%`, height: "100%", backgroundColor: completionScore === 100 ? "#38d9a9" : "#FC6A03", transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}></div>
          </div>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="stat-card-row">
        {[
          { label: 'Worker Rating', value: `${profileData?.workerProfile?.stats?.rating || "0.0"} ★`, sub: `${profileData?.workerProfile?.stats?.totalReviews || 0} Reviews`, color: '#FC6A03', borderColor: '#FC6A03' },
          { label: 'Jobs Done', value: profileData?.workerProfile?.stats?.jobsCompleted || 0, sub: 'Success Rate: 100%', color: '#2d3436', borderColor: '#4a5568' },
          { label: 'Saved Items', value: savedJobIds.size, sub: 'View bookmarks', action: () => navigate("/worker/saved-jobs"), color: '#2d3436', borderColor: '#a5d8ff' },
          { label: 'Next Payment', value: '₹0.00', sub: 'Pending settlement', color: '#2d3436', borderColor: '#d3f9d8' }
        ].map((item, idx) => (
          <div key={idx} className="card" onClick={item.action} style={{ 
            cursor: item.action ? 'pointer' : 'default',
            borderBottom: `4px solid ${item.borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px'
          }}>
            <span style={{ fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</span>
            <span style={{ fontSize: '28px', fontWeight: 900, margin: '8px 0', color: item.color }}>{item.value}</span>
            <span style={{ fontSize: '10px', color: '#adb5bd', fontWeight: 600 }}>{item.sub}</span>
          </div>
        ))}
      </div>
      
      {/* 🤖 AI Voice Discovery Showcase */}
      <div className="ai-onboarding-card">
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '20px',
          backgroundColor: '#FC6A03',
          color: 'white',
          padding: '5px 12px',
          borderRadius: '30px',
          fontSize: '10px',
          fontWeight: 900,
          letterSpacing: '1px'
        }}>
          AI POWERED
        </div>

        <div style={{ display: 'flex', gap: '25px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ai-pulse-icon">🎭</div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#2d3436', fontWeight: 800 }}>Voice Discovery</h2>
            <p style={{ margin: 0, fontSize: '15px', color: '#636e72', lineHeight: 1.5 }}>
              Just speak into the microphone to find specific jobs. Try saying what you do in your local language!
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/worker/jobs')}
              style={{ padding: '15px 30px', borderRadius: '14px', fontSize: '14px', fontWeight: 800 }}
            >
              Start Discovery →
            </button>
          </div>
        </div>

        <div style={{ marginTop: '25px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#adb5bd', textTransform: 'uppercase' }}>Examples:</span>
          {["\"Driver job kavali\"", "\"Cleaning jobs near me\"", "\"Electrician work\""].map(cmd => (
            <div 
              key={cmd}
              style={{ 
                backgroundColor: 'rgba(252, 106, 3, 0.03)', 
                border: '1px dashed #fd7e14', 
                padding: '8px 16px', 
                borderRadius: '10px', 
                fontSize: '13px', 
                color: '#fd7e14',
                fontWeight: 600
              }}
            >
              {cmd}
            </div>
          ))}
        </div>
      </div>

      <div className="main-content-split">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Suggested for You</h3>
          </div>
          <RecommendedJobs workerId={profileData?._id} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Manage Work</h3>
          </div>
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button className="btn btn-primary quick-action-btn" onClick={() => navigate("/worker/profile")}>
              📝 Edit Profile
            </button>
            <button 
              className={`btn quick-action-btn ${profileData?.workerProfile?.availability === 'busy' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ 
                backgroundColor: profileData?.workerProfile?.availability === 'busy' ? '#fa5252' : '',
                borderColor: profileData?.workerProfile?.availability === 'busy' ? '#fa5252' : '',
                color: profileData?.workerProfile?.availability === 'busy' ? 'white' : ''
              }} 
              onClick={handleToggleAvailability}
            >
              {profileData?.workerProfile?.availability === 'busy' ? '🔴 Currently Busy' : '🟢 Set as Available'}
            </button>
            <button className="btn btn-secondary quick-action-btn" onClick={() => navigate("/worker/saved-jobs")}>
              🔖 Saved Jobs
            </button>
            <div style={{ height: '1px', backgroundColor: '#eee', margin: '5px 0' }} />
            <button className="btn btn-secondary quick-action-btn" style={{ border: 'none', color: '#636e72' }} onClick={() => navigate("/dashboard")}>
              🔄 Switch to Hiring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerHome;

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";

const Dashboard = () => {
  const { user, firebaseUser, triggerEmailVerification, logout } = useAuth();
  const [vMsg, setVMsg] = React.useState("");
  const [vError, setVError] = React.useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleResendVerification = async () => {
    try {
      setVMsg("");
      setVError("");
      await triggerEmailVerification();
      setVMsg("Verification email sent! Please check your inbox.");
    } catch (err) {
      setVError(err.message);
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-muted)' }}>
      <nav className="navbar">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size="sm" />
        </Link>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </nav>

      {firebaseUser && !firebaseUser.emailVerified && (
        <div style={{ 
          backgroundColor: '#fff4e5', 
          borderBottom: '1px solid #ffd8a8', 
          padding: '12px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '15px',
          color: '#663c00',
          fontSize: '14px'
        }}>
          <span><strong>Action Required:</strong> Please verify your email address.</span>
          <button 
            onClick={handleResendVerification}
            style={{ 
              backgroundColor: '#FC6A03', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            Resend Email
          </button>
          {vMsg && <span style={{ color: '#2b8a3e', fontWeight: 'bold' }}>{vMsg}</span>}
          {vError && <span style={{ color: '#c92a2a', fontWeight: 'bold' }}>{vError}</span>}
        </div>
      )}

      <main style={{ padding: 'var(--space-6) var(--space-4)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div className="card">
            <h2 className="mb-2">User Profile</h2>
            <p className="text-muted mb-4">Manage your account details and preferences.</p>
            
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-primary)' }}>NAME</label>
                <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: '500' }}>{user.name}</p>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-primary)' }}>EMAIL</label>
                <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: '500' }}>{user.email}</p>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-primary)' }}>ACCOUNT TYPE</label>
                <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: '500' }}>{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

const VerifyEmail = () => {
  const { firebaseUser, triggerEmailVerification, logout, loading } = useAuth();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Polling to detect verification (Optional, but better for UX)
  useEffect(() => {
    let interval;
    if (firebaseUser && !firebaseUser.emailVerified) {
      interval = setInterval(async () => {
        await firebaseUser.reload();
        if (firebaseUser.emailVerified) {
          clearInterval(interval);
          navigate("/dashboard");
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [firebaseUser, navigate]);

  const handleResend = async () => {
    try {
      setMsg("");
      setError("");
      await triggerEmailVerification();
      setMsg("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBackToLogin = async () => {
    await logout();
    navigate("/login");
  };

  if (!firebaseUser) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center' }}>
          <p className="text-muted">You must be logged in to view this page.</p>
          <button onClick={() => navigate("/login")} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
            Go to Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (firebaseUser.emailVerified) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#2b8a3e', marginBottom: '16px' }}>Email Verified!</h2>
          <p className="text-muted mb-6">Your email has been successfully verified.</p>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary" style={{ width: '100%' }}>
            Go to Dashboard
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
        <h1 className="logo" style={{ fontSize: '32px', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
          Coo<span className="logo-box">li</span>
        </h1>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#444', marginBottom: 'var(--space-4)' }}>Verify Your Email</h2>
        <p className="text-muted mb-6">
          We've sent a verification email to <strong>{firebaseUser.email}</strong>.
          Please click the link in the email to activate your account.
        </p>

        {msg && (
          <div style={{ 
            backgroundColor: '#f0fff4', 
            border: '1px solid #9ae6b4', 
            color: '#2f855a', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {msg}
          </div>
        )}

        {error && (
          <div style={{ 
            backgroundColor: '#fff5f5', 
            border: '1px solid #feb2b2', 
            color: '#c53030', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          <button 
            onClick={handleResend} 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%' }}
          >
            {loading ? "Sending..." : "Resend Verification Email"}
          </button>
          
          <button 
            onClick={handleBackToLogin} 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
          >
            Back to Login
          </button>
        </div>

        <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
          Once verified, you will be automatically redirected to your dashboard.
        </p>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;

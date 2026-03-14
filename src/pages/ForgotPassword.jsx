import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const { sendPasswordReset, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordReset(email);
      setMsg("Check your inbox for further instructions.");
      setEmail("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9f9f9',
      padding: '20px'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '450px', 
        backgroundColor: '#fff', 
        borderRadius: '12px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
          <Logo size="lg" />
        </div>
        <h2 style={{ color: '#FC6A03', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Reset Password</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>Enter your email to receive a password reset link.</p>

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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{ display: 'block', color: '#444', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Email address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FC6A03'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#ccc' : '#FC6A03',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => !loading && (e.target.style.opacity = '0.9')}
            onMouseOut={(e) => !loading && (e.target.style.opacity = '1')}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={{ color: '#666', fontSize: '14px' }}>
          Remember your password? <Link to="/login" style={{ color: '#FC6A03', textDecoration: 'none', fontWeight: '600' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

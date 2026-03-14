import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Logo from "../components/Logo";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  
  const { signupWithEmail, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    
    if (!name || !email || !password) {
      return setLocalError("Please fill in all fields");
    }

    try {
      await signupWithEmail(name, email, password);
      navigate("/verify-email");
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <AuthLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <Logo size="lg" />
        <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>Create your account to get started.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            className={`input ${localError || authError ? 'input-error' : ''}`}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            className={`input ${localError || authError ? 'input-error' : ''}`}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            className={`input ${localError || authError ? 'input-error' : ''}`}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {(localError || authError) && (
          <p className="error-message">{localError || authError}</p>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Create Account
        </button>
      </form>
      
      <p style={{ marginTop: 'var(--space-5)', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;

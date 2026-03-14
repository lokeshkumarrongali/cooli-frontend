import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Logo from "../components/Logo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  
  const { loginWithEmail, loginWithGoogle, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    
    if (!email || !password) {
      return setLocalError("Please fill in all fields");
    }

    try {
      await loginWithEmail(email, password);
      navigate("/dashboard");
    } catch (err) {
      // Error handled in context
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <AuthLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <Logo size="lg" />
        <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>Welcome back! Please login to your account.</p>
      </div>

      <form onSubmit={handleSubmit}>
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
          <div style={{ textAlign: 'right', marginTop: 'var(--space-2)' }}>
            <Link to="/forgot-password" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-xs)', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>
        </div>

        {(localError || authError) && (
          <p className="error-message">{localError || authError}</p>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Login
        </button>
      </form>
      
      <div style={{ margin: 'var(--space-5) 0', textAlign: 'center', color: 'var(--color-border)', fontSize: 'var(--font-size-sm)' }}>
        OR
      </div>
      
      <button onClick={handleGoogleLogin} className="btn btn-secondary" style={{ width: '100%' }}>
        Continue with Google
      </button>
      
      <p style={{ marginTop: 'var(--space-5)', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>Signup</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;

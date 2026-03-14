import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute Component
 * Redirects unauthenticated users to /login
 * Supports optional role-based access control
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: '#FC6A03', fontWeight: 'bold' }}>
        Loading Coolli...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mandatory Email Verification Guard
  if (firebaseUser && !firebaseUser.emailVerified) {
    console.warn("Access denied: Email not verified.");
    return <Navigate to="/verify-email" replace />;
  }

  // Optional Role Guard
  if (requiredRole && user.role !== requiredRole) {
    console.warn(`Access denied: Required role ${requiredRole}, found ${user.role}`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

import React from "react";
import Logo from "../components/Logo";

const AuthLayout = ({ children }) => {
  return (
    <div className="bg-profession-pattern" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 'var(--space-4)',
      position: 'relative'
    }}>
      {/* Corner Logo */}
      <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
        <Logo size="md" showCoo={false} />
      </div>

      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

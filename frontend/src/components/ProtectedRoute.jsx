import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: '#7E3FF2',
          fontWeight: 700,
          fontSize: '1.25rem',
          backgroundColor: '#FAFAFC'
        }}
      >
        VibeBite Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    if (allowedRoles.includes('superadmin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/restaurant/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user.role === 'superadmin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'restaurant') {
      return <Navigate to="/restaurant/dashboard" replace />;
    }
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#1F1A2E' }}>
        <h3>Access Denied</h3>
        <p>This web dashboard is for administrators and restaurant owners only.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

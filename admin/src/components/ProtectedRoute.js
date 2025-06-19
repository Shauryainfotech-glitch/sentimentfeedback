import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Component for handling protected routes
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Start with null for loading state
  
  useEffect(() => {
    // Check the authentication status
    const token = localStorage.getItem('adminToken');
    console.log('ProtectedRoute - Auth token check:', token ? 'Token found' : 'No token');
    setIsAuthenticated(!!token);
  }, []);
  
  // Show a loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #0A2362',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 2s linear infinite',
          marginBottom: '20px'
        }} />
        <p style={{ color: '#0A2362' }}>Loading dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  console.log('ProtectedRoute - Authentication confirmed, rendering children');
  return children;
};

export default ProtectedRoute;

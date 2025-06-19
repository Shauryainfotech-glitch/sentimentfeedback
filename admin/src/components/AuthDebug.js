import React, { useEffect, useState } from 'react';

// A debugging component to help us understand authentication issues
const AuthDebug = () => {
  const [authToken, setAuthToken] = useState(null);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Check token on mount and set up interval to check every second
    checkTokenAndPath();
    const interval = setInterval(checkTokenAndPath, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkTokenAndPath = () => {
    const token = localStorage.getItem('adminToken');
    setAuthToken(token);
    setCurrentPath(window.location.pathname);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 10000,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 5px 0' }}>Auth Debug Info:</h4>
      <p style={{ margin: '2px 0' }}>Path: {currentPath}</p>
      <p style={{ margin: '2px 0' }}>Token: {authToken ? '✅ Present' : '❌ Missing'}</p>
      {authToken && <p style={{ margin: '2px 0', wordBreak: 'break-all' }}>Value: {authToken}</p>}
    </div>
  );
};

export default AuthDebug;

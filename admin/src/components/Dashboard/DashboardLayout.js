import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../styles/Dashboard.css";
import LanguageSwitcher from "../LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";

const DashboardLayout = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage(); // Use language context
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [expandCorrectiveMeasures, setExpandCorrectiveMeasures] = useState(false);

  // Language is now handled by i18n.js with localStorage persistence

  // Check for mobile screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Extract email from JWT token
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        // Parse the JWT token without verification (frontend only)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        if (payload.email) {
          setUserEmail(payload.email);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  // Function to show logout confirmation modal
  const handleLogoutClick = (e) => {
    e.preventDefault();
    setLogoutModalOpen(true);
  };

  // Logout function after confirmation
  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    
    try {
      // Call logout API
      const API_URL = process.env.REACT_APP_API_URL ;
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove token from localStorage
      localStorage.removeItem('adminToken');
      
      // Close the modal
      setLogoutModalOpen(false);
      
      // Redirect to login page
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, remove the token and redirect
      localStorage.removeItem('adminToken');
      setLogoutModalOpen(false);
      navigate('/admin/login');
    }
  };

  // Language change functionality now handled by LanguageSwitcher component

  return (
    <div className="dashboard-container">
      {/* Mobile menu overlay */}
      {isOpen && isMobile && (
        <div 
          className="sidebar-overlay" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{width: isOpen ? (isMobile ? '200px' : '250px') : '60px'}}>
        <div className="sidebar-header">
          <h2 style={{display: isOpen ? 'block' : 'none'}}>{t('adminDashboard')}</h2>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isOpen ? "←" : "→"}
          </button>
        </div>
        
        <div className="sidebar-content">
          <ul>
            <li className={location.pathname === "/admin/dashboard/feedback" ? "active" : ""}>
              <Link 
                to="/admin/dashboard/feedback" 
                onClick={isMobile ? toggleSidebar : undefined}
                title={!isOpen ? t('receivedFeedback') : ""}  // Show title attribute only when sidebar is collapsed
                style={{color: 'white'}}
              >
                <span className="icon" style={{color: 'white'}}>💬</span>
                <span className="text" style={{color: 'white'}}>{t('receivedFeedback')}</span>
              </Link>
            </li>
            <li className={location.pathname === "/admin/dashboard/analytics" ? "active" : ""}>
              <Link 
                to="/admin/dashboard/analytics" 
                onClick={isMobile ? toggleSidebar : undefined}
                title={!isOpen ? t('analytics') : ""}
                style={{color: 'white'}}
              >
                <span className="icon" style={{color: 'white'}}>📊</span>
                <span className="text" style={{color: 'white'}}>{t('analytics')}</span>
              </Link>
            </li>
            <li className={location.pathname === "/admin/dashboard/sentiment" ? "active" : ""}>
              <Link 
                to="/admin/dashboard/sentiment" 
                onClick={isMobile ? toggleSidebar : undefined}
                title={!isOpen ? t('sentimentAnalysis') : ""}
                style={{color: 'white'}}
              >
                <span className="icon" style={{color: 'white'}}>📈</span>
                <span className="text" style={{color: 'white'}}>{t('sentimentAnalysis')}</span>
              </Link>
            </li>
            
            {/* Corrective Measures */}
            <li className={location.pathname === "/admin/dashboard/corrective-measures" ? "active" : ""}>
              <Link 
                to="/admin/dashboard/corrective-measures" 
                onClick={isMobile ? toggleSidebar : undefined}
                title={!isOpen ? t('correctiveMeasures') : ""}
                style={{color: 'white'}}
              >
                <span className="icon" style={{color: 'white'}}>🔧</span>
                <span className="text" style={{color: 'white'}}>{t('correctiveMeasures')}</span>
              </Link>
            </li>
            
            <li className="logout">
              <a 
                href="#" 
                onClick={(e) => { 
                  if (isMobile) toggleSidebar();
                  handleLogoutClick(e);
                }}
                title={!isOpen ? t('logout') : ""}
                style={{color: 'white'}}
              >
                <span className="icon" style={{color: 'white'}}>🚪</span>
                <span className="text" style={{color: 'white'}}>{t('logout')}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content" style={{marginLeft: isMobile ? 0 : (isOpen ? '250px' : '60px')}}>
        <div className="top-bar">
          <div className="page-title">
            {isMobile && (
              <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                ☰
              </button>
            )}
            <h2>{t('dashboardTitle')}</h2>
          </div>
          
          <div className="top-bar-right">
            <div className="language-selector">
              <LanguageSwitcher />
            </div>
            <div className="user-info">
              {userEmail ? `${t('welcome')} ${userEmail}` : t('welcome')}
            </div>
          </div>
        </div>
        
        <div className="content">
          <Outlet />
        </div>
      </div>
      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="modal-content"
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              width: '90%',
              maxWidth: '400px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header" style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>{t('logout')}</h3>
            </div>
            <div className="modal-body" style={{ marginBottom: '20px' }}>
              <p>{t('confirmLogout', 'Are you sure you want to logout?')}</p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setLogoutModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f1f1f1',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {t('cancel', 'Cancel')}
              </button>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {t('confirmYes', 'Yes, Logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

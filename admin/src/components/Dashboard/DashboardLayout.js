import React, { useState, useEffect } from "react";
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
  
  // Logout function
  const handleLogout = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    try {
      // Call logout API
      const API_URL = process.env.REACT_APP_API_URL ;
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove token from localStorage
      localStorage.removeItem('adminToken');
      
      // Redirect to login page
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, remove the token and redirect
      localStorage.removeItem('adminToken');
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
                  handleLogout(e);
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
    </div>
  );
};

export default DashboardLayout;

import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
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

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
              <Link to="/admin/dashboard/feedback" onClick={isMobile ? toggleSidebar : undefined}>
                <span className="icon">💬</span>
                <span className="text" style={{display: isOpen ? 'inline' : 'none'}}>{t('receivedFeedback')}</span>
              </Link>
            </li>
            <li className={location.pathname === "/admin/dashboard/analytics" ? "active" : ""}>
              <Link to="/admin/dashboard/analytics" onClick={isMobile ? toggleSidebar : undefined}>
                <span className="icon">📊</span>
                <span className="text" style={{display: isOpen ? 'inline' : 'none'}}>{t('analytics')}</span>
              </Link>
            </li>
            <li className={location.pathname === "/admin/dashboard/sentiment" ? "active" : ""}>
              <Link to="/admin/dashboard/sentiment" onClick={isMobile ? toggleSidebar : undefined}>
                <span className="icon">📈</span>
                <span className="text" style={{display: isOpen ? 'inline' : 'none'}}>{t('sentimentAnalysis')}</span>
              </Link>
            </li>
            <li className="logout">
              <Link to="/admin/login" onClick={isMobile ? toggleSidebar : undefined}>
                <span className="icon">🚪</span>
                <span className="text" style={{display: isOpen ? 'inline' : 'none'}}>{t('logout')}</span>
              </Link>
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
              {t('welcome')}
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

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../styles/AnalyticsPage.css';
import { useLanguage } from '../../context/LanguageContext';

// Mock data for analytics
const analyticsData = {
  totalFeedback: 42,
  todayFeedback: 4,
  averageRating: 4.2,
  feedbackByCategory: [
    { name: 'Service', count: 18 },
    { name: 'Traffic', count: 12 },
    { name: 'Security', count: 8 },
    { name: 'Other', count: 4 }
  ],
  recentTrends: [
    { date: '11 Jun', count: 3 },
    { date: '12 Jun', count: 5 },
    { date: '13 Jun', count: 2 },
    { date: '14 Jun', count: 6 },
    { date: '15 Jun', count: 4 },
    { date: '16 Jun', count: 5 },
    { date: '17 Jun', count: 4 }
  ],
  ratingDistribution: {
    5: 18,
    4: 12,
    3: 7,
    2: 3,
    1: 2
  },
  feedbackByTime: [
    { time: '8-10 AM', count: 5 },
    { time: '10-12 PM', count: 8 },
    { time: '12-2 PM', count: 6 },
    { time: '2-4 PM', count: 10 },
    { time: '4-6 PM', count: 9 },
    { time: '6-8 PM', count: 4 }
  ],
  monthlyTrends: [
    { month: 'Jan', count: 15 },
    { month: 'Feb', count: 21 },
    { month: 'Mar', count: 25 },
    { month: 'Apr', count: 22 },
    { month: 'May', count: 30 },
    { month: 'Jun', count: 42 }
  ],
  locationData: [
    { area: 'Central Market', count: 14 },
    { area: 'Bus Stand', count: 10 },
    { area: 'City Park', count: 7 },
    { area: 'Police Station', count: 6 },
    { area: 'Other Areas', count: 5 }
  ]
};

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage(); // Use language context
  // Removed tabs as per request
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animateCharts, setAnimateCharts] = useState(false);

  useEffect(() => {
    // Reset loading state when language changes
    setLoading(true);
    
    // Simulate API fetch with a delay
    setTimeout(() => {
      // Create translated version of analytics data
      const translatedData = {
        ...analyticsData,
        feedbackByCategory: analyticsData.feedbackByCategory.map(item => ({
          ...item,
          name: t(item.name.toLowerCase())
        })),
        locationData: analyticsData.locationData.map(item => ({
          ...item,
          area: t(item.area.replace(/\s+/g, ''))
        }))
      };
      
      setAnalytics(translatedData);
      setLoading(false);
      
      // Trigger chart animations after data loads
      setTimeout(() => {
        setAnimateCharts(true);
      }, 300);
    }, 800);
  }, [t, currentLanguage]); // Use currentLanguage instead of i18n.language

  const renderOverviewTab = () => (
    <div className="dashboard-cards">
      <div className="dashboard-card today-feedback">
        <div className="card-content">
          <h3>{t('todaysFeedback')}</h3>
          <div className="card-value">{analytics?.todayFeedback}</div>
        </div>
        <div className="card-icon">📬</div>
      </div>
      
      <div className="dashboard-card total-feedback">
        <div className="card-content">
          <h3>{t('totalFeedback')}</h3>
          <div className="card-value">{analytics?.totalFeedback}</div>
        </div>
        <div className="card-icon">📋</div>
      </div>
      
      <div className="dashboard-card average-rating">
        <div className="card-content">
          <h3>{t('averageRating')}</h3>
          <div className="card-value">{analytics?.averageRating} / 5</div>
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className={i < Math.floor(analytics?.averageRating) ? "star filled" : "star"}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="card-icon">⭐</div>
      </div>
      
      <div className="trends-chart">
        <h3>{t('monthlyFeedbackTrends')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics?.monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0A2362" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="analytics-page">
      <h1>{t('feedbackAnalytics')}</h1>

      <div className="analytics-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('loadingAnalyticsData')}</p>
          </div>
        ) : (
          renderOverviewTab()
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../styles/AnalyticsPage.css';
import { useLanguage } from '../../context/LanguageContext';

// API URL from environment variable or default to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Function to get color based on rating value (0-10 scale)
const getRatingColor = (rating) => {
  const numRating = Number(rating) || 0;
  if (numRating >= 8) return '#4CAF50'; // Green for high ratings
  if (numRating >= 6) return '#2196F3'; // Blue for good ratings
  if (numRating >= 4) return '#FF9800'; // Orange for average ratings
  return '#F44336'; // Red for low ratings
};


// Month names for displaying all 12 months
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch feedback data from API
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch feedback data from API without authentication for now
      const response = await fetch(`${API_URL}/feedback`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }
      
      const data = await response.json();
      processAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Process feedback data into analytics metrics
  const processAnalyticsData = (feedbackData) => {
    // Get current date for today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count today's feedback
    const todayFeedback = feedbackData.filter(item => {
      if (!item.createdAt) return false;
      const feedbackDate = new Date(item.createdAt);
      feedbackDate.setHours(0, 0, 0, 0);
      return feedbackDate.getTime() === today.getTime();
    }).length;
    
    // Total feedback count
    const totalFeedback = feedbackData.length;
    
    // Calculate average rating (on 10 point scale)
    let totalRating = 0;
    let ratedItems = 0;
    
    feedbackData.forEach(item => {
      if (item.overallRating !== undefined && item.overallRating !== null) {
        totalRating += Number(item.overallRating);
        ratedItems++;
      }
    });
    
    const averageRating = ratedItems > 0 ? (totalRating / ratedItems).toFixed(1) : '0.0';
    
    // Generate monthly data for chart (all 12 months)
    const currentYear = today.getFullYear();
    
    // Initialize counts for all months
    const monthCounts = Array(12).fill(0);
    
    // Count feedback by month
    feedbackData.forEach(item => {
      if (item.createdAt) {
        const date = new Date(item.createdAt);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          monthCounts[month]++;
        }
      }
    });
    
    // Create chart data with all 12 months
    const monthlyTrends = monthNames.map((month, index) => ({
      month,
      count: monthCounts[index]
    }));
    
    // Set analytics state
    setAnalytics({
      todayFeedback,
      totalFeedback,
      averageRating,
      monthlyTrends
    });
    
    setLoading(false);
  };
  
  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up interval to refresh data every minute
    const refreshInterval = setInterval(() => {
      fetchAnalyticsData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [currentLanguage]); // Refetch when language changes

  const renderOverviewTab = () => (
    <div className="dashboard-cards">
      <div className="dashboard-card today-feedback">
        <div className="card-content">
          <h3>{t('todaysFeedback', "Today's Feedback")}</h3>
          <div className="card-value">{analytics?.todayFeedback || 0}</div>
        </div>
        <div className="card-icon">📬</div>
      </div>
      
      <div className="dashboard-card total-feedback">
        <div className="card-content">
          <h3>{t('totalFeedback', "Total Feedback")}</h3>
          <div className="card-value">{analytics?.totalFeedback || 0}</div>
        </div>
        <div className="card-icon">📋</div>
      </div>
      
      <div className="dashboard-card average-rating">
        <div className="card-content">
          <h3>{t('averageRating', "Average Rating")}</h3>
          <div className="card-value">{analytics?.averageRating || 0} / 10</div>
          <div className="rating-meter">
            <div 
              className="rating-meter-fill" 
              style={{ 
                width: `${(analytics?.averageRating / 10) * 100}%`,
                backgroundColor: getRatingColor(analytics?.averageRating) 
              }}
            ></div>
          </div>
        </div>
        <div className="card-icon">⭐</div>
      </div>
      
      <div className="trends-chart">
        <h3>{t('monthlyFeedbackTrends', "Monthly Feedback Trends")}</h3>
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
      <h1>{t('feedbackAnalytics', 'Feedback Analytics')}</h1>

      <div className="analytics-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('loadingAnalyticsData', 'Loading analytics data...')}</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button" 
              onClick={fetchAnalyticsData}
            >
              {t('retry', 'Try Again')}
            </button>
          </div>
        ) : (
          renderOverviewTab()
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;

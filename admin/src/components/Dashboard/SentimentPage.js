import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector, LineChart, Line } from 'recharts';
import '../../styles/AnalyticsPage.css';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';

// API URL from environment variable or default to localhost
const API_URL = process.env.REACT_APP_API_URL ;

// Month names for displaying all 12 months
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Colors for sentiment categories
const COLORS = {
  positive: '#4CAF50', // Green for positive (6-10)
  neutral: '#FF9800',  // Orange for neutral (4-5)
  negative: '#F44336'  // Red for negative (1-3)
};

// Department list for categorization
const departments = ['Traffic', 'Women Safety', 'Narcotic Drugs', 'Cyber Crime'];

const SentimentPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  
  // Function to categorize ratings into sentiment categories
  const categorizeSentiment = (rating) => {
    const numRating = Number(rating) || 0;
    if (numRating >= 6 && numRating <= 10) return 'positive';
    if (numRating >= 4 && numRating <= 5) return 'neutral';
    if (numRating >= 1 && numRating <= 3) return 'negative';
    return 'neutral'; // Default if invalid rating
  };

  useEffect(() => {
    // Reset loading state when language changes or on component mount
    setLoading(true);
    setError(null);
    
    // Fetch feedback data from API
    const fetchFeedbackData = async () => {
      try {
        // Get the JWT token from localStorage
        const token = localStorage.getItem('adminToken');
        
        // Add token to request headers for authentication
        const response = await axios.get(`${API_URL}/feedback`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setFeedbackData(response.data);
        processFeedbackData(response.data);
      } catch (err) {
        console.error('Error fetching feedback data:', err);
        setError(t('errorFetchingData') || 'Error fetching feedback data');
        setLoading(false);
      }
    };
    
    fetchFeedbackData();
  }, [t, currentLanguage]); // Reload when language changes
  
  // Process feedback data to generate sentiment analysis
  const processFeedbackData = (data) => {
    if (!data || data.length === 0) {
      setSentiment({
        sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
        sentimentTrend: [],
        sentimentByCategory: []
      });
      setLoading(false);
      return;
    }
    
    // Count feedbacks by sentiment category
    let positive = 0, neutral = 0, negative = 0;
    
    // Process by month for trends
    const monthlyData = new Array(12).fill().map((_, index) => ({
      month: monthNames[index],
      positive: 0,
      neutral: 0,
      negative: 0,
      total: 0
    }));
    
    // Process by department
    const departmentData = departments.map(dept => ({
      name: dept,
      positive: 0,
      neutral: 0,
      negative: 0,
      total: 0
    }));
    
    // Analyze each feedback
    data.forEach(feedback => {
      const sentimentCategory = categorizeSentiment(feedback.overallRating);
      
      // Increment overall counters
      if (sentimentCategory === 'positive') positive++;
      else if (sentimentCategory === 'neutral') neutral++;
      else if (sentimentCategory === 'negative') negative++;
      
      // Process monthly data
      if (feedback.createdAt) {
        const date = new Date(feedback.createdAt);
        const month = date.getMonth();
        monthlyData[month][sentimentCategory]++;
        monthlyData[month].total++;
      }
      
      // Process department data
      if (feedback.departmentRatings && Array.isArray(feedback.departmentRatings)) {
        let deptRatings = feedback.departmentRatings;
        if (typeof deptRatings === 'string') {
          try {
            deptRatings = JSON.parse(deptRatings);
          } catch (e) {}
        }
        
        if (Array.isArray(deptRatings)) {
          deptRatings.forEach(deptRating => {
            if (deptRating && deptRating.department && deptRating.rating) {
              const deptIndex = departments.findIndex(d => d === deptRating.department);
              if (deptIndex >= 0) {
                const deptSentiment = categorizeSentiment(deptRating.rating);
                departmentData[deptIndex][deptSentiment]++;
                departmentData[deptIndex].total++;
              }
            }
          });
        }
      }
    });
    
    // Calculate percentages
    const total = positive + neutral + negative || 1; // Avoid division by zero
    const sentimentAnalysis = {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100)
    };
    
    // Format trend data as percentages
    const sentimentTrend = monthlyData.map(month => {
      const monthTotal = month.total || 1; // Avoid division by zero
      return {
        month: month.month,
        positive: Math.round((month.positive / monthTotal) * 100),
        neutral: Math.round((month.neutral / monthTotal) * 100),
        negative: Math.round((month.negative / monthTotal) * 100)
      };
    });
    
    // Format department data as percentages
    const sentimentByCategory = departmentData.map(dept => {
      const deptTotal = dept.total || 1; // Avoid division by zero
      return {
        name: dept.name,
        positive: Math.round((dept.positive / deptTotal) * 100),
        neutral: Math.round((dept.neutral / deptTotal) * 100),
        negative: Math.round((dept.negative / deptTotal) * 100)
      };
    });
    
    setSentiment({
      sentimentAnalysis,
      sentimentTrend,
      sentimentByCategory
    });
    
    setLoading(false);
  };

  // Custom pie chart rendering function
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {`${payload.name}: ${(percent * 100).toFixed(0)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const renderSentimentDistribution = () => {
    // No sentiment data yet
    if (!sentiment || !sentiment.sentimentAnalysis) return null;
    
    const data = [
      { name: t('positive'), value: sentiment?.sentimentAnalysis.positive, color: COLORS.positive },
      { name: t('neutral'), value: sentiment?.sentimentAnalysis.neutral, color: COLORS.neutral },
      { name: t('negative'), value: sentiment?.sentimentAnalysis.negative, color: COLORS.negative }
    ];
    
    // Determine if we're on a small screen using window width
    // Use a more responsive approach
    const isMobile = window.innerWidth < 576;

    return (
      <div className="dashboard-card sentiment-distribution">
        <h3>{t('overallSentimentDistribution')}</h3>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
            <PieChart margin={isMobile ? { top: 5, right: 5, bottom: 5, left: 5 } : { top: 5, right: 30, bottom: 5, left: 30 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={isMobile ? false : true}
                label={!isMobile}
                outerRadius={isMobile ? 70 : 90}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend 
                verticalAlign={isMobile ? "middle" : "bottom"}
                align={isMobile ? "right" : "center"}
                layout={isMobile ? "vertical" : "horizontal"}
                iconSize={isMobile ? 8 : 10}
                wrapperStyle={isMobile ? { right: 10 } : null}
              />
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="sentiment-stats">
          <div className="sentiment-stat-item">
            <div className="sentiment-color-box" style={{ backgroundColor: '#4CAF50' }}></div>
            <span>{t('positive')}: {sentiment?.sentimentAnalysis.positive}%</span>
          </div>
          <div className="sentiment-stat-item">
            <div className="sentiment-color-box" style={{ backgroundColor: '#FF9800' }}></div>
            <span>{t('neutral')}: {sentiment?.sentimentAnalysis.neutral}%</span>
          </div>
          <div className="sentiment-stat-item">
            <div className="sentiment-color-box" style={{ backgroundColor: '#F44336' }}></div>
            <span>{t('negative')}: {sentiment?.sentimentAnalysis.negative}%</span>
          </div>
        </div>
      </div>
    );
  };


  const renderCategorySentiment = () => {
    // Determine if we're on a small screen
    const isMobile = window.innerWidth < 576;
    const isTablet = window.innerWidth < 768 && window.innerWidth >= 576;
    
    return (
      <div className="dashboard-card category-sentiment">
        <h3>{t('sentimentAnalysisByCategory')}</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <BarChart
              data={sentiment?.sentimentByCategory}
              margin={isMobile ? { top: 20, right: 10, left: 0, bottom: 60 } : 
                     isTablet ? { top: 20, right: 20, left: 10, bottom: 60 } : 
                              { top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={0}
              barCategoryGap={isMobile ? 8 : 20}
              layout={isMobile ? "vertical" : "horizontal"}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {!isMobile ? (
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: isMobile ? 10 : 12 }} 
                  height={60} 
                  tickMargin={5} 
                  interval={0} 
                />
              ) : (
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 10 }}
                />
              )}
              {!isMobile ? (
                <YAxis />
              ) : (
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80} 
                  tick={{ fontSize: 10 }}
                />
              )}
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }} 
                iconSize={isMobile ? 8 : 10}
                layout={isMobile ? "horizontal" : "horizontal"}
              />
              <Bar dataKey="positive" name={t('positive')} fill="#4CAF50" />
              <Bar dataKey="neutral" name={t('neutral')} fill="#FF9800" />
              <Bar dataKey="negative" name={t('negative')} fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Add window resize handler for responsive updates
  useEffect(() => {
    const handleResize = () => {
      // Force a re-render when window size changes
      setForceUpdate(prev => !prev);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // State to force re-renders on resize
  const [forceUpdate, setForceUpdate] = useState(false);
  
  return (
    <div className="analytics-page">
      <h1>{t('sentimentAnalysis')}</h1>

      <div className="analytics-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('loadingSentimentData')}</p>
          </div>
        ) : (
          <>
            {error ? (
              <div className="error-message">
                <p>{error}</p>
              </div>
            ) : (
              <div className="sentiment-dashboard-cards">
                <div className="sentiment-card">
                  {renderSentimentDistribution()}
                </div>
                <div className="sentiment-card">
                  {renderCategorySentiment()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SentimentPage;

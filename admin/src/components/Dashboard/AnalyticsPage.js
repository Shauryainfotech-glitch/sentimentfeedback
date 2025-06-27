import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../../styles/AnalyticsPage.css';
import { useLanguage } from '../../context/LanguageContext';

// Import police stations data from FeedbackPage
import { policeStations } from './FeedbackPage'; // Make sure FeedbackPage exports policeStations

// Function to get translated station name
const getTranslatedStationName = (stationName, currentLanguage) => {
  if (!stationName) return '';
  
  // Find the station in our list
  const station = policeStations.find(s => 
    s.en.toLowerCase() === stationName.toLowerCase() || 
    s.mr === stationName
  );
  
  if (!station) return stationName; // Return original if not found
  
  // Return the appropriate translation based on current language
  return currentLanguage === 'mr' ? station.mr : station.en;
};

// API URL from environment variable or default to localhost
const API_URL = process.env.REACT_APP_API_URL;

// Function to get color based on rating value (0-10 scale)
const getRatingColor = (rating) => {
  const numRating = Number(rating) || 0;
  if (numRating >= 8) return '#4CAF50'; // Green for high ratings
  if (numRating >= 6) return '#2196F3'; // Blue for good ratings
  if (numRating >= 4) return '#FF9800'; // Orange for average ratings
  return '#F44336'; // Red for low ratings
};

// Colors for the donut chart sections
const DEPARTMENT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#6B8E23', '#9370DB'];

// Colors for departments needing improvement
const IMPROVEMENT_THRESHOLD = 5;
const IMPROVEMENT_COLOR = '#F44336'; // Red color for departments needing improvement
const GOOD_COLOR = '#4CAF50'; // Green color for departments in good standing

// Department name mappings between languages
const departmentNameMappings = {
  // English department names with multi-language variations
  'Traffic': ['Traffic', 'वाहतूक', 'ट्रॅफिक', 'वाहतूक विभाग'],
  'Women Safety': ['Women Safety', 'महिला सुरक्षा', 'महिला सुरक्षा विभाग'],
  'Narcotic Drugs': ['Narcotic Drugs', 'अमली पदार्थ', 'ड्रग्स', 'अमली पदार्थ विभाग'],
  'Cyber Crime': ['Cyber Crime', 'सायबर गुन्हे', 'सायबर', 'सायबर क्राईम', 'सायबर गुन्हे विभाग']
};

// Function to normalize text for better matching
const normalizeText = (text) => {
  if (!text) return '';
  return text.trim().toLowerCase();
};

// Function to get standardized English department name from any language variant
const getStandardDepartmentName = (deptName) => {
  if (!deptName) return deptName;
  
  // Try exact match first
  for (const [englishName, translations] of Object.entries(departmentNameMappings)) {
    const normalizedDeptName = normalizeText(deptName);
    
    // Check for exact matches
    const normalizedTranslations = translations.map(t => normalizeText(t));
    if (normalizedTranslations.includes(normalizedDeptName)) {
      return englishName;
    }
    
    // Check for partial matches (if the department name contains one of our known translations)
    for (const translation of normalizedTranslations) {
      if (normalizedDeptName.includes(translation) || translation.includes(normalizedDeptName)) {
        return englishName;
      }
    }
  }
  
  return deptName; // Return original if no mapping found
}

// Function to format date as DD/MM
const formatDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
};

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [departmentData, setDepartmentData] = useState([]);
  const [improvementData, setImprovementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overall'); // 'overall', 'department', 'policeStation'

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
  
      // Retrieve the JWT token from localStorage
      const token = localStorage.getItem('adminToken');
  
      // If no token exists, handle the error (e.g., redirect to login or show error message)
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }
  
      // Fetch feedback data from API with the Authorization header
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add the JWT token here
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }
  
      const data = await response.json();
      processAnalyticsData(data);
      
      // Fetch department rating analysis
      await fetchDepartmentData(token);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  const fetchDepartmentData = async (token) => {
    try {
      // Get department frequency data from feedback entries
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch department data');
      }
  
      const feedbackData = await response.json();
      processDepartmentData(feedbackData);
    } catch (err) {
      console.error('Error fetching department data:', err);
    }
  };
  
  const processDepartmentData = (feedbackData) => {
    if (!feedbackData || feedbackData.length === 0) {
      setDepartmentData([]);
      setImprovementData([]);
      return;
    }

    // List of specified departments we want to show
    const specifiedDepartments = ['Traffic', 'Women Safety', 'Narcotic Drugs', 'Cyber Crime'];
    
    // Initialize rating sums and counts for all specified departments
    const departmentStats = {};
    specifiedDepartments.forEach(dept => {
      departmentStats[dept] = {
        sum: 0,
        count: 0
      };
    });

    // Process ratings from feedback
    feedbackData.forEach(item => {
      let deptRatings = item.departmentRatings || {};
      
      if (typeof deptRatings === 'string') {
        try { deptRatings = JSON.parse(deptRatings); } catch (e) { return; }
      }
      
      // Handle different data structures
      if (Array.isArray(deptRatings)) {
        deptRatings.forEach(dept => {
          if (!dept || !dept.department) return;
          
          // Standardize department name using the multilingual mapping
          const standardDeptName = getStandardDepartmentName(dept.department);
          
          // Only process specified departments
          if (specifiedDepartments.includes(standardDeptName)) {
            // Convert rating to number if it's a string
            const rating = typeof dept.rating === 'string' ? parseFloat(dept.rating) : dept.rating;
            
            if (!isNaN(rating)) {
              departmentStats[standardDeptName].sum += rating;
              departmentStats[standardDeptName].count++;
            }
          }
        });
      } else if (typeof deptRatings === 'object') {
        // Handle object format {department: rating}
        Object.entries(deptRatings).forEach(([deptName, rating]) => {
          const standardDeptName = getStandardDepartmentName(deptName);
          
          if (specifiedDepartments.includes(standardDeptName)) {
            const numRating = parseFloat(rating);
            if (!isNaN(numRating)) {
              departmentStats[standardDeptName].sum += numRating;
              departmentStats[standardDeptName].count++;
            }
          }
        });
      }
    });
    
    // Get translated name for each department based on current language
    const getTranslatedDepartmentName = (englishName) => {
      // Use the translation function to respect language selection
      if (englishName === 'Traffic') return t('traffic', 'Traffic');
      if (englishName === 'Women Safety') return t('womenSafety', 'Women Safety');
      if (englishName === 'Narcotic Drugs') return t('narcoticDrugs', 'Narcotic Drugs');
      if (englishName === 'Cyber Crime') return t('cyberCrime', 'Cyber Crime');
      return englishName;
    };

    // Generate formatted department data for chart
    const formattedData = Object.entries(departmentStats)
      .filter(([_, stats]) => stats.count > 0)
      .map(([department, stats]) => {
        const avgRating = parseFloat((stats.sum / stats.count).toFixed(1));
        return {
          name: getTranslatedDepartmentName(department),  // Display translated name based on current language
          englishName: department,           // Keep English name for reference
          value: avgRating,
          count: stats.count,
          needsImprovement: avgRating < IMPROVEMENT_THRESHOLD
        };
      });
    
    // Sort departments by rating (ascending, so departments needing most attention come first)
    formattedData.sort((a, b) => a.value - b.value);
    
    // Set data for department rating chart
    setDepartmentData(formattedData);

    // Create data for improvement chart
    const improvementData = formattedData.map(dept => ({
      ...dept,
      fillColor: dept.needsImprovement ? IMPROVEMENT_COLOR : GOOD_COLOR
    }));
    
    setImprovementData(improvementData);
    setLoading(false);
  };
  
  // Process feedback data into analytics metrics (modified for 10 days)
  const processAnalyticsData = (feedbackData) => {
    // Default data if no feedback is available
    if (!feedbackData || feedbackData.length === 0) {
      setAnalytics({
        todayFeedback: 0,
        totalFeedback: 0,
        averageRating: 0,
        dailyTrends: [],
        policeStationData: []
      });
      setLoading(false);
      return;
    }

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
    
    // Generate daily data for chart (last 10 days)
    const dailyCounts = {};
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const tenDaysAgo = new Date(Date.now() - 10 * oneDay);
    
    // Initialize all dates in the past 10 days with 0 counts
    for (let i = 0; i <= 10; i++) {
      const date = new Date(Date.now() - i * oneDay);
      date.setHours(0, 0, 0, 0);
      dailyCounts[date.getTime()] = {
        date,
        count: 0
      };
    }
    
    // Count feedback by day
    feedbackData.forEach(item => {
      if (item.createdAt) {
        const feedbackDate = new Date(item.createdAt);
        feedbackDate.setHours(0, 0, 0, 0);
        
        // Only include dates in the last 10 days
        if (feedbackDate >= tenDaysAgo) {
          if (!dailyCounts[feedbackDate.getTime()]) {
            dailyCounts[feedbackDate.getTime()] = {
              date: feedbackDate,
              count: 0
            };
          }
          dailyCounts[feedbackDate.getTime()].count += 1;
        }
      }
    });
    
    // Convert to array and sort by date (oldest first)
    const dailyTrends = Object.values(dailyCounts)
      .sort((a, b) => a.date - b.date)
      .map(item => ({
        date: item.date,
        formattedDate: formatDate(item.date),
        count: item.count
      }));
    
    // Process police station data
    const policeStationMap = {};
    feedbackData.forEach(feedback => {
      const station = feedback.policeStation;
      if (station) {
        if (!policeStationMap[station]) {
          policeStationMap[station] = {
            count: 0,
            totalRating: 0,
            ratings: []
          };
        }
        policeStationMap[station].count += 1;
        
        const rating = Number(feedback.overallRating) || 0;
        policeStationMap[station].totalRating += rating;
        policeStationMap[station].ratings.push(rating);
      }
    });

    const policeStationData = Object.entries(policeStationMap).map(([station, data]) => {
      const translatedName = getTranslatedStationName(station, currentLanguage);
      return {
        name: translatedName,
        originalName: station, // Keep original name for reference
        count: data.count,
        averageRating: data.count > 0 ? (data.totalRating / data.count).toFixed(1) : 0,
        ratings: data.ratings
      };
    });

    // Sort by count (most feedback first)
    const byFeedbackCount = [...policeStationData];
    byFeedbackCount.sort((a, b) => b.count - a.count);
    
    // Sort by rating (highest rated first)
    const byRating = [...policeStationData];
    byRating.sort((a, b) => b.averageRating - a.averageRating);
    
    // Get top rated stations (stations with at least one feedback)
    const topRatedStations = byRating.filter(station => station.count > 0).slice(0, 3);

    // Set analytics state
    setAnalytics({
      todayFeedback,
      totalFeedback,
      averageRating,
      dailyTrends,
      policeStationData,
      totalPoliceStations: Object.keys(policeStationMap).length,
      topRatedStations: byRating.filter(station => station.count > 0).slice(0, 3),
      mostFeedbackStations: byFeedbackCount.slice(0, 3)
    });
    
    setLoading(false);
  };
  
  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up interval to refresh data every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchAnalyticsData();
    }, 300000); // Refresh every 5 minutes (300,000 ms)
    
    return () => clearInterval(refreshInterval);
  }, [currentLanguage, t]); // Refetch when language changes or translations change

  // Render tabs based on active selection
  const renderOverviewTab = () => {
    return (
      <div className="dashboard-cards">
        <div className="dashboard-card today-feedback">
          <div className="card-content">
            <h3>{t('todaysFeedback', "आजचा अभिप्राय")}</h3>
            <div className="card-value">{analytics?.todayFeedback || 0}</div>
          </div>
          <div className="card-icon">📬</div>
        </div>
        
        <div className="dashboard-card total-feedback">
          <div className="card-content">
            <h3>{t('totalFeedback', "एकूण अभिप्राय")}</h3>
            <div className="card-value">{analytics?.totalFeedback || 0}</div>
          </div>
          <div className="card-icon">📋</div>
        </div>
        
        <div className="dashboard-card average-rating">
          <div className="card-content">
            <h3>{t('averageRating', "सरासरी मूल्यांकन")}</h3>
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
          <h3>{t('dailyFeedbackTrends')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value, t('Feedback Count', 'Feedback Count')]}
                labelFormatter={(label) => t('date', 'Date') + ': ' + label}
              />
              <Legend />
              <Bar dataKey="count" fill="#0A2362" name={t('Feedback Count', 'Feedback Count')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="last-updated">
          {t('updated', 'Updated')}: {new Date().toLocaleTimeString()} ({t('refreshInterval', 'refreshes every 5 minutes')})
        </div>
      </div>
    );
  };

  // Render department analysis tab
  const renderDepartmentTab = () => {
    return (
      <div className="department-analysis">
        <h2>{t('departmentAnalysis', 'Department Analysis')}</h2>
        
        {/* Department Ratings Donut Chart */}
        <div className="top-issues-chart">
          <h3>{t('departmentRatings', "विभाग मूल्यांकन")} </h3>
          <div className="donut-chart-container" style={{ maxWidth: 400, width: '100%'}}>
            <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 220 : 400}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={window.innerWidth < 600 ? 80 : 150}
                  innerRadius={window.innerWidth < 600 ? 40 : 80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                  animationDuration={500}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, {payload}) => [`${t('rating', 'Rating')}: ${value}/10 (${payload.count} ${t('feedbacks', 'feedbacks')})`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="last-updated">
          {t('updated', 'Updated')}: {new Date().toLocaleTimeString()} ({t('refreshInterval', 'refreshes every 5 minutes')})
        </div>
      </div>
    );
  };

  // Render police station analysis tab
  const renderPoliceStationTab = () => {
    if (!analytics || !analytics.policeStationData || analytics.policeStationData.length === 0) {
      return (
        <div className="police-station-analysis empty-state">
          <h2>{t('policeStationAnalysis', 'Police Station Analysis')}</h2>
          <p>{t('noPoliceStationData', 'No police station data available')}</p>
        </div>
      );
    }
    
    return (
      <div className="police-station-analysis">
        <h2>{t('policeStationAnalysis', 'Police Station Analysis')}</h2>
        
        {/* Police Station Statistics Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-card total-stations">
            <div className="card-content">
              <h3>{t('totalPoliceStations', 'Total Police Stations')}</h3>
              <div className="card-value">{analytics?.totalPoliceStations || 0}</div>
            </div>
            <div className="card-icon">🏢</div>
          </div>
          
          <div className="dashboard-card most-rated-station">
            <div className="card-content">
              <h3>{t('topRatedStation', 'Top Rated Station')}</h3>
              {analytics?.topRatedStations?.[0] ? (
                <>
                  <div className="card-value">{analytics.topRatedStations[0].name}</div>
                  <div className="rating-info">{analytics.topRatedStations[0].averageRating}/10</div>
                </>
              ) : (
                <div className="card-value">-</div>
              )}
            </div>
            <div className="card-icon">⭐</div>
          </div>
          
          <div className="dashboard-card most-feedback-station">
            <div className="card-content">
              <h3>{t('mostFeedbackStation', 'Most Feedback Station')}</h3>
              {analytics?.mostFeedbackStations?.[0] ? (
                <>
                  <div className="card-value">{analytics.mostFeedbackStations[0].name}</div>
                  <div className="rating-info">{analytics.mostFeedbackStations[0].count} {t('feedbacks')}</div>
                </>
              ) : (
                <div className="card-value">-</div>
              )}
            </div>
            <div className="card-icon">📊</div>
          </div>
        </div>
        
        {/* Police Station Feedback Count */}
        <div className="station-feedback-count">
          <h3>{t('Feedback Count By Station')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.policeStationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0A2362" name={t('Feedback Count')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Police Station Average Ratings */}
        <div className="station-ratings">
          <h3>{t('Average Rating By Station')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.policeStationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageRating" name={t('averageRating')}>
                {analytics.policeStationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getRatingColor(entry.averageRating)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="last-updated">
          {t('updated', 'Updated')}: {new Date().toLocaleTimeString()} ({t('refreshInterval', 'refreshes every 5 minutes')})
        </div>
      </div>
    );
  };

  return (
    <div className="analytics-page">
      <h1>{t('feedbackAnalytics', 'अभिप्राय विश्लेषण')}</h1>
      
      {/* Analytics Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab-button ${activeTab === 'overall' ? 'active' : ''}`}
          onClick={() => setActiveTab('overall')}
        >
          {t('overallAnalysis', 'Overall Analysis')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'department' ? 'active' : ''}`}
          onClick={() => setActiveTab('department')}
        >
          {t('departmentAnalysis', 'Department Analysis')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'policeStation' ? 'active' : ''}`}
          onClick={() => setActiveTab('policeStation')}
        >
          {t('policeStationAnalysis', 'Police Station Analysis')}
        </button>
      </div>

      <div className="analytics-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('loadingAnalyticsData', 'विश्लेषण डेटा लोड होत आहे...')}</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button" 
              onClick={fetchAnalyticsData}
            >
              {t('retry', 'पुन्हा प्रयत्न करा')}
            </button>
          </div>
        ) : (
          activeTab === 'overall' ? renderOverviewTab() :
          activeTab === 'department' ? renderDepartmentTab() :
          renderPoliceStationTab()
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
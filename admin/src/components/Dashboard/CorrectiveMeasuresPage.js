import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import '../../styles/AnalyticsPage.css';
import '../../styles/CorrectiveMeasures.css';
import '../../styles/CorrectiveMeasuresEnhanced.css';
import '../../styles/DepartmentCards.css';
import '../../styles/BarChartResponsive.css'; // Mobile responsive styles for chart
import { useLanguage } from '../../context/LanguageContext';

// API URL from environment variable or default to localhost
const API_URL = process.env.REACT_APP_API_URL;

// Improvement threshold - departments scoring below this need attention
const IMPROVEMENT_THRESHOLD = 5;

// Colors for the chart
const NEEDS_IMPROVEMENT_COLOR = '#F44336'; // Red for departments needing improvement
const GOOD_STANDING_COLOR = '#4CAF50'; // Green for departments in good standing

// Polling interval in milliseconds (2 seconds) - extremely aggressive for immediate updates
const POLLING_INTERVAL = 2000;

// Flag to determine if data is being fetched for the first time or being refreshed
let isInitialLoad = true;

// Using a non-cached approach with direct XMLHttpRequest to bypass any browser caching
const fetchWithoutCache = async (url, token) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // Force a unique URL on every request with multiple random parameters
    const uniqueUrl = `${url}?_nocache=${Date.now()}&_r=${Math.random()}&_p=${performance.now()}`;
    
    xhr.open('GET', uniqueUrl, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Pragma', 'no-cache');
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    xhr.setRequestHeader('Expires', '0');
    
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      } else {
        reject(new Error(`HTTP error: ${this.status}`));
      }
    };
    
    xhr.onerror = function() {
      reject(new Error('Network error'));
    };
    
    xhr.send();
  });
};

const CorrectiveMeasuresPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Standard department list (English names)
  const standardDepartments = ['Traffic', 'Women Safety', 'Narcotic Drugs', 'Cyber Crime'];

  // Function to normalize text for better matching (trim spaces, convert to lowercase)
  const normalizeText = (text) => {
    if (!text) return '';
    // Convert to string in case we get a numeric or other type
    return String(text).trim().toLowerCase();
  };

  // Function to get standardized English department name from any language variant
  const getStandardDepartmentName = (deptName) => {
    if (!deptName) return deptName;
    
    console.log('Trying to map department name:', deptName);
    
    const normalizedDeptName = normalizeText(deptName);
    
    // Direct mapping for Marathi department names
    // This ensures that we catch the exact Marathi department names from the dropdown
    const marathiMapping = {
      'वाहतूक': 'Traffic',
      'महिला सुरक्षा': 'Women Safety',
      'अमली पदार्थ': 'Narcotic Drugs',
      'सायबर गुन्हे': 'Cyber Crime'
    };
    
    // Check direct Marathi mapping first
    if (marathiMapping[deptName]) {
      console.log(`Direct Marathi mapping found: "${deptName}" -> "${marathiMapping[deptName]}"`); 
      return marathiMapping[deptName];
    }
    
    // Check if the input matches any of our i18n translated department names
    for (const englishName of standardDepartments) {
      // Convert department name to lowercase for key lookup
      const deptKey = englishName.toLowerCase().replace(/ /g, '');
      
      // Get the translation for current language
      const translatedName = t(deptKey, englishName);
      
      // Check if normalized version matches either English or translated version
      if (normalizeText(englishName) === normalizedDeptName || 
          normalizeText(translatedName) === normalizedDeptName) {
        console.log('Mapped department name to:', englishName);
        return englishName;
      }
      
      // Check for partial matches
      if (normalizedDeptName.includes(normalizeText(englishName)) || 
          normalizedDeptName.includes(normalizeText(translatedName)) ||
          (translatedName && normalizeText(translatedName).includes(normalizedDeptName))) {
        console.log(`Mapped "${deptName}" to "${englishName}" (partial match)`);
        return englishName;
      }
    }
    
    // Last resort - try to match any part of the department name against known translations
    const deptWords = deptName.split(/\s+/); // Split by whitespace
    for (const word of deptWords) {
      if (word.length < 3) continue; // Skip very short words
      
      for (const englishName of standardDepartments) {
        const deptKey = englishName.toLowerCase().replace(/ /g, '');
        const translatedName = t(deptKey, englishName);
        
        if (translatedName.includes(word) || englishName.includes(word)) {
          console.log(`Word match found: "${word}" in "${deptName}" -> "${englishName}"`);
          return englishName;
        }
      }
    }
    
    console.log(`No mapping found for department: "${deptName}"`);
    return deptName; // Return original if no mapping found
  };

  // Fetch department data with refresh parameter to distinguish initial load vs refresh
  const fetchDepartmentData = async (isRefresh = false) => {
    try {
      // Only show full loading spinner on initial load, not on refreshes
      if (!isRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // Retrieve the JWT token from localStorage
      const token = localStorage.getItem('adminToken');

      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      // Super aggressive cache-busting with multiple parameters
      const now = new Date();
      const uuid = Array(16).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      const cacheBuster = `cacheBuster=${now.getTime()}&nocache=${uuid}&_=${Math.random()}`;
      
      console.log('Forcing absolute fresh data fetch at:', now.toLocaleTimeString());
      
      // Fetch feedback data from API with the Authorization header
      const response = await fetch(`${API_URL}/feedback?${cacheBuster}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }

      // Store previous values for comparison
      const prevDeptValues = {};
      departmentData.forEach(dept => {
        prevDeptValues[dept.name] = dept.value;
      });
      
      // Get fresh data
      const feedbackData = await response.json();
      
      // Process the new data to update state
      processDepartmentData(feedbackData);
      
      // Update last updated timestamp
      const refreshTime = new Date();
      setLastUpdated(refreshTime);
      setIsRefreshing(false);
      
      // Alert for significant data changes - helps debug when data updates
      if (isRefresh) {
        setTimeout(() => {
          const hasChanges = departmentData.some(dept => 
            prevDeptValues[dept.name] !== undefined && 
            prevDeptValues[dept.name] !== dept.value
          );
          
          console.log(
            hasChanges ? '✅ DATA CHANGED - REAL-TIME UPDATE SUCCESSFUL' : 'ℹ️ No significant data changes detected',
            'at', refreshTime.toLocaleTimeString()
          );
          
          console.log('New data summary:', 
            feedbackData.length, 'feedback items',
            hasChanges ? '(Changes detected)' : '(No changes)'
          );
        }, 100);
      }
    } catch (err) {
      console.error('Error fetching department data:', err);
      setError(err.message);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Ultra-aggressive manual refresh with BROWSER-LEVEL cache forcing
  const handleManualRefresh = () => {
    console.log('🔄 ULTRA FORCE REFRESH: Browser-level cache clear + complete state reset');
    
    setIsRefreshing(true);
    setError(null);
    
    setDepartmentData([]);
    setLoading(true);
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    const absoluteUniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    const currentLocation = window.location.href.split('?')[0];
    const newLocation = `${currentLocation}?forceRefresh=${absoluteUniqueId}`;
    
    console.log('🔥 EXTREME MEASURE: Updating URL with cache buster parameter:', absoluteUniqueId);
    window.history.pushState({ path: newLocation }, '', newLocation);
    
    setTimeout(() => {
      forceDataReload(false, true);
      
      setTimeout(() => {
        pollingIntervalRef.current = setInterval(() => {
          forceDataReload(true);
        }, POLLING_INTERVAL);
      }, 1500);
    }, 500);
  };

  // Special function to completely bypass all caching and force fresh data
  const forceDataReload = async (isPolling = false, forceRender = false) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setIsRefreshing(false);
        return;
      }
      
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const uuid = Array(16).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      const url = `${API_URL}/feedback?_nocache=${timestamp}&_r=${random}&_u=${uuid}&_force=true`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
        credentials: 'omit',
        mode: 'cors',
        redirect: 'follow'
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const freshData = await response.json();
      
      const prevValues = {};
      departmentData.forEach(dept => {
        prevValues[dept.name] = dept.value;
      });
      
      processDepartmentData(freshData);
      setLastUpdated(new Date());
      
      if (isPolling && Object.keys(prevValues).length > 0) {
        setTimeout(() => {
          let changes = [];
          departmentData.forEach(dept => {
            if (prevValues[dept.name] !== undefined && prevValues[dept.name] !== dept.value) {
              changes.push(`${dept.name}: ${prevValues[dept.name]} → ${dept.value}`);
            }
          });
          
          if (changes.length > 0) {
            console.log('🔔 REAL-TIME CHANGES DETECTED!', changes);
          }
        }, 100);
      }
      
      isInitialLoad = false;
      
    } catch (error) {
      console.error('Error during force reload:', error);
      setError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const processDepartmentData = (feedbackData) => {
    console.log('Processing fresh data from server -', new Date().toLocaleTimeString());
    const specifiedDepartments = ['Traffic', 'Women Safety', 'Narcotic Drugs', 'Cyber Crime'];
    const departmentStats = {};
    specifiedDepartments.forEach(dept => {
      departmentStats[dept] = {
        sum: 0,
        count: 0,
        allRatings: []
      };
    });
    
    feedbackData.forEach(item => {
      let deptRatings = item.departmentRatings;
      
      if (!deptRatings) return;
      if (typeof deptRatings === 'string') {
        try { deptRatings = JSON.parse(deptRatings); } catch (e) { return; }
      }
      if (!Array.isArray(deptRatings)) return;
      
      deptRatings.forEach(dept => {
        if (!dept || !dept.department) return;
        
        const standardDeptName = getStandardDepartmentName(dept.department);
        
        if (specifiedDepartments.includes(standardDeptName)) {
          let rating = dept.rating;
          
          if (typeof rating === 'string') {
            rating = parseFloat(rating);
          }
          
          if (!isNaN(rating)) {
            departmentStats[standardDeptName].sum += rating;
            departmentStats[standardDeptName].count += 1;
            departmentStats[standardDeptName].allRatings.push(rating);
          }
        }
      });
    });
    
    const formattedData = Object.entries(departmentStats)
      .filter(([_, stats]) => stats.count > 0)
      .map(([department, stats]) => {
        const avgRating = parseFloat((stats.sum / stats.count).toFixed(1));
        const deptKey = department.toLowerCase().replace(/ /g, '');
        return {
          name: department,
          displayName: t(deptKey, department),
          value: avgRating,
          count: stats.count,
          needsImprovement: avgRating < IMPROVEMENT_THRESHOLD
        };
      })
      .sort((a, b) => a.value - b.value);
      
    setDepartmentData(formattedData);
    setLoading(false);
  };

  useEffect(() => {
    forceDataReload(false);
    
    pollingIntervalRef.current = setInterval(() => {
      forceDataReload(true);
    }, POLLING_INTERVAL);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [currentLanguage]);

  // Function to get translated department name based on standard English name
  const getTranslatedDepartmentName = (deptName) => {
    // Get the standard English name first
    const standardName = getStandardDepartmentName(deptName);
    
    // If we couldn't map it to a standard name, return the original
    if (!standardName) return deptName;
    
    // Convert to lowercase and remove spaces for the key (ensuring correct key format)
    let deptKey;
    
    // Map standard English names to correct i18n keys
    if (standardName === 'Women Safety') {
      deptKey = 'womenSafety';
    } else if (standardName === 'Cyber Crime') {
      deptKey = 'cyberCrime';
    } else if (standardName === 'Narcotic Drugs') {
      deptKey = 'narcoticDrugs';
    } else if (standardName === 'Traffic') {
      deptKey = 'traffic';
    } else {
      // Default fallback (convert spaces to nothing, lowercase)
      deptKey = standardName.toLowerCase().replace(/ /g, '');
    }
    
    // Return the translated name
    return t(deptKey, standardName);
  };

  // Custom tooltip formatter for the chart
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const status = data.needsImprovement ? t('needsImprovement', 'Needs Improvement') : t('goodStanding', 'Good Standing');
      return (
        <div className="custom-tooltip">
          <p className="department-name">{getTranslatedDepartmentName(data.name)}</p>
          <p>{t('averageRating')}: <b>{data.value.toFixed(1)}/10</b></p>
          <p className="rating-status">
            {t('status')}: <span className={data.needsImprovement ? "needs-improvement" : "good-standing"}>
              {status}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Split departments data based on improvement threshold
  const getDepartmentsByThreshold = () => {
    const needsImprovement = departmentData.filter(dept => dept.needsImprovement);
    const goodStanding = departmentData.filter(dept => !dept.needsImprovement);
    return { needsImprovement, goodStanding };
  };

  // Function to handle opening the modal with department data  
  const getDepartmentMeasures = (deptName) => {
    // Get standardized English department name
    const standardName = getStandardDepartmentName(deptName);
    
    if (!standardName) return [];
    
    // Map department names directly to their translation keys
    let translationKey;
    
    // Convert to standard key based on exact department name
    if (standardName === 'Women Safety') {
      translationKey = 'womenSafety_measures';
    } else if (standardName === 'Cyber Crime') {
      translationKey = 'cyberCrime_measures';
    } else if (standardName === 'Narcotic Drugs') {
      translationKey = 'narcoticDrugs_measures';
    } else if (standardName === 'Traffic') {
      translationKey = 'traffic_measures';
    } else {
      // Fallback to original conversion method
      const deptKey = standardName.toLowerCase().replace(/ /g, '');
      translationKey = `${deptKey}_measures`;
    }
    
    // Get measures from i18n
    const measures = t(translationKey, { returnObjects: true });
    
    // Check if we got an array of measures (successful translation)
    if (Array.isArray(measures)) {
      return measures;
    }
    
    // Fallback to default measures
    return [
      t('conductPerformanceReview'),
      t('provideTraining'),
      t('improveProcedures')
    ];
  };

  // Render departments that need improvement
  const renderNeedsImprovementSection = () => {
    const { needsImprovement } = getDepartmentsByThreshold();
    
    return (
      <div className="departments-section mb-5">
        <h3 className="departments-heading">
          <span className="header-icon">⚠️</span>
          {t('departmentsBelowThreshold').replace('{threshold}', IMPROVEMENT_THRESHOLD)}
        </h3>
        <div className="row">
          {needsImprovement.length > 0 ? (
            needsImprovement.map((dept) => (
              <div key={dept.name} className="col-md-6 col-lg-4 mb-4">
                <div className="department-card needs-improvement-card mb-5">
                  <div className="department-card-header">
                    <h5>{getTranslatedDepartmentName(dept.name)}</h5>
                    <span className="rating-badge danger">{dept.value}/10</span>
                  </div>
                  <div className="department-card-body">
                    <p className="action-title">{t('suggestedActions')}</p>
                    <ul className="action-list">
                      {
                        getDepartmentMeasures(dept.name).slice(0, 3).map((measure, idx) => (
                          <li key={idx}>{measure}</li>
                        ))
                      }
                    </ul>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p className="no-data">{t('noDepartmentsBelowThreshold')}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render departments in good standing
  const renderGoodStandingSection = () => {
    const { goodStanding } = getDepartmentsByThreshold();
    
    return (
      <div className="departments-section mb-4">
        <h3 className="departments-heading">
          <span className="header-icon">✅</span>
          {t('departmentsAboveThreshold').replace('{threshold}', IMPROVEMENT_THRESHOLD)}
        </h3>
        <div className="row">
          {goodStanding.length > 0 ? (
            goodStanding.map((dept) => (
              <div key={dept.name} className="col-md-6 col-lg-4 mb-4">
                <div className="department-card good-standing-card mb-5">
                  <div className="department-card-header">
                    <h5>{getTranslatedDepartmentName(dept.name)}</h5>
                    <span className="rating-badge success">{dept.value}/10</span>
                  </div>
                  <div className="department-card-body">
                    <p className="action-title">{t('correctiveActions')}</p>
                    <ul className="action-list">
                      {
                        getDepartmentMeasures(dept.name).slice(0, 3).map((measure, idx) => (
                          <li key={idx}>{measure}</li>
                        ))
                      }
                    </ul>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p className="no-data">{t('noDepartmentsAboveThreshold')}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChartSection = () => {
    return (
      <div className="departments-section mb-5">
        <h3 className="departments-heading">
          <span className="header-icon">📊</span>
          {t('departmentPerformanceOverview')}
        </h3>
        
        <p className="description mb-4">
          {t('departmentsAnalysis', { threshold: IMPROVEMENT_THRESHOLD })}
        </p>

        <div className="chart-card">
          {departmentData.length === 0 ? (
            <div className="no-data text-center p-5">
              <p>{t('noFeedbackData')}</p>
            </div>
          ) : (
            <div>
              <p id="last-updated-timestamp" className="last-updated-timestamp">
                {t('lastUpdated')} {new Date().toLocaleTimeString()}
              </p>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={departmentData}
                  layout="vertical"
                  margin={{ top: 15, right: 25, left: 120, bottom: 10 }}
                  barSize={18}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    domain={[0, 10]} 
                    label={{ 
                      value: t('averageRating'), 
                      position: 'insideBottom',
                      offset: -5
                    }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={110}
                    tick={props => {
                      const { x, y, payload } = props;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text 
                            x={-10} 
                            y={0} 
                            dy={4} 
                            textAnchor="end" 
                            fill="#333"
                            fontSize={12}
                            fontWeight="500"
                            className="department-label"
                          >
                            {getTranslatedDepartmentName(payload.value)}
                          </text>
                        </g>
                      );
                    }}
                    tickLine={false}
                  />
                  <Tooltip content={customTooltip} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name={t('averageRating')} 
                    radius={[0, 4, 4, 0]}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.needsImprovement ? NEEDS_IMPROVEMENT_COLOR : GOOD_STANDING_COLOR} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderImprovementChart = () => {
    return (
      <div>
        {renderChartSection()}
        {renderNeedsImprovementSection()}
        {renderGoodStandingSection()}
      </div>
    );
  };

  return (
    <div className="corrective-measures-page container-fluid pt-4">
      <h1 className="page-title mb-4 text-center">{t('correctiveMeasures')}</h1>
      
      <div className="real-time-status">
        <div className="refresh-info">
          {lastUpdated && (
            <div className="last-updated-text">
              <span>{t('lastUpdated')}</span>: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          {isRefreshing && (
            <div className="refreshing-indicator">
              <span className="refresh-spinner"></span>
              <span>{t('refreshing')}</span>
            </div>
          )}
        </div>
        <button 
          className="manual-refresh-btn" 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
        >
          <i className="refresh-icon">↻</i> {t('refreshNow')}
        </button>
      </div>

      <div className="corrective-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('loadingRealTimeData')}</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button" 
              onClick={() => fetchDepartmentData(false)}
            >
              <span className="mr-2">🔄</span> {t('tryAgain')}
            </button>
          </div>
        ) : (
          renderImprovementChart()
        )}
      </div>
    </div>
  );
};

export default CorrectiveMeasuresPage;
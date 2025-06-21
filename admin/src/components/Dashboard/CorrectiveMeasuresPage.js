import React, { useState, useEffect } from 'react';
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

// No longer need hardcoded department measures - using translation system instead

const CorrectiveMeasuresPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Standard department list (English names)
  const standardDepartments = ['Traffic', 'Women Safety', 'Narcotic Drugs', 'Cyber Crime'];

  // Function to normalize text for better matching (trim spaces, convert to lowercase)
  const normalizeText = (text) => {
    if (!text) return '';
    return text.trim().toLowerCase();
  };

  // Function to get standardized English department name from any language variant
  const getStandardDepartmentName = (deptName) => {
    if (!deptName) return deptName;
    
    console.log('Trying to map department name:', deptName);
    
    const normalizedDeptName = normalizeText(deptName);
    
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
          normalizedDeptName.includes(normalizeText(translatedName))) {
        console.log(`Mapped "${deptName}" to "${englishName}" (partial match)`);
        return englishName;
      }
    }
    
    console.log(`No mapping found for department: "${deptName}"`);
    return deptName; // Return original if no mapping found
  };

  // Fetch department data
  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Retrieve the JWT token from localStorage
      const token = localStorage.getItem('adminToken');

      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      // Fetch feedback data from API with the Authorization header
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }

      const feedbackData = await response.json();
      processDepartmentData(feedbackData);

    } catch (err) {
      console.error('Error fetching department data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const processDepartmentData = (feedbackData) => {
    // List of specified departments we want to show (in English)
    const specifiedDepartments = ['Traffic', 'Women Safety', 'Narcotic Drugs', 'Cyber Crime'];
    
    // Initialize rating sums and counts for all specified departments
    const departmentStats = {};
    specifiedDepartments.forEach(dept => {
      departmentStats[dept] = {
        sum: 0,
        count: 0
      };
    });
    
    console.log('Processing department data, items:', feedbackData.length);
    
    // Process ratings from feedback
    feedbackData.forEach(item => {
      let deptRatings = item.departmentRatings;
      
      if (!deptRatings) return;
      if (typeof deptRatings === 'string') {
        try { deptRatings = JSON.parse(deptRatings); } catch (e) { return; }
      }
      if (!Array.isArray(deptRatings)) return;
      
      deptRatings.forEach(dept => {
        if (!dept || !dept.department) return;
        
        // Standardize the department name to English regardless of input language
        const standardDeptName = getStandardDepartmentName(dept.department);
        
        // Only process if we can map to one of our specified departments
        if (specifiedDepartments.includes(standardDeptName)) {
          // Convert rating to number if it's a string
          const rating = typeof dept.rating === 'string' ? parseFloat(dept.rating) : dept.rating;
          
          if (!isNaN(rating)) {
            departmentStats[standardDeptName].sum += rating;
            departmentStats[standardDeptName].count++;
            console.log(`Added rating ${rating} for ${dept.department} → ${standardDeptName}`);
          }
        }
      });
    });
    
    // Generate formatted department data for chart, sorted by rating (ascending)
    const formattedData = Object.entries(departmentStats)
      .filter(([_, stats]) => stats.count > 0)
      .map(([department, stats]) => {
        const avgRating = parseFloat((stats.sum / stats.count).toFixed(1));
        // Use department name as the i18n key (lowercase, no spaces)
        const deptKey = department.toLowerCase().replace(/ /g, '');
        return {
          name: department,        // Keep original English name as data key
          displayName: t(deptKey, department), // Translated display name
          value: avgRating,
          count: stats.count,
          needsImprovement: avgRating < IMPROVEMENT_THRESHOLD
        };
      })
      .sort((a, b) => a.value - b.value); // Sort by rating ascending (worst first)
      
    console.log('Processed department data:', formattedData);
    
    setDepartmentData(formattedData);
    setLoading(false);
    
    console.log('Department improvement data:', formattedData);
  };

  // Fetch data on component mount and when language changes
  useEffect(() => {
    fetchDepartmentData();
  }, [currentLanguage]);
  
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

  // Initial data fetch on component mount and when language changes
  useEffect(() => {
    fetchDepartmentData();
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
    
    console.log(`Translating department: ${standardName}, using key: ${deptKey}`);
    
    // Return the translated name
    return t(deptKey, standardName);
  };

  // Function to get department-specific measures based on department name
  const getDepartmentMeasures = (deptName) => {
    // Get standardized English department name
    const standardName = getStandardDepartmentName(deptName);
    
    if (!standardName) return [];
    
    // Debug - log the standardized name we're using
    console.log('Getting measures for standardized department name:', standardName);
    
    // Map department names directly to their translation keys
    // This ensures we get the correct measures for each department
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
    
    console.log('Using translation key:', translationKey);
    
    // Get measures from i18n
    const measures = t(translationKey, { returnObjects: true });
    
    // Check if we got an array of measures (successful translation)
    if (Array.isArray(measures)) {
      return measures;
    }
    
    // Fallback to default measures if translation not found
    if (standardName && departmentData.find(d => d.name === standardName && d.needsImprovement)) {
      return [
        t('conductPerformanceReview'),
        t('provideTraining'),
        t('improveProcedures')
      ];
    } else {
      return [
        t('continueBestPractices'),
        t('shareStrategies'),
        t('recognizeAchievements')
      ];
    }
  };

  // Split departments data based on improvement threshold
  const getDepartmentsByThreshold = () => {
    const needsImprovement = departmentData.filter(dept => dept.needsImprovement);
    const goodStanding = departmentData.filter(dept => !dept.needsImprovement);
    return { needsImprovement, goodStanding };
  };

  // Render chart section
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
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={departmentData}
                layout="vertical"
                margin={{ top: 15, right: 25, left: 120, bottom: 10 }}
                barSize={18}
                className="mobile-optimized-chart"
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
          )}
        </div>
      </div>
    );
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
        <div className="row ">
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
                    <button 
                      className="view-more-btn" 
                      onClick={() => handleOpenModal(dept.name, getDepartmentMeasures(dept.name))}
                    >
                      {t('viewMore')}
                    </button>
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
                    <button 
                      className="view-more-btn" 
                      onClick={() => handleOpenModal(dept.name, getDepartmentMeasures(dept.name))}
                    >
                      {t('viewMore')}
                    </button>
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

  // Combined render function for dashboard
  const renderImprovementChart = () => {
    return (
      <>
        {renderChartSection()}
        {renderNeedsImprovementSection()}
        {renderGoodStandingSection()}
      </>
    );
  };

  // Fetch data on component mount and when language changes
  useEffect(() => {
    fetchDepartmentData();
  }, [currentLanguage]);

  // Function to handle opening the modal with department data
  const handleOpenModal = (deptName, measures) => {
    console.log('Opening modal for department:', deptName);
    setSelectedDepartment({ name: deptName, measures: measures });
    setModalOpen(true);
  };
  
  // Effect to log modal state changes for debugging
  useEffect(() => {
    console.log('Modal state changed:', { isOpen: modalOpen, department: selectedDepartment });
  }, [modalOpen, selectedDepartment]);

  // Modal component for displaying department measures
  const renderMeasuresModal = () => {
    if (!modalOpen || !selectedDepartment) {
      return null;
    }
    
    // Get translated measures for the selected department
    const departmentMeasures = getDepartmentMeasures(selectedDepartment.name);
    
    return (
      <div 
        className="modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: modalOpen ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        onClick={() => setModalOpen(false)}
      >
        <div 
          className="modal-content"
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={e => e.stopPropagation()}
        >
          <div 
            className="measures-modal-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #eaeaea',
              backgroundColor: '#f7f9fc',
              borderRadius: '8px 8px 0 0'
            }}
          >
            <h3 style={{ margin: 0 }}>{getTranslatedDepartmentName(selectedDepartment.name)} {t('department')}</h3>
            <button 
              className="close-modal-btn" 
              onClick={() => setModalOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                padding: '0 5px',
                lineHeight: '1'
              }}
            >×</button>
          </div>
          <div 
            className="measures-modal-body"
            style={{
              padding: '20px',
              overflowY: 'auto',
              maxHeight: '60vh'
            }}
          >
            <h4 style={{ marginTop: 0 }}>{t('correctiveActions')}:</h4>
            <ul 
              className="modal-measures-list"
              style={{
                paddingLeft: '20px',
                marginBottom: 0
              }}
            >
              {departmentMeasures.map((measure, idx) => (
                <li 
                  key={idx}
                  style={{
                    marginBottom: '10px',
                    lineHeight: '1.5'
                  }}
                >{measure}</li>
              ))}
            </ul>
          </div>
          <div 
            className="measures-modal-footer"
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <button 
              className="modal-close-btn" 
              onClick={() => setModalOpen(false)}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >{t('close')}</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="corrective-measures-page">
      <div className="page-header">
        <h1>{t('correctiveMeasures')}</h1>
      </div>

      {renderMeasuresModal()}

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
              onClick={fetchDepartmentData}
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

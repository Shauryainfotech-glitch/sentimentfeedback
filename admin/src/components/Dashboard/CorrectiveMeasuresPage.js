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

// Department-specific corrective measures
const DEPARTMENT_MEASURES = {
  'Cyber Crime': [
    'Improve Response Time: Implement faster case processing workflow',
    'Staff Training: Provide regular technical training on cybersecurity',
    'Enhanced Communication: Update users on case status regularly',
    'Private Sector Collaboration: Work with cybersecurity firms',
    'Public Awareness Campaigns: Educate on common cybercrimes'
  ],
  'Women Safety': [
    'Increase Patrols: Enhance surveillance in high-risk areas',
    'Gender Sensitivity Training: Regular workshops for officers',
    'Quick Response System: Implement mobile app for reporting',
    'Community Outreach: Collaborate with local NGOs',
    'Transparent Reporting: Create case tracking system'
  ],
  'Narcotic Drugs': [
    'Better Investigation Techniques: Use advanced detection technology',
    'Rehabilitation Programs: Partner with rehab centers',
    'Public Education: Develop campaigns about drug dangers',
    'International Coordination: Share intelligence across borders',
    'Specialized Training: Train officers on handling drug cases'
  ],
  'Traffic': [
    'Increase Enforcement: Deploy officers at high-traffic areas',
    'Infrastructure Improvements: Upgrade signaling systems',
    'Safety Campaigns: Promote safe driving practices',
    'Real-Time Monitoring: Implement traffic alert systems',
    'Local Collaboration: Work with authorities on road safety'
  ]
};

const CorrectiveMeasuresPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Department name mappings between languages
  const departmentNameMappings = {
    // English department names with multi-language variations (including potential variations with spaces, etc)
    'Traffic': ['Traffic', 'वाहतूक', 'ट्रॅफिक', 'वाहतूक विभाग'],
    'Women Safety': ['Women Safety', 'महिला सुरक्षा', 'महिला सुरक्षा विभाग'],
    'Narcotic Drugs': ['Narcotic Drugs', 'अमली पदार्थ', 'ड्रग्स', 'अमली पदार्थ विभाग'],
    'Cyber Crime': ['Cyber Crime', 'सायबर गुन्हे', 'सायबर', 'सायबर क्राईम', 'सायबर गुन्हे विभाग']
  };

  // Function to normalize text for better matching (trim spaces, convert to lowercase)
  const normalizeText = (text) => {
    if (!text) return '';
    return text.trim().toLowerCase();
  };

  // Function to get standardized English department name from any language variant
  const getStandardDepartmentName = (deptName) => {
    if (!deptName) return deptName;
    
    console.log('Trying to map department name:', deptName);
    
    // Try exact match first
    for (const [englishName, translations] of Object.entries(departmentNameMappings)) {
      const normalizedDeptName = normalizeText(deptName);
      
      // Check for exact matches
      const normalizedTranslations = translations.map(t => normalizeText(t));
      if (normalizedTranslations.includes(normalizedDeptName)) {
        console.log(`Mapped "${deptName}" to "${englishName}" (exact match)`);
        return englishName;
      }
      
      // Check for partial matches (if the department name contains one of our known translations)
      for (const translation of normalizedTranslations) {
        if (normalizedDeptName.includes(translation) || translation.includes(normalizedDeptName)) {
          console.log(`Mapped "${deptName}" to "${englishName}" (partial match with "${translation}")`);
          return englishName;
        }
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
        return {
          name: department,
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
      const dept = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="dept-name">{dept.name}</p>
          <p className="rating">Average Rating: {dept.value}/10</p>
          <p className="status">
            {dept.needsImprovement ? 
              <span className="status-needs-improvement">Needs Improvement</span> : 
              <span className="status-good">Good Standing</span>
            }
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

  // We're replacing this function with direct text in the UI components

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
          Department Performance Overview
        </h3>
        
        <p className="description mb-4">
          Analysis of departments based on average feedback ratings (threshold: {IMPROVEMENT_THRESHOLD}/10).
        </p>

        <div className="chart-card">
          {departmentData.length === 0 ? (
            <div className="no-data text-center p-5">
              <p>No feedback data available to analyze</p>
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
                    value: 'Average Rating', 
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
                          {payload.value}
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
                  name="Average Rating" 
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
          Departments Below Threshold: {IMPROVEMENT_THRESHOLD}/10
        </h3>
        <div className="row ">
          {needsImprovement.length > 0 ? (
            needsImprovement.map((dept) => (
              <div key={dept.name} className="col-md-6 col-lg-4 mb-4">
                <div className="department-card needs-improvement-card mb-5">
                  <div className="department-card-header">
                    <h5>{dept.name}</h5>
                    <span className="rating-badge danger">{dept.value}/10</span>
                  </div>
                  <div className="department-card-body">
                    <p className="action-title">Suggested Actions:</p>
                    <ul className="action-list">
                      {DEPARTMENT_MEASURES[dept.name] ? 
                        DEPARTMENT_MEASURES[dept.name].map((measure, idx) => (
                          <li key={idx}>{measure}</li>
                        )).slice(0, 3) : 
                        [
                          <li key="1">Conduct performance review</li>,
                          <li key="2">Provide additional training</li>,
                          <li key="3">Improve department procedures</li>
                        ]
                      }
                    </ul>
                    {DEPARTMENT_MEASURES[dept.name] && DEPARTMENT_MEASURES[dept.name].length > 3 && (
                      <button 
                        className="view-more-btn" 
                        onClick={() => handleOpenModal(dept.name, DEPARTMENT_MEASURES[dept.name])}
                      >
                        View More
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p className="no-data">No departments below threshold</p>
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
          Departments Above Threshold: {IMPROVEMENT_THRESHOLD}/10
        </h3>
        <div className="row">
          {goodStanding.length > 0 ? (
            goodStanding.map((dept) => (
              <div key={dept.name} className="col-md-6 col-lg-4 mb-4">
                <div className="department-card good-standing-card mb-5">
                  <div className="department-card-header">
                    <h5>{dept.name}</h5>
                    <span className="rating-badge success">{dept.value}/10</span>
                  </div>
                  <div className="department-card-body">
                    <p className="action-title">Maintain Performance:</p>
                    <ul className="action-list">
                      {DEPARTMENT_MEASURES[dept.name] ? 
                        DEPARTMENT_MEASURES[dept.name].map((measure, idx) => (
                          <li key={idx}>{measure}</li>
                        )).slice(0, 3) : 
                        [
                          <li key="1">Continue best practices</li>,
                          <li key="2">Share successful strategies</li>,
                          <li key="3">Recognize department achievements</li>
                        ]
                      }
                    </ul>
                    {DEPARTMENT_MEASURES[dept.name] && DEPARTMENT_MEASURES[dept.name].length > 3 && (
                      <button 
                        className="view-more-btn" 
                        onClick={() => handleOpenModal(dept.name, DEPARTMENT_MEASURES[dept.name])}
                      >
                        View More
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p className="no-data">No departments above threshold</p>
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
    
    console.log('Rendering modal for department:', selectedDepartment.name);
    
    return (
      <div 
        className="measures-modal-overlay" 
        onClick={() => setModalOpen(false)} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <div 
          className="measures-modal" 
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
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
            <h3 style={{ margin: 0 }}>{selectedDepartment.name} Department</h3>
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
            <h4 style={{ marginTop: 0 }}>Corrective Measures:</h4>
            <ul 
              className="modal-measures-list"
              style={{
                paddingLeft: '20px',
                marginBottom: 0
              }}
            >
              {selectedDepartment.measures.map((measure, idx) => (
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
            >Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="corrective-measures-page">
      <div className="page-header">
        <h1>Corrective Measures</h1>
      </div>

      {renderMeasuresModal()}

      <div className="corrective-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading real-time data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button" 
              onClick={fetchDepartmentData}
            >
              <span className="mr-2">🔄</span> Try Again
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

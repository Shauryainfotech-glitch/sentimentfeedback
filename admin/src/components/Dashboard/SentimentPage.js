import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector, LineChart, Line } from 'recharts';
import '../../styles/AnalyticsPage.css';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';

// API URL from environment variable or default to localhost
const API_URL = process.env.REACT_APP_API_URL;

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

// Department list for categorization (English names)
const departments = ['Traffic', 'Women Safety', 'Narcotic Drugs', 'Cyber Crime'];

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
};

const SentimentPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(false);
  
  // Function to translate department name based on current language
  const getTranslatedDepartmentName = (englishDeptName) => {
    let translationKey;
    switch(englishDeptName) {
      case 'Traffic':
        translationKey = 'traffic';
        break;
      case 'Women Safety':
        translationKey = 'womenSafety';
        break;
      case 'Narcotic Drugs':
        translationKey = 'narcoticDrugs';
        break;
      case 'Cyber Crime':
        translationKey = 'cyberCrime';
        break;
      default:
        translationKey = englishDeptName?.toLowerCase().replace(/ /g, '');
    }
    
    return t(translationKey, englishDeptName);
  };
  
  // Function to categorize ratings into sentiment categories
  const categorizeSentiment = (rating) => {
    const numRating = Number(rating) || 0;
    if (numRating >= 6 && numRating <= 10) return 'positive';
    if (numRating >= 4 && numRating <= 5) return 'neutral';
    if (numRating >= 1 && numRating <= 3) return 'negative';
    return 'neutral';
  };

  // Function to get translated sentiment label
  const getTranslatedSentiment = (sentimentKey) => {
    return t(sentimentKey, sentimentKey === 'positive' ? 'Positive' : 
                         sentimentKey === 'neutral' ? 'Neutral' : 
                         sentimentKey === 'negative' ? 'Negative' : sentimentKey);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    if (feedbackData.length > 0) {
      processFeedbackData(feedbackData);
    }
    
    const fetchFeedbackData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${API_URL}/api/feedback`, {
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
  }, [t, currentLanguage]);

  useEffect(() => {
    const handleResize = () => {
      setForceUpdate(prev => !prev);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
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
    
    let positive = 0, neutral = 0, negative = 0;
    
    const monthlyData = new Array(12).fill().map((_, index) => ({
      month: monthNames[index],
      positive: 0,
      neutral: 0,
      negative: 0,
      total: 0
    }));
    
    const departmentData = departments.map(dept => ({
      name: dept,
      positive: 0,
      neutral: 0,
      negative: 0,
      total: 0
    }));
    
    data.forEach(feedback => {
      const sentimentCategory = categorizeSentiment(feedback.overallRating);
      
      if (sentimentCategory === 'positive') positive++;
      else if (sentimentCategory === 'neutral') neutral++;
      else if (sentimentCategory === 'negative') negative++;
      
      if (feedback.createdAt) {
        const date = new Date(feedback.createdAt);
        const month = date.getMonth();
        monthlyData[month][sentimentCategory]++;
        monthlyData[month].total++;
      }
      
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
              const standardDeptName = getStandardDepartmentName(deptRating.department);
              const deptIndex = departments.findIndex(d => d === standardDeptName);
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
    
    const total = positive + neutral + negative || 1;
    const sentimentAnalysis = {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100)
    };
    
    const sentimentTrend = monthlyData.map(month => {
      const monthTotal = month.total || 1;
      return {
        month: month.month,
        positive: Math.round((month.positive / monthTotal) * 100),
        neutral: Math.round((month.neutral / monthTotal) * 100),
        negative: Math.round((month.negative / monthTotal) * 100)
      };
    });
    
    const sentimentByCategory = departmentData.map(dept => {
      const deptTotal = dept.total || 1;
      return {
        name: getTranslatedDepartmentName(dept.name),
        positive: Math.round((dept.positive / deptTotal) * 100),
        neutral: Math.round((dept.neutral / deptTotal) * 100),
        negative: Math.round((dept.negative / deptTotal) * 100),
        originalName: dept.name,
        positiveName: getTranslatedSentiment('positive'),
        neutralName: getTranslatedSentiment('neutral'),
        negativeName: getTranslatedSentiment('negative')
      };
    });
    
    setSentiment({
      sentimentAnalysis,
      sentimentTrend,
      sentimentByCategory
    });
    
    setLoading(false);
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

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
    if (!sentiment || !sentiment.sentimentAnalysis) return null;
    
    const data = [
      { name: t('positive', 'Positive'), value: sentiment?.sentimentAnalysis.positive, color: COLORS.positive },
      { name: t('neutral', 'Neutral'), value: sentiment?.sentimentAnalysis.neutral, color: COLORS.neutral },
      { name: t('negative', 'Negative'), value: sentiment?.sentimentAnalysis.negative, color: COLORS.negative }
    ];
    
    const isMobile = window.innerWidth < 576;

    return (
      <div className="dashboard-card sentiment-distribution">
        <h3 style={{ width: '100%', textAlign: 'center', marginBottom: '80px', marginTop: '0px', position: 'relative', zIndex: 5 }}>
          {t('overallSentimentDistribution', 'Overall Sentiment Distribution')}
        </h3>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 350}>
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={isMobile ? 100 : 140}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="sentiment-stats" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: '20px',
          width: '100%',
          padding: '15px 20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          margin: '20px auto'
        }}>
          <div className="sentiment-stat-item" style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginRight: '30px'
          }}>
            <div className="sentiment-color-box" style={{ 
              backgroundColor: '#4CAF50',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              marginRight: '8px'
            }}></div>
            <span><strong>{t('positive', 'Positive')}:</strong> {sentiment?.sentimentAnalysis.positive}%</span>
          </div>
          <div className="sentiment-stat-item" style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginRight: '30px'
          }}>
            <div className="sentiment-color-box" style={{ 
              backgroundColor: '#FF9800',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              marginRight: '8px'
            }}></div>
            <span><strong>{t('neutral', 'Neutral')}:</strong> {sentiment?.sentimentAnalysis.neutral}%</span>
          </div>
          <div className="sentiment-stat-item" style={{ 
            display: 'flex', 
            alignItems: 'center'
          }}>
            <div className="sentiment-color-box" style={{ 
              backgroundColor: '#F44336',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              marginRight: '8px'
            }}></div>
            <span><strong>{t('negative', 'Negative')}:</strong> {sentiment?.sentimentAnalysis.negative}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomizedTickX = (props) => {
    const { x, y, payload } = props;
    let displayText = payload.value;
    
    if (displayText === 'Traffic') {
      displayText = t('traffic', 'Traffic');
    } else if (displayText === 'Women Safety') {
      displayText = t('womenSafety', 'Women Safety');
    } else if (displayText === 'Narcotic Drugs') {
      displayText = t('narcoticDrugs', 'Narcotic Drugs');
    } else if (displayText === 'Cyber Crime') {
      displayText = t('cyberCrime', 'Cyber Crime');
    } else if (departments.includes(displayText)) {
      displayText = getTranslatedDepartmentName(displayText);
    }
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle"
          fontSize={12}
          fill="#666"
        >
          {displayText}
        </text>
      </g>
    );
  };
  
  const customTooltipFormatter = (value, name, props) => {
    let translatedName = name;
    if (name === 'positive') translatedName = t('positive', 'Positive');
    if (name === 'neutral') translatedName = t('neutral', 'Neutral');
    if (name === 'negative') translatedName = t('negative', 'Negative');
    
    return [`${value}%`, translatedName];
  };
  
  const renderCategorySentiment = () => {
    const isMobile = window.innerWidth < 576;
    const isTablet = window.innerWidth < 768 && window.innerWidth >= 576;
    
    // Calculate average sentiment percentages across all categories
    let avgPositive = 0, avgNeutral = 0, avgNegative = 0;
    if (sentiment?.sentimentByCategory?.length > 0) {
      const total = sentiment.sentimentByCategory.length;
      avgPositive = Math.round(sentiment.sentimentByCategory.reduce((sum, cat) => sum + cat.positive, 0) / total);
      avgNeutral = Math.round(sentiment.sentimentByCategory.reduce((sum, cat) => sum + cat.neutral, 0) / total);
      avgNegative = Math.round(sentiment.sentimentByCategory.reduce((sum, cat) => sum + cat.negative, 0) / total);
    }
    
    return (
      <div className="dashboard-card category-sentiment">
        <h3 style={{ width: '100%', textAlign: 'center', marginBottom: '80px', marginTop: '-30px', position: 'relative', zIndex: 5 }}>
          {t('sentimentAnalysisByCategory', 'Sentiment Analysis by Category')}
        </h3>
        <div className="chart-container" style={{ position: 'relative', paddingTop: '10px', marginTop: '5px' }}>
          <ResponsiveContainer width="100%" height={isMobile ? 380 : 380}>
            <BarChart
              data={sentiment?.sentimentByCategory}
              margin={isMobile ? { top: 5, right: 20, left: 10, bottom: 30 } : 
                     isTablet ? { top: 20, right: 20, left: 10, bottom: 60 } : 
                              { top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={2}
              barCategoryGap={isMobile ? 15 : 20}
              layout={isMobile ? "vertical" : "horizontal"}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {!isMobile ? (
                <XAxis 
                  dataKey="name" 
                  tick={renderCustomizedTickX} 
                  height={60} 
                  tickMargin={5} 
                  interval={0} 
                />
              ) : (
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
              )}
              {!isMobile ? (
                <YAxis />
              ) : (
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={window.innerWidth < 600 ? 90 : 140}
                  tick={props => (
                    <text
                      x={props.x}
                      y={props.y}
                      dy={16}
                      fontSize={window.innerWidth < 600 ? 10 : 12}
                      fill="#666"
                      textAnchor="end"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: window.innerWidth < 600 ? 80 : 120
                      }}
                    >
                      {props.payload.value}
                    </text>
                  )}
                  axisLine={{ stroke: '#ccc' }}
                />
              )}
              <Tooltip formatter={customTooltipFormatter} />
              <Bar dataKey="positive" name="positive" fill="#4CAF50" barSize={isMobile ? 20 : 20} />
              <Bar dataKey="neutral" name="neutral" fill="#FF9800" barSize={isMobile ? 20 : 20} />
              <Bar dataKey="negative" name="negative" fill="#F44336" barSize={isMobile ? 20 : 20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment stats for category analysis */}
        <div className="category-sentiment-stats" style={{ 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          marginTop: '20px',
          width: '100%',
          padding: '15px 20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          margin: '20px auto',
          gap: '15px'
        }}>
          <div className="category-stat-item" style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: isMobile ? '100%' : '22%',
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ 
                backgroundColor: '#4CAF50',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                marginRight: '6px'
              }}></div>
              <span style={{ fontWeight: 'bold' }}>{t('positive', 'Positive')}</span>
            </div>
            <span>{avgPositive}% {t('average', 'Average')}</span>
          </div>
          
          <div className="category-stat-item" style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: isMobile ? '100%' : '22%',
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ 
                backgroundColor: '#FF9800',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                marginRight: '6px'
              }}></div>
              <span style={{ fontWeight: 'bold' }}>{t('neutral', 'Neutral')}</span>
            </div>
            <span>{avgNeutral}% {t('average', 'Average')}</span>
          </div>
          
          <div className="category-stat-item" style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: isMobile ? '100%' : '22%',
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ 
                backgroundColor: '#F44336',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                marginRight: '6px'
              }}></div>
              <span style={{ fontWeight: 'bold' }}>{t('negative', 'Negative')}</span>
            </div>
            <span>{avgNegative}% {t('average', 'Average')}</span>
          </div>
        </div>
      </div>
    );
  };

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
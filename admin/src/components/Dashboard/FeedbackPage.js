import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/FeedbackPage.css';
import { useLanguage } from '../../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTimes, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';

// API base URL
const API_URL = process.env.REACT_APP_API_URL;

// Police station list with translations    
export const policeStations = [
  { en: "Akole", mr: "अकोले" },
  { en: "Ashwi", mr: "अश्वी" },
  { en: "Belavandi", mr: "बेलवंडी" },
  { en: "Bhingar Camp", mr: "भिंगार कॅम्प" },
  { en: "Ghargaon", mr: "घरगाव" },
  { en: "Jamkhed", mr: "जामखेड" },
  { en: "Karjat", mr: "कर्जत" },
  { en: "Kharda", mr: "खरडा" },
  { en: "Kopargaon City", mr: "कोपरगाव शहर" },
  { en: "Kopargaon Rural", mr: "कोपरगाव ग्रामीण" },
  { en: "Kotwali", mr: "कोतवाली" },
  { en: "Loni", mr: "लोणी" },
  { en: "MIDC", mr: "MIDC" },
  { en: "Mirajgaon", mr: "मिरजगाव" },
  { en: "Nagar Taluka", mr: "नगर तालुका" },
  { en: "Newasa", mr: "नेवासा" },
  { en: "Parner", mr: "पारनेर" },
  { en: "Pathardi", mr: "पाथर्डी" },
  { en: "Rahata", mr: "राहाता" },
  { en: "Rahuri", mr: "राहुरी" },
  { en: "Rajur", mr: "राजूर" },
  { en: "Sangamner City", mr: "संगमनेर शहर" },
  { en: "Sangamner Rural", mr: "संगमनेर ग्रामीण" },
  { en: "Shani Shingnapur", mr: "शनि शिंगणापूर" },
  { en: "Shevgaon", mr: "शेवगाव" },
  { en: "Shirdi", mr: "शिर्डी" },
  { en: "Shrigonda", mr: "श्रीगोंदा" },
  { en: "Shrirampur City", mr: "श्रीरामपूर शहर" },
  { en: "Shrirampur Rural", mr: "श्रीरामपूर ग्रामीण" },
  { en: "Sonai", mr: "सोनई" },
  { en: "Supa", mr: "सुपा" },
  { en: "Tofkhana", mr: "तोफखाना" }
];

// Placeholder function for fallback mock data if API fails
const createFallbackFeedbacks = (t) => [
 
];

const FeedbackPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage(); // Use language context
  const [feedbacks, setFeedbacks] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [visibleCount, setVisibleCount] = useState(8);
  const [sliderValue, setSliderValue] = useState(5);

  // Fetch feedback from the backend API
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    setLastRefreshed(new Date());
  
    try {
      // Retrieve the JWT token from sessionStorage
      const token = localStorage.getItem('adminToken');
  
      // If there's no token, you might want to handle the error (e.g., redirect to login)
      if (!token) {
        setError('You need to log in first');
        setLoading(false);
        return;
      }
  
      // Set the Authorization header with the Bearer token
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add the JWT token here
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch feedback: ${response.status}`);
      }
  
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(t('failedToLoadFeedback', 'Failed to load feedback. Please try again.'));
      // Use fallback data for development/testing purposes
      setFeedbacks(createFallbackFeedbacks(t));
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch when component mounts or language changes
  useEffect(() => {
    fetchFeedbacks();
  }, [t, currentLanguage]); // Re-run when language changes
  
  // Set up auto-refresh every 5 minutes
  useEffect(() => {
    // Initial fetch already handled by the above useEffect
    
    // Set up interval for auto-refresh every 5 minutes (300000 ms)
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing feedback data...');
      fetchFeedbacks();
    }, 300000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(refreshInterval);
  }, []);

  // Function to export feedback data to CSV format for Excel download
  const exportToCSV = () => {
    // Get filtered feedbacks based on current date filter
    const dataToExport = filteredFeedbacks;
    
    // Check if there's data to export
    if (!dataToExport || dataToExport.length === 0) {
      alert(t('noDataToExport', 'No feedback data available to export'));
      return;
    }

    // CSV headers
    const headers = [
      t('name'),
      t('phone'),
      t('description'),
      t('overallRating'),
      t('departmentRatings'),
      t('createdAt'),
    ];

    // Create CSV content with UTF-8 BOM for proper character encoding in Excel
    let csvContent = '\uFEFF'; // Add UTF-8 BOM
    csvContent += headers.join(',') + '\n';

    // Add data rows
    dataToExport.forEach(feedback => {
      const departmentRatingsStr = feedback.departmentRatings ? 
        JSON.stringify(feedback.departmentRatings).replace(/,/g, ';') : ''; // Replace commas with semicolons
      
      // Format date in universal format (YYYY-MM-DD HH:MM) for Excel compatibility
      const formatUniversalDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.getFullYear() + '-' + 
               String(date.getMonth() + 1).padStart(2, '0') + '-' + 
               String(date.getDate()).padStart(2, '0') + ' ' + 
               String(date.getHours()).padStart(2, '0') + ':' + 
               String(date.getMinutes()).padStart(2, '0');
      };

      // Check for different possible image field names
      const imageField = feedback.imageUrl || feedback.imageURL || feedback.image || '';

      // Format and clean data for CSV
      const row = [
        (feedback.name || '').replace(/,/g, ' '), // Remove commas from strings
        (feedback.phone || '').replace(/,/g, ' '),
        (feedback.comments || feedback.description || feedback.message || '').replace(/,/g, ' ').replace(/\n/g, ' '),
        feedback.overallRating || '',
        departmentRatingsStr,
        formatUniversalDate(feedback.createdAt),
        imageField.replace(/,/g, ' ')
      ];

      csvContent += row.join(',') + '\n';
    });

    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a link element to trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Set attributes for the download link
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_data_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.display = 'none';
    
    // Add to document, trigger click, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'en' ? 'en-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'mr-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter feedback by date range and police station
  // Improved filtering function with correct date and station filtering
  const getFilteredFeedbacks = () => {
    if (!feedbacks || !feedbacks.length) return [];
    
    return feedbacks.filter(feedback => {
      // Date filtering
      if (dateFilter !== 'all') {
        const now = new Date();
        let cutoffDate;
        
        // Create cutoff date based on filter selection
        switch (dateFilter) {
          case 'today': {
            // Set to beginning of today
            cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            break;
          }
          case 'month': {
            // Set to beginning of this month
            cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          }
          default:
            break;
        }

        // Ensure we're using the createdAt field from the API
        if (!feedback.createdAt) {
          return false; // Skip if no date
        }
        
        const feedbackDate = new Date(feedback.createdAt);
        if (feedbackDate < cutoffDate) {
          return false; // Skip if before cutoff date
        }
      }
      
      // Police station filtering
      if (stationFilter !== 'all' && feedback.policeStation) {
        return feedback.policeStation === stationFilter;
      } else if (stationFilter !== 'all') {
        return false;
      }
      
      // Sentiment filtering
      if (sentimentFilter !== 'all') {
        const rating = Number(feedback.overallRating);
        let sentiment = 'neutral';
        if (rating >= 1 && rating <= 4) sentiment = 'negative';
        else if (rating >= 5 && rating <= 6) sentiment = 'neutral';
        else if (rating >= 7 && rating <= 10) sentiment = 'positive';
        if (sentiment !== sentimentFilter) return false;
      }
      
      return true; // Include by default
    });
  };
  
  const filteredFeedbacks = getFilteredFeedbacks();
  const visibleFeedbacks = filteredFeedbacks.slice(0, visibleCount);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API_URL}/feedback/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark feedback as read');
      }
      
      // Update local state after successful API call
      setFeedbacks(feedbacks.map(feedback => 
        feedback.id === id ? { ...feedback, status: 'read' } : feedback
      ));
    } catch (err) {
      console.error('Error marking feedback as read:', err);
      // Fallback to just updating the UI even if API failed
      setFeedbacks(feedbacks.map(feedback => 
        feedback.id === id ? { ...feedback, status: 'read' } : feedback
      ));
    }
  };

  // Function to render department ratings
  const renderDepartmentRatings = (departmentRatings) => {
    if (!departmentRatings || !departmentRatings.length) return null;
    
    return (
      <div className="department-ratings">
        <h4 className="department-ratings-title">{t('departmentRatings', 'Department Ratings')}</h4>
        <div className="department-ratings-list">
          {departmentRatings.map((dept, index) => (
            <div key={index} className="department-rating-item">
              <div className="department-name">{dept.department}</div>
              <div className="department-rating-value">
                <div 
                  className="rating-bar" 
                  style={{
                    width: `${(Number(dept.rating) * 100) / 10}%`,
                    backgroundColor: getRatingColor(Number(dept.rating))
                  }}
                ></div>
                <span className="rating-number">{dept.rating}/10</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function to get color based on rating
  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4CAF50'; // Green for high ratings
    if (rating >= 6) return '#2196F3'; // Blue for medium-high ratings
    if (rating >= 4) return '#FF9800'; // Orange for medium ratings
    return '#F44336'; // Red for low ratings
  };
  
  // Get overall rating stars (out of 5 based on a 0-10 scale)
  const getOverallRatingStars = (rating) => {
    if (!rating && rating !== 0) return 5; // Default to 5 if no rating
    return Math.round((Number(rating) / 10) * 5);
  };

  // Helper function to get police station name based on current language
  const getLocalizedStationName = (station) => {
    const foundStation = policeStations.find(s => s.en === station);
    if (!foundStation) return station;
    return currentLanguage === 'mr' ? foundStation.mr : foundStation.en;
  };
  
  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>{t('receivedFeedback')}</h1>
        <div className="feedback-controls">
          <div className="filter-container">
            <label htmlFor="date-filter">{t('filterByDate', 'Filter by date:')}</label>
            <select 
              id="date-filter"
              className="date-filter-dropdown"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">{t('allTime', 'All Time')}</option>
              <option value="today">{t('today', 'Today')}</option>
              <option value="month">{t('month', 'This Month')}</option>
            </select>
          </div>
          <div className="filter-container">
            <label htmlFor="station-filter">{t('filterByStation', 'Filter by station:')}</label>
            <select 
              id="station-filter"
              className="date-filter-dropdown"
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
            >
              <option value="all">{t('allStations', 'All Stations')}</option>
              {policeStations.map(station => (
                <option key={station.en} value={station.en}>
                  {currentLanguage === 'mr' ? station.mr : station.en}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-container">
            <label htmlFor="sentiment-filter">{t('filterBySentiment', 'Filter by sentiment:')}</label>
            <select
              id="sentiment-filter"
              className="date-filter-dropdown"
              value={sentimentFilter}
              onChange={e => setSentimentFilter(e.target.value)}
            >
              <option value="all">{t('allSentiments', 'All')}</option>
              <option value="positive">{currentLanguage === 'mr' ? 'पॉझिटिव्ह' : 'Positive'}</option>
              <option value="neutral">{currentLanguage === 'mr' ? 'न्यूट्रल' : 'Neutral'}</option>
              <option value="negative">{currentLanguage === 'mr' ? 'निगेटिव्ह' : 'Negative'}</option>
            </select>
          </div>
          <button 
            className="export-button" 
            onClick={exportToCSV}
            disabled={!feedbacks || feedbacks.length === 0}
          >
            {t('exportToExcel', 'Export to Excel')}
          </button>
        </div>
      </div>
      <div className="last-refreshed-info">
        {t('lastRefreshed', 'Last refreshed')}: {lastRefreshed.toLocaleTimeString()}
      </div>

      {loading ? (
        <div className="loading-container" style={{ textAlign: 'center', margin: '1rem 0' }}>
          <div className="loading-spinner"></div>
          <p>{t('loadingFeedback', 'Loading feedback...')}</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchFeedbacks} className="retry-button">
            {t('retry', 'Retry')}
          </button>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="no-feedback">
          <p>{t('noFeedbackFound', 'No feedback found')}</p>
        </div>
      ) : (
        <div className="feedback-grid">
          {visibleFeedbacks.map((feedback) => (
           <div key={`${feedback.id}-${currentLanguage}`} className={`feedback-card ${feedback.status === 'new' ? 'new-feedback' : ''}`}>
  <div className="feedback-card-header">
    <div className="feedback-header-content">
      <h3>{feedback.subject || t('feedback', 'Feedback')}</h3>
      <div className="feedback-meta">
        <span className="feedback-date">{formatDate(feedback.createdAt || feedback.date)}</span>
        {feedback.status === 'new' && <span className="feedback-status new">{t('new', 'New')}</span>}
      </div>
    </div>
  </div>

 <div className="feedback-card-body">
  <div className="feedback-sender-details">
    <div className="feedback-sender">
      <strong>
        {feedback.name ? 
          feedback.name.charAt(0).toUpperCase() + feedback.name.slice(1).toLowerCase() 
          : '-'}
      </strong>
    </div>
    
    <div className="feedback-phone">
      <FontAwesomeIcon icon={faPhoneAlt} className="phone-icon" /> 
      {feedback.phone ? feedback.phone : '-'}
    </div>
    <div className="feedback-police-station">
      <strong>{t('policeStation', 'Police Station')}:</strong> 
      {feedback.policeStation ? getLocalizedStationName(feedback.policeStation) : '-'}
    </div>
  </div>
  
  <div className="feedback-description">
    <p className="feedback-message">
      {feedback.description || feedback.message || '-'}
    </p>
  </div>
  
  {/* Overall Rating Section */}
  <div className="overall-rating-section" style={{
    margin: "1rem 0",
    padding: "0.75rem",
    background: "rgba(10, 35, 98, 0.05)",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem"
  }}>
    <span className="rating-label" style={{
      fontWeight: "600",
      color: "#0A2362"
    }}>
      {t('overallRating', 'Overall Rating')}:
    </span>
    <span className="overall-rating-number" style={{
      fontWeight: "600",
      color: feedback.overallRating !== undefined ? getRatingColor(Number(feedback.overallRating)) : "#0A2362"
    }}>
      {feedback.overallRating !== undefined ? `${feedback.overallRating}/10` : '-'}
      {feedback.overallRating >= 1 && feedback.overallRating <= 4 && (
        <span style={{ marginLeft: '8px', color: '#F44336' }}>
          ({currentLanguage === 'mr' ? 'नकारात्मक' : 'Negative'})
        </span>
      )}
      {feedback.overallRating >= 5 && feedback.overallRating <= 6 && (
        <span style={{ marginLeft: '8px', color: '#FF9800' }}>
          ({currentLanguage === 'mr' ? 'तटस्थ' : 'Neutral'})
        </span>
      )}
      {feedback.overallRating >= 7 && feedback.overallRating <= 10 && (
        <span style={{ marginLeft: '8px', color: '#4CAF50' }}>
          ({currentLanguage === 'mr' ? 'सकारात्मक' : 'Positive'})
        </span>
      )}
    </span>
  </div>
  
  {/* Department ratings */}
  {feedback.departmentRatings && feedback.departmentRatings.length > 0 ? (
    renderDepartmentRatings(feedback.departmentRatings)
  ) : (
    <div className="department-ratings">
      <h4 className="department-ratings-title">{t('departmentRatings', 'Department Ratings')}</h4>
      <div className="department-ratings-list">
        <div className="department-rating-item">-</div>
      </div>
    </div>
  )}
</div>
  
  <div className="feedback-card-footer">
    {/* Footer content */}
  </div>
</div>
          ))}
        </div>
      )}

      {visibleCount < filteredFeedbacks.length && (
        <button
          className="load-more-btn"
          onClick={() => setVisibleCount(visibleCount + 10)}
        >
          {t('loadMore', 'Load More')}
        </button>
      )}
    </div>
  );
};

export default FeedbackPage;

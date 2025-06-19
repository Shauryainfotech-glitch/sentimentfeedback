import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/FeedbackPage.css';
import { useLanguage } from '../../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTimes, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Placeholder function for fallback mock data if API fails
const createFallbackFeedbacks = (t) => [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    subject: t('regardingPolice'),
    message: t('policeAssistanceMsg'),
    rating: 5,
    date: '2025-06-17T10:30:00',
    status: 'new'
  },
  {
    id: 2,
    name: 'Sunita Patel',
    email: 'sunita@example.com',
    subject: t('trafficManagement'),
    message: t('trafficManagementMsg'),
    rating: 3,
    date: '2025-06-16T14:15:00',
    status: 'read'
  },
  {
    id: 3,
    name: 'Amit Sharma',
    email: 'amit@example.com',
    subject: t('suggestionForSecurity'),
    message: t('securitySuggestionMsg'),
    rating: 4,
    date: '2025-06-16T09:20:00',
    status: 'read'
  },
  {
    id: 4,
    name: 'Priya Verma',
    email: 'priya@example.com',
    subject: t('appreciationForResponse'),
    message: t('appreciationMsg'),
    rating: 5,
    date: '2025-06-15T18:45:00',
    status: 'read'
  }
];

const FeedbackPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage(); // Use language context
  const [feedbacks, setFeedbacks] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch feedback from the backend API
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/feedback`);
      
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

  useEffect(() => {
    // Fetch feedback when component mounts or language changes
    fetchFeedbacks();
  }, [t, currentLanguage]); // Re-run when language changes

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

  // Filter feedback by date range
  // Improved filtering function with correct date handling
  const getFilteredFeedbacks = () => {
    if (dateFilter === 'all') return feedbacks;
    
    // Create a fresh Date object for now
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
        return feedbacks;
    }
    
    return feedbacks.filter(feedback => {
      // Ensure we're using the createdAt field from the API
      if (!feedback.createdAt) {
        return true; // Include if no date (fallback)
      }
      
      const feedbackDate = new Date(feedback.createdAt);
      return feedbackDate >= cutoffDate;
    });
  };
  
  const filteredFeedbacks = getFilteredFeedbacks();

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

  // Close image popup
  const closeImagePopup = () => {
    setSelectedImage(null);
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>{t('receivedFeedback')}</h1>
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
      </div>

      {/* Image Popup Modal */}
      {selectedImage && (
        <div className="image-popup-overlay" onClick={closeImagePopup}>
          <div className="image-popup-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={closeImagePopup}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="popup-image-wrapper">
              <img 
                src={selectedImage} 
                alt={t('feedbackImage')} 
                className="popup-image" 
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
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
          {filteredFeedbacks.map((feedback) => (
            <div key={`${feedback.id}-${currentLanguage}`} className={`feedback-card ${feedback.status === 'new' ? 'new-feedback' : ''}`}>
              <div className="feedback-card-header">
                <div className="feedback-header-content">
                  <h3>{feedback.subject || t('feedback', 'Feedback')}</h3>
                  <div className="feedback-meta">
                    <span className="feedback-date">{formatDate(feedback.createdAt || feedback.date)}</span>
                    {feedback.status === 'new' && <span className="feedback-status new">{t('new', 'New')}</span>}
                  </div>
                </div>
                <div className="feedback-rating">
                  <div className="rating-label">{t('overallRating', 'Rating')}:</div>
                  <div className="stars-container">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < getOverallRatingStars(feedback.overallRating || feedback.rating) ? "star filled" : "star"}>★</span>
                    ))}
                  </div>
                  {feedback.overallRating !== undefined && (
                    <span className="overall-rating-number">{feedback.overallRating}/10</span>
                  )}
                </div>
              </div>

              <div className="feedback-card-body">
                <div className="feedback-sender-details">
                  <div className="feedback-sender">
                    <strong>{feedback.name}</strong>
                  </div>
                  {feedback.phone && (
                    <div className="feedback-phone">
                      <FontAwesomeIcon icon={faPhoneAlt} className="phone-icon" /> {feedback.phone}
                    </div>
                  )}
                  {feedback.email && (
                    <div className="feedback-email">
                      {feedback.email}
                    </div>
                  )}
                </div>
                
                {feedback.description || feedback.message ? (
                  <div className="feedback-description">
                    <p className="feedback-message">{feedback.description || feedback.message}</p>
                  </div>
                ) : null}
                
                {/* Department ratings */}
                {renderDepartmentRatings(feedback.departmentRatings)}
              </div>
              
              <div className="feedback-card-footer">
                <div className="feedback-card-actions">
                  {/* View Image button */}
                  {(feedback.imageUrl || feedback.image) && (
                    <button 
                      className="view-image-btn standalone"
                      onClick={() => setSelectedImage(feedback.imageUrl || feedback.image)}
                    >
                      <FontAwesomeIcon icon={faEye} /> {t('viewImage', 'View Image')}
                    </button>
                  )}
                  
                  {/* Mark as Read button */}
                  {feedback.status === 'new' && (
                    <button 
                      className="mark-read-btn" 
                      onClick={() => markAsRead(feedback.id)}
                    >
                      {t('markAsRead', 'Mark as Read')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;

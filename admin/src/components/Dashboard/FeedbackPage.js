import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/FeedbackPage.css';
import { useLanguage } from '../../context/LanguageContext';

// Function to create mock data with translations
const createMockFeedbacks = (t) => [
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
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset loading state when language changes
    setLoading(true);
    
    // Simulate API fetch with a delay
    setTimeout(() => {
      setFeedbacks(createMockFeedbacks(t));
      setLoading(false);
    }, 800);
  }, [t, currentLanguage]); // Re-run when language changes using our context

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

  const filteredFeedbacks = filter === 'all' 
    ? feedbacks 
    : feedbacks.filter(feedback => feedback.status === filter);

  const markAsRead = (id) => {
    setFeedbacks(feedbacks.map(feedback => 
      feedback.id === id ? { ...feedback, status: 'read' } : feedback
    ));
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>{t('receivedFeedback')}</h1>
        <div className="filters">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => setFilter('all')}
          >
            {t('allFeedback')}
          </button>
          <button 
            className={`filter-button ${filter === 'new' ? 'active' : ''}`} 
            onClick={() => setFilter('new')}
          >
            {t('new')}
          </button>
          <button 
            className={`filter-button ${filter === 'read' ? 'active' : ''}`} 
            onClick={() => setFilter('read')}
          >
            {t('read')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('loadingFeedback', 'Loading feedback...')}</p>
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
                <h3>{feedback.subject}</h3>
                <div className="feedback-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < feedback.rating ? "star filled" : "star"}>★</span>
                  ))}
                </div>
              </div>
              <div className="feedback-card-body">
                <p className="feedback-message">{feedback.message}</p>
              </div>
              <div className="feedback-card-footer">
                <div className="feedback-details">
                  <p className="feedback-sender">
                    <strong>{feedback.name}</strong> ({feedback.email})
                  </p>
                  <p className="feedback-date">{formatDate(feedback.date)}</p>
                </div>
                {feedback.status === 'new' && (
                  <button 
                    className="mark-read-btn" 
                    onClick={() => markAsRead(feedback.id)}
                  >
                    {t('markAsRead')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;

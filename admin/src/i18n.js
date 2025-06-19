import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { createInstance } from 'i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Dashboard layout
      "adminDashboard": "Admin Dashboard",
      "receivedFeedback": "Received Feedback",
      "analytics": "Analytics",
      "sentimentAnalysis": "Sentiment Analysis",
      "logout": "Logout",
      "welcome": "Welcome, Admin",
      "dashboardTitle": "Ahilyanagar Police Dashboard",
      
      // Feedback page
      "allFeedback": "All Feedback",
      "new": "New",
      "read": "Read",
      "markAsRead": "Mark as Read",
      "loadingFeedback": "Loading feedback...",
      "noFeedbackFound": "No feedback found",
      
      // Feedback categories
      "regardingPolice": "Regarding Police Assistance",
      "trafficManagement": "Traffic Management Issue",
      "suggestionForSecurity": "Suggestion for Security",
      "appreciationForResponse": "Appreciation for Quick Response",
      
      // Feedback messages
      "policeAssistanceMsg": "I would like to thank the officer who helped me recover my stolen bike. The service was prompt and professional.",
      "trafficManagementMsg": "The traffic situation near Ahilyanagar Market is getting worse. There needs to be better traffic management during peak hours.",
      "securitySuggestionMsg": "I suggest installing more CCTV cameras in our locality. Recent incidents have made residents concerned about safety.",
      "appreciationMsg": "I want to commend your team for the quick response to my emergency call. The officers were at my location within 10 minutes.",

      // Analytics page
      "feedbackAnalytics": "Feedback Analytics",
      "todaysFeedback": "Today's Feedback",
      "totalFeedback": "Total Feedback",
      "averageRating": "Average Rating",
      "monthlyFeedbackTrends": "Monthly Feedback Trends",
      "loadingAnalyticsData": "Loading analytics data...",
      
      // Location names
      "CentralMarket": "Central Market",
      "BusStand": "Bus Stand",
      "CityPark": "City Park",
      "PoliceStation": "Police Station",
      "OtherAreas": "Other Areas",
      
      // Categories
      "service": "Service",
      "traffic": "Traffic",
      "security": "Security",
      "other": "Other",
      
      // Sentiment analysis page
      "sentimentAnalysis": "Sentiment Analysis",
      "positive": "Positive",
      "neutral": "Neutral",
      "negative": "Negative",
      "overallSentimentDistribution": "Overall Sentiment Distribution",
      "sentimentTrendsOverTime": "Sentiment Trends Over Time",
      "sentimentAnalysisByCategory": "Sentiment Analysis by Category",
      "loadingSentimentData": "Loading sentiment data..."
    }
  },
  hi: {
    translation: {
      // Dashboard layout
      "adminDashboard": "एडमिन डैशबोर्ड",
      "receivedFeedback": "प्राप्त प्रतिक्रिया",
      "analytics": "एनालिटिक्स",
      "sentimentAnalysis": "भावना विश्लेषण",
      "logout": "लॉग आउट",
      "welcome": "स्वागत है, एडमिन",
      "dashboardTitle": "अहिल्यानगर पुलिस डैशबोर्ड",
      
      // Feedback page
      "allFeedback": "सभी फीडबैक",
      "new": "नया",
      "read": "पढ़ा हुआ",
      "markAsRead": "पढ़ा हुआ मार्क करें",
      "loadingFeedback": "फीडबैक लोड हो रहा है...",
      "noFeedbackFound": "कोई फीडबैक नहीं मिला",
      
      // Feedback categories
      "regardingPolice": "पुलिस सहायता के संबंध में",
      "trafficManagement": "ट्रैफिक प्रबंधन मुद्दा",
      "suggestionForSecurity": "सुरक्षा के लिए सुझाव",
      "appreciationForResponse": "त्वरित प्रतिक्रिया के लिए प्रशंसा",
      
      // Feedback messages
      "policeAssistanceMsg": "मैं उस अधिकारी को धन्यवाद देना चाहता हूं जिसने मेरी चोरी हुई बाइक को वापस पाने में मदद की। सेवा त्वरित और पेशेवर थी।",
      "trafficManagementMsg": "अहिल्यानगर मार्केट के पास ट्रैफिक की स्थिति बदतर होती जा रही है। व्यस्त समय के दौरान बेहतर ट्रैफिक प्रबंधन की आवश्यकता है।",
      "securitySuggestionMsg": "मैं अपने इलाके में अधिक सीसीटीवी कैमरे लगाने का सुझाव देता हूं। हाल की घटनाओं ने निवासियों को सुरक्षा के बारे में चिंतित कर दिया है।",
      "appreciationMsg": "मैं अपने आपातकालीन कॉल के लिए त्वरित प्रतिक्रिया के लिए आपकी टीम की सराहना करना चाहता हूं। अधिकारी 10 मिनट के भीतर मेरे स्थान पर थे।"
    }
  },
  mr: {
    translation: {
      // Dashboard layout
      "adminDashboard": "प्रशासक डॅशबोर्ड",
      "receivedFeedback": "प्राप्त अभिप्राय",
      "analytics": "विश्लेषणात्मक",
      "sentimentAnalysis": "भावना विश्लेषण",
      "logout": "बाहेर पडा",
      "welcome": "स्वागत आहे, प्रशासक",
      "dashboardTitle": "अहिल्यानगर पोलीस डॅशबोर्ड",
      
      // Feedback page
      "allFeedback": "सर्व अभिप्राय",
      "new": "नवीन",
      "read": "वाचले",
      "markAsRead": "वाचले म्हणून चिन्हांकित करा",
      "loadingFeedback": "अभिप्राय लोड होत आहे...",
      "noFeedbackFound": "कोणताही अभिप्राय सापडला नाही",
      
      // Feedback categories
      "regardingPolice": "पोलीस सहाय्याबद्दल",
      "trafficManagement": "वाहतूक व्यवस्थापन समस्या",
      "suggestionForSecurity": "सुरक्षेसाठी सूचना",
      "appreciationForResponse": "जलद प्रतिसादासाठी कौतुक",
      
      // Feedback messages
      "policeAssistanceMsg": "माझी चोरी झालेली बाईक परत मिळवण्यात मदत केल्याबद्दल मला अधिकाऱ्यांचे आभार मानायचे आहेत. सेवा त्वरित आणि व्यावसायिक होती.",
      "trafficManagementMsg": "अहिल्यानगर मार्केटजवळील वाहतूक परिस्थिती खराब होत आहे. गर्दीच्या वेळी अधिक चांगल्या वाहतूक व्यवस्थापनाची आवश्यकता आहे.",
      "securitySuggestionMsg": "मी आमच्या परिसरात अधिक सीसीटीव्ही कॅमेरे बसवण्याची सूचना करतो. अलीकडील घटनांमुळे रहिवासी सुरक्षेबद्दल चिंतित झाले आहेत.",
      "appreciationMsg": "माझ्या आपत्कालीन कॉलला जलद प्रतिसाद दिल्याबद्दल मी तुमच्या टीमचे अभिनंदन करू इच्छितो. अधिकारी माझ्या स्थानावर १० मिनिटांच्या आत होते."
    }
  }
};

// Create a custom event for language changes that components can listen to
export const LANGUAGE_CHANGED_EVENT = 'i18n-language-changed';

// Get stored language from localStorage or use browser language
const getStoredLanguage = () => {
  // Check localStorage first
  const storedLanguage = localStorage.getItem('language');
  
  // If not in localStorage, check URL parameters (enables language change via URL)
  if (!storedLanguage) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam && ['en', 'hi', 'mr'].includes(langParam)) {
        return langParam;
      }
    } catch (e) {
      console.warn('Error parsing URL parameters for language', e);
    }
  }
  
  // Fall back to browser language or default
  return storedLanguage || navigator.language.split('-')[0];
};

// Change language function that can be used throughout the app
export const changeLanguage = (lng) => {
  localStorage.setItem('language', lng);
  
  // Dispatch a custom event that components can listen to
  const event = new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: { language: lng } });
  document.dispatchEvent(event);
  
  return i18n.changeLanguage(lng);
};

// Get list of available languages
export const getAvailableLanguages = () => {
  return Object.keys(resources);
};

// Get current language
export const getCurrentLanguage = () => {
  return i18n.language;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    }
  });

export default i18n;

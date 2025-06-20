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
      "correctiveMeasures": "Corrective Measures",
      "overallMeasures": "Overall Measures",
      "departmentMeasures": "Department Measures",
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
      "receivedFeedbackTitle": "Received Feedback",
      "exportToExcel": "Export to Excel",
      "noFeedback": "No feedback available",
      "lastRefreshed": "Last refreshed:",
      "filterByDate": "Filter by date:",
      "allTime": "All Time",
      "today": "Today",
      "month": "This Month",
      "feedback": "Feedback",
      "rating": "Rating:",
      "departmentRatings": "Department Ratings",
      "viewImage": "View Image",
      
      // Corrective Measures
      "loadingMeasures": "Loading measures...",
      "addNewMeasure": "Add New Measure",
      "editMeasure": "Edit Measure",
      "issue": "Issue",
      "description": "Description",
      "correctiveAction": "Corrective Action", 
      "status": "Status",
      "pending": "Pending",
      "inProgress": "In Progress",
      "completed": "Completed",
      "priority": "Priority",
      "low": "Low",
      "medium": "Medium",
      "high": "High",
      "dueDate": "Due Date",
      "assignedTo": "Assigned To",
      "saveMeasure": "Save Measure",
      "updateMeasure": "Update Measure",
      "cancel": "Cancel",
      "currentMeasures": "Current Measures",
      "noMeasuresFound": "No measures found",
      "edit": "Edit",
      "delete": "Delete",
      "confirmDeleteMeasure": "Are you sure you want to delete this measure?",
      "selectDepartment": "Select Department",
      "errorFetchingDepartments": "Error fetching departments",
      "errorFetchingDepartmentMeasures": "Error fetching department measures",
      
      // Department-wise Corrective Measures
      "correctiveMeasures": "Corrective Measures",
      "departmentMeasures": "Department-wise Corrective Measures",
      "overallMeasures": "Overall Corrective Measures",
      "issue": "Issue",
      "description": "Description",
      "correctiveAction": "Corrective Action",
      "dueDate": "Due Date",
      "assignedTo": "Assigned To",
      "priority": "Priority",
      "status": "Status",
      "addMeasure": "Add Measure",
      "editMeasure": "Edit Measure",
      "deleteMeasure": "Delete Measure",
      "selectDepartment": "Select Department",
      "noMeasuresFound": "No corrective measures found",
      "measureAdded": "Measure added successfully",
      "measureUpdated": "Measure updated successfully",
      "measureDeleted": "Measure deleted successfully",
      "saveMeasure": "Save Measure",
      "pending": "Pending",
      "inProgress": "In Progress",
      "completed": "Completed",
      "low": "Low",
      "medium": "Medium",
      "high": "High",
      "loadingMeasures": "Loading measures...",
      "errorFetchingDepartments": "Error fetching departments",
      "errorFetchingMeasures": "Error fetching measures",
      "errorFetchingDepartmentMeasures": "Error fetching department measures",
      
      // Sentiment Analysis
      "sentimentAnalysis": "Sentiment Analysis",
      "positive": "Positive",
      "neutral": "Neutral",
      "negative": "Negative",
      "totalFeedback": "Total Feedback",
      "noFeedback": "No Feedback",
      "departmentFeedbackSentiment": "Department Feedback Sentiment",
      "departmentIssueCategories": "Department Issue Categories",
      "negativePercentage": "Negative Percentage",
      "monthlySentimentTrend": "Monthly Sentiment Trend",
      "suggestedCorrectiveMeasures": "Suggested Corrective Measures",
      "noFeedbackForDepartment": "No feedback available for this department",
      "feedbackByDepartment": "Feedback by Department",
      "overallSentiment": "Overall Sentiment",
      "errorFetchingData": "Error fetching feedback data",
      "priorityIssues": "Priority Issues",
      "departmentRatings": "Department Ratings",
      
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
      "count": "count",
      
      // Month names
      "Jan": "Jan",
      "Feb": "Feb",
      "Mar": "Mar",
      "Apr": "Apr",
      "May": "May",
      "Jun": "Jun",
      "Jul": "Jul",
      "Aug": "Aug",
      "Sep": "Sep",
      "Oct": "Oct",
      "Nov": "Nov",
      "Dec": "Dec",
      
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
      "loadingSentimentData": "Loading sentiment data...",

      // Last refreshed text
      "lastRefreshed": "Last refreshed"
    }
  },
  mr: {
    translation: {
      // Dashboard layout
      "adminDashboard": "प्रशासक डॅशबोर्ड",
      "receivedFeedback": "प्राप्त अभिप्राय",
      "analytics": "विश्लेषणात्मक",
      "sentimentAnalysis": "भावना विश्लेषण",
      "correctiveMeasures": "सुधारात्मक उपाय",
      "overallMeasures": "एकूण उपाय",
      "departmentMeasures": "विभागनिहाय उपाय",
      "logout": "बाहेर पडा",
      "welcome": "स्वागत आहे, प्रशासक",
      "dashboardTitle": "अहिल्यानगर पोलीस डॅशबोर्ड",
      
      // Feedback page
      "receivedFeedbackTitle": "प्राप्त अभिप्राय",
      "loadingFeedback": "अभिप्राय लोड करत आहे...",
      "exportToExcel": "एक्सेलमध्ये एक्सपोर्ट करा",
      "noFeedback": "कोणताही अभिप्राय उपलब्ध नाही",
      "lastRefreshed": "शेवटचे रिफ्रेश:",
      
      // Corrective Measures
      "loadingMeasures": "उपाय लोड करत आहे...",
      "addNewMeasure": "नवीन उपाय जोडा",
      "editMeasure": "उपाय संपादित करा",
      "issue": "समस्या",
      "description": "वर्णन",
      "correctiveAction": "सुधारात्मक कारवाई", 
      "status": "स्थिती",
      "pending": "प्रलंबित",
      "inProgress": "प्रगतीपथावर",
      "completed": "पूर्ण",
      "priority": "प्राधान्य",
      "low": "कमी",
      "medium": "मध्यम",
      "high": "उच्च",
      "dueDate": "नियत तारीख",
      "assignedTo": "नियुक्त",
      "saveMeasure": "उपाय जतन करा",
      "updateMeasure": "उपाय अपडेट करा",
      "cancel": "रद्द करा",
      "currentMeasures": "वर्तमान उपाय",
      "noMeasuresFound": "कोणतेही उपाय आढळले नाहीत",
      "edit": "संपादित करा",
      "delete": "हटवा",
      "confirmDeleteMeasure": "आपण नक्कीच हा उपाय हटवू इच्छिता?",
      "selectDepartment": "विभाग निवडा",
      "errorFetchingDepartments": "विभाग आणताना त्रुटी",
      "errorFetchingDepartmentMeasures": "विभागाचे उपाय आणताना त्रुटी",
      
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
      "policeAssistanceMsg": "माझी चोरी झालेली बाईक परत मिळवण्यात मदत केल्याबद्दल मला अधिकार्यांचे आभार मानायचे आहेत. सेवा त्वरित आणि व्यावसायिक होती.",
      "trafficManagementMsg": "अहिल्यानगर मार्केटजवळील वाहतूक परिस्थिती खराब होत आहे. गर्दीच्या वेळी अधिक चांगल्या वाहतूक व्यवस्थापनाची आवश्यकता आहे.",
      "securitySuggestionMsg": "मी आमच्या परिसरात अधिक सीसीटीव्ही कॅमेरे बसवण्याची सूचना करतो. अलीकडील घटनांमुळे रहिवासी सुरक्षेबद्दल चिंतित झाले आहेत.",
      "appreciationMsg": "माझ्या आपत्कालीन कॉलला जलद प्रतिसाद दिल्याबद्दल मी तुमच्या टीमचे अभिनंदन करू इच्छितो. अधिकारी माझ्या स्थानावर १० मिनिटांच्या आत होते.",
      "filterByDate": "दिनांकानुसार फिल्टर करा:",
      "allTime": "सर्व काळ",
      "today": "आज",
      "month": "या महिन्यात",
      "feedback": "अभिप्राय",
      "rating": "मूल्यांकन:",
      "departmentRatings": "विभाग मूल्यांकन",
      "viewImage": "प्रतिमा पहा",
      
      // Analytics page
      "feedbackAnalytics": "अभिप्राय विश्लेषण",
      "todaysFeedback": "आजचे अभिप्राय",
      "totalFeedback": "एकूण अभिप्राय",
      "averageRating": "सरासरी रेटिंग",
      "monthlyFeedbackTrends": "मासिक अभिप्राय ट्रेंड्स",
      "count": "संख्या",
      
      // Month names
      "Jan": "जाने",
      "Feb": "फेब्रु",
      "Mar": "मार्च",
      "Apr": "एप्रि",
      "May": "मे",
      "Jun": "जून",
      "Jul": "जुलै",
      "Aug": "ऑगस्ट",
      "Sep": "सप्टें",
      "Oct": "ऑक्टो",
      "Nov": "नोव्हें",
      "Dec": "डिसें"
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
      if (langParam && ['en', 'mr'].includes(langParam)) {
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

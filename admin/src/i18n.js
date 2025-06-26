import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';


// Translation resources
const resources = {
  en: {
    translation: {
      // Department-specific corrective measures
      "womenSafety_measures": [
        "Increase Patrols: Enhance surveillance in high-risk areas",
        "Gender Sensitivity Training: Regular workshops for officers",
        "Quick Response System: Implement mobile app for reporting",
        "Community Outreach: Collaborate with local NGOs",
        "Transparent Reporting: Create case tracking system"
      ],
      "cyberCrime_measures": [
        "Improve Response Time: Implement faster case processing workflow",
        "Staff Training: Provide regular technical training on cybersecurity",
        "Enhanced Communication: Update users on case status regularly",
        "Private Sector Collaboration: Work with cybersecurity firms",
        "Public Awareness Campaigns: Educate on common cybercrimes"
      ],
      "narcoticDrugs_measures": [
        "Better Investigation Techniques: Use advanced detection technology",
        "Rehabilitation Programs: Partner with rehab centers",
        "Public Education: Develop campaigns about drug dangers",
        "International Coordination: Share intelligence across borders",
        "Specialized Training: Train officers on handling drug cases"
      ],
      "traffic_measures": [
        "Increase Enforcement: Deploy officers at high-traffic areas",
        "Infrastructure Improvements: Upgrade signaling systems",
        "Safety Campaigns: Promote safe driving practices",
        "Real-Time Monitoring: Implement traffic alert systems",
        "Local Collaboration: Work with authorities on road safety"
      ],
      // Dashboard layout
      "adminDashboard": "Admin Dashboard",
      "receivedFeedback": "Received Feedback",
      "analytics": "Analytics",
      "sentimentAnalysis": "Sentiment Analysis",
      "correctiveMeasures": "Corrective Measures",
      "overallMeasures": "Overall Measures",
      "departmentMeasures": "Department Measures",
      "logout": "Logout",
      "confirmLogout": "Are you sure you want to logout?",
      "cancel": "Cancel",
      "confirmYes": "Yes, Logout",
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
      
      // Sentiment Analysis
      "sentimentAnalysis": "Sentiment Analysis",
      "positive": "Positive",
      "neutral": "Neutral",
      "negative": "Negative",
      "overallSentimentDistribution": "Overall Sentiment Distribution",
      "sentimentAnalysisByCategory": "Sentiment Analysis by Category",
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

      // UI buttons
      "viewMore": "View More",

      // Analytics page
      "feedbackAnalytics": "Feedback Analytics",
      "todaysFeedback": "Today's Feedback",
      "totalFeedback": "Total Feedback",
      "averageRating": "Average Rating",
      "monthlyFeedbackTrends": "Monthly Feedback Trends",
      "loadingAnalyticsData": "Loading analytics data...",
      "count": "count",
      
      // Corrective Measures Page
      "correctiveMeasures": "Corrective Measures",
      "departmentPerformanceOverview": "Department Performance Overview",
      "departmentsAnalysis": "Analysis of departments based on average feedback ratings (threshold: {threshold}/10).",
      "departmentsBelowThreshold": "Departments Below Threshold: {threshold}/10",
      "departmentsAboveThreshold": "Departments Above Threshold: {threshold}/10",
      "noDepartmentsBelowThreshold": "No departments below threshold",
      "noDepartmentsAboveThreshold": "No departments above threshold",
      "noFeedbackData": "No feedback data available to analyze",
      "suggestedActions": "Suggested Actions:",
      "correctiveActions": "Corrective Actions:",
      "viewMore": "View More",
      "loadingRealTimeData": "Loading real-time data...",
      "close": "Close",
      "tryAgain": "Try Again",
      "department": "Department",
      "status": "Status",
      "needsImprovement": "Needs Improvement",
      "goodStanding": "Good Standing",
      
      // Default corrective measures
      "conductPerformanceReview": "Conduct performance review",
      "provideTraining": "Provide additional training",
      "improveProcedures": "Improve department procedures",
      "continueBestPractices": "Continue best practices",
      "shareStrategies": "Share successful strategies",
      "recognizeAchievements": "Recognize department achievements",
      
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
      
      // Department names
      "traffic": "Traffic",
      "womenSafety": "Women Safety",
      "narcoticDrugs": "Narcotic Drugs",
      "cyberCrime": "Cyber Crime",
      "updated": "Updated",
      "refreshInterval": "refreshes every 5 minutes",
      "feedbacks": "feedbacks", 
      
      // Location names
      "CentralMarket": "Central Market",
      "BusStand": "Bus Stand",
      "CityPark": "City Park",
      "PoliceStation": "Police Station",
      "OtherAreas": "Other Areas",
      
      // Categories
      "service": "Service",
      "trafficCategory": "Traffic",
      "security": "Security",
      "other": "Other",
      
      // Analytics page
      "dailyFeedbackTrends": "Daily Feedback Trends",
      
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
      // Department-specific corrective measures
      "womenSafety_measures": [
        "गस्ती वाढवा: उच्च जोखीम असलेल्या क्षेत्रांमध्ये निगराणी वाढवा",
        "लिंग संवेदनशीलता प्रशिक्षण: अधिकाऱ्यांसाठी नियमित कार्यशाळा",
        "त्वरित प्रतिसाद प्रणाली: तक्रार नोंदवण्यासाठी मोबाइल अॅप कार्यान्वित करा",
        "समुदाय संपर्क: स्थानिक एनजीओ सोबत सहकार्य करा",
        "पारदर्शक अहवाल: केस ट्रॅकिंग सिस्टम तयार करा"
      ],
      "cyberCrime_measures": [
        "प्रतिसाद वेळ सुधारा: वेगवान प्रकरण प्रक्रिया कार्यप्रवाह लागू करा",
        "कर्मचारी प्रशिक्षण: सायबर सुरक्षेवर नियमित तांत्रिक प्रशिक्षण द्या",
        "वर्धित संवाद: वापरकर्त्यांना प्रकरणाच्या स्थितीबद्दल नियमितपणे अपडेट करा",
        "खाजगी क्षेत्राचे सहकार्य: सायबर सुरक्षा कंपन्यांसोबत काम करा",
        "जनजागृती मोहिमा: सामान्य सायबर गुन्हयांबद्दल शिक्षित करा"
      ],
      "narcoticDrugs_measures": [
        "चांगल्या तपास तंत्रे: प्रगत शोध तंत्रज्ञान वापरा",
        "पुनर्वसन कार्यक्रम: पुनर्वसन केंद्रांसह भागीदारी करा",
        "सार्वजनिक शिक्षण: अंमली पदार्थांच्या धोक्यांबद्दल जागरूकता मोहिम विकसित करा",
        "आंतरराष्ट्रीय समन्वय: सीमांपलीकडे गुप्तचर माहिती शेअर करा",
        "विशेष प्रशिक्षण: अधिकाऱ्यांना ड्रग्ज प्रकरणे हाताळण्याचे प्रशिक्षण द्या"
      ],
      "traffic_measures": [
        "अंमलबजावणी वाढवा: अधिक वर्दळीच्या भागांमध्ये अधिकारी तैनात करा",
        "पायाभूत सुधारणा: सिग्नल प्रणाली अपग्रेड करा",
        "सुरक्षा मोहिमा: सुरक्षित वाहन चालवण्याच्या पद्धती प्रोत्साहित करा",
        "रिअल-टाइम निरीक्षण: वाहतूक अलर्ट सिस्टम लागू करा",
        "स्थानिक सहयोग: रस्ता सुरक्षेसाठी प्राधिकरणांसोबत काम करा"
      ],
      // Dashboard layout
      "adminDashboard": "प्रशासक डॅशबोर्ड",
      "receivedFeedback": "प्राप्त अभिप्राय",
      "analytics": "विश्लेषणात्मक",
      "sentimentAnalysis": "भावना विश्लेषण",
      "correctiveMeasures": "सुधारात्मक उपाय",
      "overallMeasures": "एकूण उपाय",
      "departmentMeasures": "विभागनिहाय उपाय",
      "logout": "बाहेर पडा",
      "confirmLogout": "तुम्हाला खात्री आहे की तुम्ही बाहेर पडू इच्छिता?",
      "cancel": "रद्द करा",
      "confirmYes": "होय, बाहेर पडा",
      "welcome": "स्वागत आहे, प्रशासक",
      "dashboardTitle": "अहिल्यानगर पोलीस डॅशबोर्ड",
      
      // Feedback page
      "receivedFeedbackTitle": "प्राप्त अभिप्राय",
      "loadingFeedback": "अभिप्राय लोड करत आहे...",
      "exportToExcel": "एक्सेलमध्ये एक्सपोर्ट करा",
      "noFeedback": "कोणताही अभिप्राय उपलब्ध नाही",
      "lastRefreshed": "शेवटचे रिफ्रेश:",
      
      // Sentiment Analysis
      "overallSentimentDistribution": "एकूण भावना वितरण",
      "sentimentAnalysisByCategory": "श्रेणीनुसार भावना विश्लेषण",
      "errorFetchingData": "माहिती आणताना त्रुटी",
      "loadingSentimentData": "भावना डेटा लोड करत आहे...",
      "positive": "सकारात्मक",
      "neutral": "तटस्थ",
      "negative": "नकारात्मक",
      
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
      "count": "संख्या",
      "Feedback Count By Station": "पोलीस स्टेशननुसार अभिप्राय संख्या",
      "Feedback Count": "अभिप्राय संख्या",
      "Average Rating By Station": "पोलीस स्टेशननुसार सरासरी मूल्यांकन",
      "filterByStation": "स्टेशननुसार फिल्टर करा:",
      "filterBySentiment": "भावनेनुसार फिल्टर करा:",
      "allSentiments": "सर्व",
      "allStations": "सर्व स्टेशन्स",
      "policeStation": "पोलीस स्टेशन",
      "viewImage": "प्रतिमा पहा",
      
      // Analytics page
      "feedbackAnalytics": "अभिप्राय विश्लेषण",
      "dailyFeedbackTrends": "दैनंदिन अभिप्राय प्रवृत्ती",
      "feedbackCount": "अभिप्राय संख्या",
      "overallAnalysis": "एकूण विश्लेषण",
      "departmentAnalysis": "विभाग निहाय विश्लेषण",
      "policeStationAnalysis": "पोलीस स्टेशन निहाय विश्लेषण",
      "noPoliceStationData": "पोलीस स्टेशन डेटा उपलब्ध नाही",
      "totalPoliceStations": "एकूण पोलीस स्टेशन्स",
      "topRatedStation": "उच्चतम मूल्यांकन असलेले स्टेशन",
      "mostFeedbackStation": "सर्वाधिक अभिप्राय मिळालेले स्टेशन",
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
      "Dec": "डिसें",
      
      // Department names
      "traffic": "वाहतूक",
      "womenSafety": "महिला सुरक्षा",
      "narcoticDrugs": "अमली पदार्थ",
      "cyberCrime": "सायबर गुन्हे",
      "updated": "अपडेट",
      "refreshInterval": "दर 5 मिनिटांनी रिफ्रेश होते",
      "feedbacks": "अभिप्राय",
      
      // Corrective Measures Page
      "correctiveMeasures": "सुधारात्मक उपाय",
      "departmentPerformanceOverview": "विभाग कामगिरी सिंहावलोकन",
      "departmentsAnalysis": "सरासरी अभिप्राय मूल्यांकनावर आधारित विभागांचे विश्लेषण (निकष: {threshold}/10).",
      "departmentsBelowThreshold": "निकषापेक्षा कमी असलेले विभाग: {threshold}/10",
      "departmentsAboveThreshold": "निकषापेक्षा जास्त असलेले विभाग: {threshold}/10", 
      "noDataAvailable": "माहिती उपलब्ध नाही",
      "suggestedActions": "सूचित उपाय",
      "createPlan": "सुधारणा योजना तयार करा",
      "scheduleReview": "पुनरावलोकन नियोजित करा",
      "viewMore": "अधिक पहा",
      "noDepartmentsBelowThreshold": "निकषापेक्षा कमी कोणतेही विभाग नाहीत",
      "noDepartmentsAboveThreshold": "निकषापेक्षा जास्त कोणतेही विभाग नाहीत",
      "departmentCorrectiveMeasures": "{{department}} विभाग सुधारात्मक उपाय",
      "close": "बंद करा",
      "status": "स्थिती",
      "noMeasures": "कोणतेही सुधारात्मक उपाय नाहीत",
      "loadingRealTimeData": "रीअल-टाइम डेटा लोड करत आहे...",
      "tryAgain": "पुन्हा प्रयत्न करा",
      "department": "विभाग",
      "needsImprovement": "सुधारणा आवश्यक आहे",
      "goodStanding": "चांगली स्थिती",
      "conductPerformanceReview": "कामगिरी पुनरावलोकन करा",
      "provideTraining": "अतिरिक्त प्रशिक्षण प्रदान करा",
      "improveProcedures": "विभागाच्या प्रक्रिया सुधारा",
      "continueBestPractices": "उत्तम पद्धती चालू ठेवा",
      "shareStrategies": "यशस्वी रणनीती शेअर करा",
      "recognizeAchievements": "विभागाच्या यशाची दखल घ्या"
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
      prefix: '{',
      suffix: '}'
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    }
  });

export default i18n;

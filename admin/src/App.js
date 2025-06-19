import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import Navbar from './components/Navbar';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import FeedbackPage from './components/Dashboard/FeedbackPage';
import AnalyticsPage from './components/Dashboard/AnalyticsPage';
import SentimentPage from './components/Dashboard/SentimentPage';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
          <Route path="/" element={<Navigate to="/admin/login" />} />
          
          <Route path="/admin/login" element={
            <>
              <Navbar />
              <div className="content-wrapper">
                <AdminLogin />
              </div>
            </>
          } />
          
          {/* Dashboard Route */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard/feedback" replace />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="sentiment" element={<SentimentPage />} />
          </Route>

          {/* Catch all undefined routes and redirect to login */}
          <Route path="*" element={<Navigate to="/admin/login" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword'; // Import ForgotPassword component
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Function to validate email format
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Handle email change with validation
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailValid(newEmail === '' || validateEmail(newEmail));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailValid(false);
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      // Use the actual backend API
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store the token from the backend
      localStorage.setItem('adminToken', data.token);
      // Don't store email in localStorage as requested
      navigate('/admin/dashboard/feedback');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle back to login from ForgotPassword
  const handleBackToLogin = () => {
    setForgotPasswordMode(false); // Switch back to login mode
  };

  return (
    <div className="admin-login-container">
      {forgotPasswordMode ? (
        <ForgotPassword onBackToLogin={handleBackToLogin} />
      ) : (
        <div className="admin-login-box">
          <div>
            <div className="login-header">
              <h1>Admin Login</h1>
              <p className="login-subtext">Enter your credentials to access admin dashboard</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className={`form-group ${!emailValid ? 'has-error' : ''}`}>
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <i className="input-icon email-icon">✉</i>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    className={!emailValid ? 'input-error' : ''}
                    required
                    autoComplete="email"
                  />
                </div>
                {!emailValid && <div className="validation-message">Please enter a valid email address</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <i className="input-icon password-icon">🔒</i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="forgot-password-link">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(true)}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;

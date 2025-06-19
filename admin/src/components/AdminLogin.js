import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(true);

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
    
    // Validate form before submission
    if (!validateEmail(email)) {
      setEmailValid(false);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Simulate API call with a delay
      setTimeout(() => {
        console.log('Login attempt with:', email, password);
        
        // For demo purposes - in real app this would be an actual API call
        if (email && password) {
          // Store a dummy token - in a real app this would come from your server
          localStorage.setItem('adminToken', 'demo-token-123');
          
          // Redirect to dashboard
          navigate('/admin/dashboard/feedback');
        } else {
          setError('Invalid email or password');
          setIsSubmitting(false);
        }
      }, 1000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
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
  );
};

export default AdminLogin;

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../styles/ForgotPassword.css';

const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Function to validate email format
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Handle email submission - Step 1
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // API call to send OTP
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess(data.message || 'OTP sent to your email');
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification - Step 2
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // API call to verify OTP
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setSuccess(data.message || 'OTP verified successfully');
      setStep(3); // Move to password reset step
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset - Step 3
  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // API call to reset password
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword, // Send newPassword
          confirmPassword // Send confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      setSuccess(data.message || 'Password reset successful!');

      // Go back to login after success message is shown
      setTimeout(() => {
        onBackToLogin(email); // Go back to login with the email prefilled
      }, 2000);
    } catch (err) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="password-reset-steps">
        <div className={`step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
        <div className={`step-indicator ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
        <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>
    );
  };

  // Render the email step
  const renderEmailStep = () => {
    return (
      <form onSubmit={handleEmailSubmit} className="forgot-password-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">

            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
        </button>

        <button
          type="button"
          className="back-btn"
          onClick={() => onBackToLogin()} // Go back to login
        >
          Back to Login
        </button>
      </form>
    );
  };

  // Render the OTP verification step
  const renderOtpStep = () => {
    return (
      <form onSubmit={handleOtpSubmit} className="forgot-password-form">
        <div className="form-group">
          <label htmlFor="otp">Enter OTP</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP sent to your email"
              required
              autoComplete="off"
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button
          type="button"
          className="back-btn"
          onClick={() => onBackToLogin()} // Go back to login
        >
          Back to Login
        </button>
      </form>
    );
  };

  // Render the password reset step
  const renderPasswordResetStep = () => {
    return (
      <form onSubmit={handlePasswordResetSubmit} className="forgot-password-form">
        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <div className="input-wrapper">
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <div className="input-wrapper">
            {/* <FontAwesomeIcon icon={faLock} className="input-icon" /> */}
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </button>

        <button
          type="button"
          className="back-btn"
          onClick={() => onBackToLogin()} // Go back to login
        >
          Back to Login
        </button>
      </form>
    );
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-header">
        <h1>Reset Password</h1>
        <p className="forgot-password-subtext">
          {step === 1
            ? 'Enter your email to receive an OTP'
            : step === 2
              ? 'Enter the OTP sent to your email'
              : 'Create a new password'}
        </p>
      </div>

      {renderStepIndicators()}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {step === 1 && renderEmailStep()}
      {step === 2 && renderOtpStep()}
      {step === 3 && renderPasswordResetStep()}
    </div>
  );
};

export default ForgotPassword;

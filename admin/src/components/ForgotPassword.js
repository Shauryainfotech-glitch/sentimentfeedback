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
      const API_URL = process.env.REACT_APP_API_URL ;
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
          <div className="input-wrapper">src\i18n.js
  Line 93:7:   Duplicate key 'cancel'                           no-dupe-keys
  Line 104:7:  Duplicate key 'correctiveMeasures'               no-dupe-keys
  Line 105:7:  Duplicate key 'departmentMeasures'               no-dupe-keys
  Line 106:7:  Duplicate key 'overallMeasures'                  no-dupe-keys
  Line 107:7:  Duplicate key 'issue'                            no-dupe-keys
  Line 108:7:  Duplicate key 'description'                      no-dupe-keys
  Line 109:7:  Duplicate key 'correctiveAction'                 no-dupe-keys
  Line 110:7:  Duplicate key 'dueDate'                          no-dupe-keys
  Line 111:7:  Duplicate key 'assignedTo'                       no-dupe-keys
  Line 112:7:  Duplicate key 'priority'                         no-dupe-keys
  Line 113:7:  Duplicate key 'status'                           no-dupe-keys
  Line 115:7:  Duplicate key 'editMeasure'                      no-dupe-keys
  Line 117:7:  Duplicate key 'selectDepartment'                 no-dupe-keys
  Line 118:7:  Duplicate key 'noMeasuresFound'                  no-dupe-keys
  Line 122:7:  Duplicate key 'saveMeasure'                      no-dupe-keys
  Line 123:7:  Duplicate key 'pending'                          no-dupe-keys
  Line 124:7:  Duplicate key 'inProgress'                       no-dupe-keys
  Line 125:7:  Duplicate key 'completed'                        no-dupe-keys
  Line 126:7:  Duplicate key 'low'                              no-dupe-keys
  Line 127:7:  Duplicate key 'medium'                           no-dupe-keys
  Line 128:7:  Duplicate key 'high'                             no-dupe-keys
  Line 129:7:  Duplicate key 'loadingMeasures'                  no-dupe-keys
  Line 130:7:  Duplicate key 'errorFetchingDepartments'         no-dupe-keys
  Line 132:7:  Duplicate key 'errorFetchingDepartmentMeasures'  no-dupe-keys
  Line 135:7:  Duplicate key 'sentimentAnalysis'                no-dupe-keys
  Line 142:7:  Duplicate key 'noFeedback'                       no-dupe-keys
  Line 153:7:  Duplicate key 'departmentRatings'                no-dupe-keys
  Line 173:7:  Duplicate key 'totalFeedback'                    no-dupe-keys
  Line 180:7:  Duplicate key 'correctiveMeasures'               no-dupe-keys
  Line 190:7:  Duplicate key 'viewMore'                         no-dupe-keys
  Line 195:7:  Duplicate key 'status'                           no-dupe-keys
  Line 239:7:  Duplicate key 'traffic'                          no-dupe-keys
  Line 244:7:  Duplicate key 'sentimentAnalysis'                no-dupe-keys
  Line 245:7:  Duplicate key 'positive'                         no-dupe-keys
  Line 246:7:  Duplicate key 'neutral'                          no-dupe-keys
  Line 247:7:  Duplicate key 'negative'                         no-dupe-keys
  Line 248:7:  Duplicate key 'overallSentimentDistribution'     no-dupe-keys
  Line 250:7:  Duplicate key 'sentimentAnalysisByCategory'      no-dupe-keys
  Line 254:7:  Duplicate key 'lastRefreshed'                    no-dupe-keys
  Line 338:7:  Duplicate key 'cancel'                           no-dupe-keys
  Line 353:7:  Duplicate key 'loadingFeedback'                  no-dupe-keys
  Line 408:7:  Duplicate key 'correctiveMeasures'               no-dupe-keys
  Line 423:7:  Duplicate key 'status'                           no-dupe-keys

Search for the keywords to learn more about each warning.
To ignore, add // eslint-disable-next-line to the line before.

WARNING in [eslint]
src\components\AdminLogin.js
  Line 6:17:  'faTimes' is defined but never used     no-unused-vars
  Line 6:26:  'faPhoneAlt' is defined but never used  no-unused-vars

src\components\Dashboard\AnalyticsPage.js
  Line 79:10:  'improvementData' is assigned a value but never used
     no-unused-vars
  Line 330:6:  React Hook useEffect has a missing dependency: 'fetchAnalyticsData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

src\components\Dashboard\CorrectiveMeasuresPage.js
  Line 185:6:  React Hook useEffect has a missing dependency: 'fetchDepartmentData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  Line 210:6:  React Hook useEffect has a missing dependency: 'fetchDepartmentData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  Line 501:6:  React Hook useEffect has a missing dependency: 'fetchDepartmentData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

src\components\Dashboard\DashboardLayout.js
  Line 10:11:   'currentLanguage' is assigned a value but never used

                                                                                                                 no-unused-vars  
  Line 17:10:   'expandCorrectiveMeasures' is assigned a value but never used

                                                                                                                 no-unused-vars  
  Line 17:36:   'setExpandCorrectiveMeasures' is assigned a value but never used

                                                                                                                 no-unused-vars  
  Line 172:15:  The href attribute requires a valid value to be accessible. Provide a valid, navigable address as the href value. If you cannot provide a valid href, but still need the element to resemble a link, use a button and change it with appropriate styles. Learn more: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-is-valid.md  jsx-a11y/anchor-is-valid

src\components\Dashboard\SentimentPage.js
  Line 3:121:   'LineChart' is defined but never used
                            no-unused-vars
  Line 3:132:   'Line' is defined but never used
                            no-unused-vars
  Line 152:6:   React Hook useEffect has missing dependencies: 'feedbackData' and 'processFeedbackData'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  Line 278:9:   'renderActiveShape' is assigned a value but never used
                            no-unused-vars
  Line 279:93:  'value' is assigned a value but never used
                            no-unused-vars
  Line 541:10:  'forceUpdate' is assigned a value but never used
                            no-unused-vars

src\components\ForgotPassword.js
  Line 3:10:  'faEnvelope' is defined but never used  no-unused-vars
  Line 3:49:  'faKey' is defined but never used       no-unused-vars

src\i18n.js
  Line 93:7:   Duplicate key 'cancel'                           no-dupe-keys
  Line 104:7:  Duplicate key 'correctiveMeasures'               no-dupe-keys
  Line 105:7:  Duplicate key 'departmentMeasures'               no-dupe-keys
  Line 106:7:  Duplicate key 'overallMeasures'                  no-dupe-keys
  Line 107:7:  Duplicate key 'issue'                            no-dupe-keys
  Line 108:7:  Duplicate key 'description'                      no-dupe-keys
  Line 109:7:  Duplicate key 'correctiveAction'                 no-dupe-keys
  Line 110:7:  Duplicate key 'dueDate'                          no-dupe-keys
  Line 111:7:  Duplicate key 'assignedTo'                       no-dupe-keys
  Line 112:7:  Duplicate key 'priority'                         no-dupe-keys
  Line 113:7:  Duplicate key 'status'                           no-dupe-keys
  Line 115:7:  Duplicate key 'editMeasure'                      no-dupe-keys
  Line 117:7:  Duplicate key 'selectDepartment'                 no-dupe-keys
  Line 118:7:  Duplicate key 'noMeasuresFound'                  no-dupe-keys
  Line 122:7:  Duplicate key 'saveMeasure'                      no-dupe-keys
  Line 123:7:  Duplicate key 'pending'                          no-dupe-keys
  Line 124:7:  Duplicate key 'inProgress'                       no-dupe-keys
  Line 125:7:  Duplicate key 'completed'                        no-dupe-keys
  Line 126:7:  Duplicate key 'low'                              no-dupe-keys
  Line 127:7:  Duplicate key 'medium'                           no-dupe-keys
  Line 128:7:  Duplicate key 'high'                             no-dupe-keys
  Line 129:7:  Duplicate key 'loadingMeasures'                  no-dupe-keys
  Line 130:7:  Duplicate key 'errorFetchingDepartments'         no-dupe-keys
  Line 132:7:  Duplicate key 'errorFetchingDepartmentMeasures'  no-dupe-keys
  Line 135:7:  Duplicate key 'sentimentAnalysis'                no-dupe-keys
  Line 142:7:  Duplicate key 'noFeedback'                       no-dupe-keys
  Line 153:7:  Duplicate key 'departmentRatings'                no-dupe-keys
  Line 173:7:  Duplicate key 'totalFeedback'                    no-dupe-keys
  Line 180:7:  Duplicate key 'correctiveMeasures'               no-dupe-keys
  Line 190:7:  Duplicate key 'viewMore'                         no-dupe-keys
  Line 195:7:  Duplicate key 'status'                           no-dupe-keys
  Line 239:7:  Duplicate key 'traffic'                          no-dupe-keys
  Line 244:7:  Duplicate key 'sentimentAnalysis'                no-dupe-keys
  Line 245:7:  Duplicate key 'positive'                         no-dupe-keys
  Line 246:7:  Duplicate key 'neutral'                          no-dupe-keys
  Line 247:7:  Duplicate key 'negative'                         no-dupe-keys
  Line 248:7:  Duplicate key 'overallSentimentDistribution'     no-dupe-keys
  Line 250:7:  Duplicate key 'sentimentAnalysisByCategory'      no-dupe-keys
  Line 254:7:  Duplicate key 'lastRefreshed'                    no-dupe-keys
  Line 338:7:  Duplicate key 'cancel'                           no-dupe-keys
  Line 353:7:  Duplicate key 'loadingFeedback'                  no-dupe-keys
  Line 408:7:  Duplicate key 'correctiveMeasures'               no-dupe-keys
  Line 423:7:  Duplicate key 'status'                           no-dupe-keys

webpack compiled with 1 warning
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
            <FontAwesomeIcon icon={faLock} className="input-icon" />
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

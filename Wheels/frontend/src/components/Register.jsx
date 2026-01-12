import React, { useState } from 'react';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 6;
    
    if (hasMinLength && hasNumber && hasSpecialChar) {
      return 'strong';
    } else if (hasMinLength && (hasNumber || hasSpecialChar)) {
      return 'medium';
    } else {
      return 'weak';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Check password strength in real-time
    if (name === 'password') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Mark all fields as touched on submit
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Check for empty fields
    const emptyFields = Object.entries(formData).filter(([key, value]) => !value.trim());
    if (emptyFields.length > 0) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check password strength
    const strength = checkPasswordStrength(formData.password);
    if (strength === 'weak') {
      setError('Password must contain at least one number AND one special character');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Welcome to Wheel Hub! Registration successful!');
        onSwitchToLogin();
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if field is invalid
  const isFieldInvalid = (fieldName) => {
    return touched[fieldName] && !formData[fieldName].trim();
  };

  // Get password strength color and message
  const getPasswordStrengthInfo = () => {
    if (!passwordStrength) return null;

    const config = {
      weak: { color: '#f56565', message: 'Weak - Add numbers AND special characters', requirements: 'Missing: numbers and special characters' },
      medium: { color: '#ed8936', message: 'Medium - Add numbers OR special characters', requirements: 'Should include both numbers and special characters' },
      strong: { color: '#48bb78', message: 'Strong password', requirements: 'Contains numbers and special characters' }
    };

    return config[passwordStrength];
  };

  const strengthInfo = getPasswordStrengthInfo();

  return (
    <div className="form-container">
      <h1 className="welcome-title">
        Create <strong>account</strong>
      </h1>
      <p className="welcome-subtitle">Join Wheel Hub today</p>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">
            FULL NAME
          </label>
          <input
            className={`form-input ${isFieldInvalid('fullName') ? 'input-error' : ''}`}
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your full name"
            required
            disabled={loading}
          />
          {isFieldInvalid('fullName') && (
            <div style={{ color: '#f56565', fontSize: '12px', marginTop: '4px' }}>
              Full name is required
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            EMAIL ADDRESS
          </label>
          <input
            className={`form-input ${isFieldInvalid('email') ? 'input-error' : ''}`}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your email address"
            required
            disabled={loading}
          />
          {isFieldInvalid('email') && (
            <div style={{ color: '#f56565', fontSize: '12px', marginTop: '4px' }}>
              Email is required
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            USERNAME
          </label>
          <input
            className={`form-input ${isFieldInvalid('username') ? 'input-error' : ''}`}
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Choose a username"
            required
            disabled={loading}
          />
          {isFieldInvalid('username') && (
            <div style={{ color: '#f56565', fontSize: '12px', marginTop: '4px' }}>
              Username is required
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            PASSWORD
          </label>
          <input
            className={`form-input ${isFieldInvalid('password') ? 'input-error' : ''}`}
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Create a password (min. 6 characters with numbers & special chars)"
            required
            disabled={loading}
          />
          {isFieldInvalid('password') && (
            <div style={{ color: '#f56565', fontSize: '12px', marginTop: '4px' }}>
              Password is required
            </div>
          )}
          
          {/* Password Strength Indicator */}
          {passwordStrength && (
            <div style={{ 
              marginTop: '8px',
              fontSize: '12px',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: strengthInfo.color + '20',
              borderLeft: `3px solid ${strengthInfo.color}`
            }}>
              <div style={{ 
                color: strengthInfo.color, 
                fontWeight: '600',
                marginBottom: '2px'
              }}>
                {strengthInfo.message}
              </div>
              <div style={{ 
                color: '#718096',
                fontSize: '11px'
              }}>
                {strengthInfo.requirements}
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            CONFIRM PASSWORD
          </label>
          <input
            className={`form-input ${isFieldInvalid('confirmPassword') ? 'input-error' : ''}`}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Confirm your password"
            required
            disabled={loading}
          />
          {isFieldInvalid('confirmPassword') && (
            <div style={{ color: '#f56565', fontSize: '12px', marginTop: '4px' }}>
              Please confirm your password
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </button>
      </form>
      
      <div className="auth-links">
        <div className="switch-auth">
          Already have an account?
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
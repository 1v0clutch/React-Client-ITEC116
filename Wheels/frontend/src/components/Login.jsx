import React, { useState } from 'react';

const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('🔐 Login successful:', data.user);
        alert('Welcome back! Login successful!');
        // Redirect to dashboard here
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="welcome-title">
        Welcome <strong>back</strong>
      </h1>
      <p className="welcome-subtitle">Sign in to your account</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input
            className="form-input"
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            className="form-input"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </form>
      
      <div className="auth-links">
        <a href="#" className="forgot-link">Forgot your password?</a>
        <div className="switch-auth">
          Don't have an account?
          <a href="#" onClick={onSwitchToRegister}>Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
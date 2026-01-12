import React, { useState } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import './styles.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const switchToRegister = () => {
    setCurrentPage('register');
  };

  const switchToLogin = () => {
    setCurrentPage('login');
  };

  return (
    <div className="app-container">
      {/* Left Side - Image/Graphic Section */}
      <div className="image-section">
        <div className="image-content">
          <h1 className="image-title">
             <strong>TIRONO TIRE SHOP</strong>
          </h1>
          <p className="image-subtitle">
            Your ultimate destination for automotive excellence
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="form-section">
        <div className="form-container">
          {currentPage === 'login' ? (
            <Login onSwitchToRegister={switchToRegister} />
          ) : (
            <Register onSwitchToLogin={switchToLogin} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
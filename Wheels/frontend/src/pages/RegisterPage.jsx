// src/pages/RegisterPage.jsx
import React from 'react';
import Register from '../components/Register.jsx';

const RegisterPage = ({ onSwitchToLogin }) => {
  return <Register onSwitchToLogin={onSwitchToLogin} />;
};

export default RegisterPage;
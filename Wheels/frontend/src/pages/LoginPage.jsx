// src/pages/LoginPage.jsx
import React from 'react';
import Login from '../components/Login.jsx';

const LoginPage = ({ onSwitchToRegister }) => {
  return <Login onSwitchToRegister={onSwitchToRegister} />;
};

export default LoginPage;
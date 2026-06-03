import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import VerifyOTP from './VerifyOTP';
import ForgotPassword from './ForgotPassword'; // 🔑 Missing Import Fixed!
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Baseline redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Core Authentication Routes Mapping */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* 🎯 ROUTE ADDED */}
        
        {/* Main Interface Layout Area */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Fallback route catching */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

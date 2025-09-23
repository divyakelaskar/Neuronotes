import { useState } from 'react'
import React from 'react'
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Landing from './pages/Landing';
import AuthPage from './pages/LoginSignup';
import Home from './pages/Home.jsx';
import ProtectedRoute from './ProtectedRoute';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

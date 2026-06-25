import React, { useState, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import axiosInstance from './utils/axiosInstance'

const App = () => {
  const [authUser, setAuthUser] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');

    if (token && userStr) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', decodeURIComponent(userStr));
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/auth/get-me')
        setAuthUser(response.data.user)
      } catch (error) {
        setAuthUser(null)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-[#181824] bg-[url('/src/assets/cosmic-bg.png')] bg-cover bg-center flex flex-col justify-center items-center p-4 sm:p-0">
      
      {isCheckingAuth ? (
        <div className="text-white text-lg flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></span>
          Loading...
        </div>
      ) : (
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" replace />} />
          
          <Route path="/forgot-password" element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/" replace />} />
          <Route path="/reset-password/:token" element={!authUser ? <ResetPasswordPage /> : <Navigate to="/" replace />} />
        </Routes>
      )}

    </div>
  )
}

export default App
// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

// Lazy load pages
const SignInPage = lazy(() => import('./pages/SignInPage'));
const PurchasePage = lazy(() => import('./pages/PurchasePage'));
const CoursePage = lazy(() => import('./pages/CoursePage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard')); 

// Keep LandingPage in components since it uses EmailCaptureModal
const LandingPage = lazy(() => import('./components/LandingPage'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/purchase" 
              element={
                <ProtectedRoute>
                  <PurchasePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/course" 
              element={
                <ProtectedRoute requiresPurchase>
                  <CoursePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
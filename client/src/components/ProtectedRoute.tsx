// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresPurchase?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresPurchase = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (requiresPurchase && !user.hasPurchasedCourse) {
    return <Navigate to="/purchase" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
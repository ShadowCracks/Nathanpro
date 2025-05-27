// pages/SignInPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

declare global {
  interface Window {
    google: any;
  }
}

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    // Redirect if already signed in
    if (user) {
      navigate('/course');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        {
          theme: 'outline',
          size: 'large',
          width: 280,
          ux_mode: 'redirect', // Add this line
          redirect_uri: 'https://nathanpro.onrender.com' // Add this line
        }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google`,
        { token: response.credential }
      );

      if (res.data.success) {
        await checkAuth();
        navigate('/course');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign in to Continue
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Please sign in with your Google account to purchase or access the course.
        </p>
        <div id="googleSignInButton" className="flex justify-center"></div>
      </div>
    </div>
  );
};

export default SignInPage;
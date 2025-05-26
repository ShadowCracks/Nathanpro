// src/components/GoogleSignIn.tsx
import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

interface GoogleSignInProps {
  onSuccess: () => void;
}

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({ onSuccess }) => {
  const handleGoogleResponse = async (credentialResponse: any) => {
    try {
      const res = await axios.post('/api/auth/google', { 
        token: credentialResponse.credential 
      });

      if (res.data.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Sign-in failed. Please try again.');
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleResponse}
          onError={() => {
            console.error('Google sign-in failed');
            alert('Sign-in failed. Please try again.');
          }}
          size="large"
          theme="outline"
          text="signin_with"
          width="280"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleSignIn;
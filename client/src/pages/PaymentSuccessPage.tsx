// pages/PaymentSuccessPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed'>('processing');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        setPaymentStatus('failed');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/stripe/verify/${sessionId}`
      );

      if (response.data.success && response.data.paid) {
        setPaymentStatus('success');
        await checkAuth();
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">
            We couldn't verify your payment. Please contact support if you believe this is an error.
          </p>
          <button
            onClick={() => navigate('/course')}
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. You now have full access to the course.
        </p>
        <button
          onClick={() => navigate('/course')}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Go to Course
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
// pages/PurchasePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!); 

const PurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already purchased
    if (user?.hasPurchasedCourse) {
      navigate('/course');
    }
  }, [user, navigate]);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/stripe/create-checkout`,
        { productType: 'course' }
      );

      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({
        sessionId: response.data.sessionId,
      });

      if (error) {
        console.error('Stripe error:', error);
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert('Your session has expired. Please sign in again.');
        navigate('/signin');
      } else {
        alert('Failed to initiate purchase. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Protected by ProtectedRoute

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Complete Your Purchase
          </h2>
          <p className="text-gray-600">
            Welcome, {user.name || user.email}! You're one step away from accessing the course.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Lifetime access to all course materials</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">High-quality video tutorials</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Regular updates and new content</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800 mb-6">$99.00</p>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : 'Purchase Course'}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Secure payment powered by Stripe
          </p>
        </div>

        <button
          onClick={logout}
          className="mt-6 text-sm text-gray-600 hover:text-gray-800 underline block mx-auto"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default PurchasePage;
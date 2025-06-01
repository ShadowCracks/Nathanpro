// src/components/LandingPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailCaptureModal from './EmailCaptureModal';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEbookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleCourseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If user is already signed in and purchased, go to course
    if (user?.hasPurchasedCourse) {
      navigate('/course');
    } else if (user) {
      // If signed in but not purchased, go to purchase page
      navigate('/purchase');
    } else {
      // If not signed in, go to sign in page
      navigate('/signin');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      // TODO: Send email to your backend for ebook download tracking
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ebook/register-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Redirect to ebook download or show download link
        window.location.href = `/download-ebook?email=${encodeURIComponent(email)}`;
      }
    } catch (error) {
      console.error('Failed to process ebook download:', error);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Header */}
        <header className="relative z-10 px-6 py-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="font-bold text-xl text-gray-900">Nathan Soufer</div>
            {user && (
              <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                {user.email}
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Text */}
            <div className="mb-12">
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Master Your
                <span className="block text-blue-500">Potential</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Transform your skills with expert-crafted courses and resources designed for real-world success.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <button
                onClick={handleCourseClick}
                className="group relative px-8 py-4 bg-blue-500 text-white rounded-2xl font-semibold text-lg hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <span className="relative z-10">
                  {user?.hasPurchasedCourse ? 'Continue Learning' : 'Start Learning'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                onClick={handleEbookClick}
                className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                Free Resources
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                {
                  icon: "🎯",
                  title: "Expert-Led",
                  description: "Learn from industry professionals with real-world experience"
                },
                {
                  icon: "⚡",
                  title: "Practical",
                  description: "Hands-on projects and exercises that build real skills"
                },
                {
                  icon: "🚀",
                  title: "Results-Driven",
                  description: "Proven methods that deliver measurable outcomes"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-20 fill-gray-50">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      <EmailCaptureModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmitEmail={handleEmailSubmit}
      />
    </>
  );
};

export default LandingPage;
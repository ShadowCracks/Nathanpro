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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-800">Nathan Soufer</h1>
          <p className="text-xl text-gray-600">
            Author, Instructor, and Expert in [Your Topic]. Helping you master [Your Topic].
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={handleEbookClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
            >
              📚 Purchase Ebook
            </button>

            <button
              onClick={handleCourseClick}
              className="px-6 py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition duration-200"
            >
              🎓 {user?.hasPurchasedCourse ? 'Access Course' : 'Purchase Course'}
            </button>
          </div>

          {user && (
            <p className="text-sm text-gray-600">
              Signed in as {user.email}
            </p>
          )}
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
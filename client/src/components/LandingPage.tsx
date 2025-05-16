import React, { useState } from 'react';
import EmailCaptureModal from './EmailCaptureModal';

const LandingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEbookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleEmailSubmit = (email: string) => {
    // TODO: send `email` to your backend or email service
    window.location.href = `/download-ebook?email=${encodeURIComponent(email)}`;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-800">Nathan Soufer</h1>
          <p className="text-xl text-gray-600">
            Author, Instructor, and Expert in [test]. Helping you master [Your Topic].
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={handleEbookClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
            >
              📚 Purchase Ebook
            </button>

            <a
              href="/purchase-course"
              className="px-6 py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition duration-200"
            >
              🎓 Purchase Course
            </a>
          </div>
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

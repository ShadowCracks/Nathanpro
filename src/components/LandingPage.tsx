import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-800">
          Nathan Soufer
        </h1>
        <p className="text-xl text-gray-600">
          Author, Instructor, and Expert in [Your Expertise Here]. Helping you master [Your Topic].
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {/* Ebook Purchase Button */}
          <a
            href="/purchase-ebook"
            className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
          >
            📚 Purchase Ebook
          </a>

          {/* Course Purchase Button */}
          <a
            href="/purchase-course"
            className="px-6 py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition duration-200"
          >
            🎓 Purchase Course
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

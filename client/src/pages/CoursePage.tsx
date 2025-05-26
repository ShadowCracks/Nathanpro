// pages/CoursePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface CourseModule {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string;
  order_index: number;
}

const CoursePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseModules();
  }, []);

  const fetchCourseModules = async () => {
    try {
      const response = await axios.get('/api/course/modules');
      setCourseModules(response.data.modules);
    } catch (error) {
      console.error('Failed to fetch course modules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Protected by ProtectedRoute

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Course Content</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name || user.email}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : courseModules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No course modules available yet. Please check back later.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {courseModules.map((module, index) => (
              <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Module {index + 1}: {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-gray-600 mb-4">{module.description}</p>
                  )}
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={`https://www.youtube.com/embed/${module.youtube_video_id}`}
                      title={module.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-96 rounded"
                    ></iframe>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePage;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  email: string;
  registeredAt: string;
  courseStatus: 'enrolled' | 'completed' | 'inactive';
}

const Dashboard: React.FC = () => {
  const [isCoursePublished, setIsCoursePublished] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch course status and registered users on mount
  useEffect(() => {
    fetchCourseStatus();
    fetchRegisteredUsers();
  }, []);

  const fetchCourseStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/course/status');
      setIsCoursePublished(response.data.published);
    } catch (err) {
      setError('Failed to fetch course status');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/registered');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch registered users');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      setLoading(true);
      await axios.post('/api/course/publish', { published: !isCoursePublished });
      setIsCoursePublished(!isCoursePublished);
      setError(null);
    } catch (err) {
      setError('Failed to update course status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Course Management Dashboard</h1>

        {/* Publish Course Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Course Status</h2>
          <p className="text-gray-600 mb-4">
            Course is currently {isCoursePublished ? 'Published' : 'Unpublished'}
          </p>
          <button
            onClick={handlePublishToggle}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              isCoursePublished
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading
              ? 'Processing...'
              : isCoursePublished
              ? 'Unpublish Course'
              : 'Publish Course'}
          </button>
        </div>

        {/* Registered Users Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Registered Users</h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {loading ? (
            <p className="text-gray-600">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-600">No users registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-gray-700">Email</th>
                    <th className="p-3 text-gray-700">Registered At</th>
                    <th className="p-3 text-gray-700">Course Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 text-gray-600">{user.email}</td>
                      <td className="p-3 text-gray-600">
                        {new Date(user.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-gray-600 capitalize">{user.courseStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
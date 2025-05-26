// src/components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  purchases: Purchase[];
}

interface Purchase {
  id: string;
  product_type: 'course' | 'ebook';
  amount: number;
  status: string;
  purchased_at: string;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string;
  order_index: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'course'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [ebookDownloads, setEbookDownloads] = useState<number>(0);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Module form state
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    moduleId: null as string | null,
  });

  const adminId = localStorage.getItem('adminId'); // Get from localStorage after login

  useEffect(() => {
    if (!adminId) {
      window.location.href = '/admin/login';
      return;
    }
    fetchDashboardData();
  }, [adminId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { 'admin-id': adminId }
      });
      setUsers(usersResponse.data.users);

      // Fetch ebook stats
      const statsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/ebook-stats`, {
        headers: { 'admin-id': adminId }
      });
      setEbookDownloads(statsResponse.data.downloads);

      // Fetch course modules
      const modulesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/course/modules`, {
        headers: { 'admin-id': adminId }
      });
      setCourseModules(modulesResponse.data.modules);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const orderIndex = moduleForm.moduleId 
        ? courseModules.find(m => m.id === moduleForm.moduleId)?.order_index || 0
        : courseModules.length;

      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/course/module`, {
        ...moduleForm,
        orderIndex,
      }, {
        headers: { 'admin-id': adminId }
      });

      // Reset form and refresh modules
      setModuleForm({ title: '', description: '', youtubeUrl: '', moduleId: null });
      fetchDashboardData();
    } catch (err) {
      setError('Failed to save module');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleDelete = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/course/module/${moduleId}`, {
        headers: { 'admin-id': adminId }
      });
      fetchDashboardData();
    } catch (err) {
      setError('Failed to delete module');
    }
  };

  const handleModuleReorder = async (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = courseModules.findIndex(m => m.id === moduleId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= courseModules.length) return;
    
    const reorderedModules = [...courseModules];
    const [movedModule] = reorderedModules.splice(currentIndex, 1);
    reorderedModules.splice(newIndex, 0, movedModule);
    
    // Update order indices
    const updates = reorderedModules.map((module, index) => ({
      id: module.id,
      order_index: index
    }));
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/course/reorder`, { modules: updates }, {
        headers: { 'admin-id': adminId }
      });
      setCourseModules(reorderedModules);
    } catch (err) {
      setError('Failed to reorder modules');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminId');
    window.location.href = '/admin/login';
  };

  // Calculate stats
  const totalUsers = users.length;
  const coursesPurchased = users.filter(u => 
    u.purchases.some(p => p.product_type === 'course' && p.status === 'completed')
  ).length;
  const ebooksPurchased = users.filter(u => 
    u.purchases.some(p => p.product_type === 'ebook' && p.status === 'completed')
  ).length;
  const totalRevenue = users.reduce((sum, user) => 
    sum + user.purchases
      .filter(p => p.status === 'completed')
      .reduce((userSum, purchase) => userSum + purchase.amount, 0), 0
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'overview' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'users' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('course')}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'course' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Course Management
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Courses Purchased</h3>
                  <p className="text-3xl font-bold text-green-600">{coursesPurchased}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Ebooks Purchased</h3>
                  <p className="text-3xl font-bold text-blue-600">{ebooksPurchased}</p>
                  <p className="text-sm text-gray-500 mt-1">{ebookDownloads} downloads</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Registered Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purchases
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Spent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => {
                        const userTotal = user.purchases
                          .filter(p => p.status === 'completed')
                          .reduce((sum, p) => sum + p.amount, 0);
                        
                        return (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                {user.purchases.some(p => p.product_type === 'course' && p.status === 'completed') && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Course
                                  </span>
                                )}
                                {user.purchases.some(p => p.product_type === 'ebook' && p.status === 'completed') && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Ebook
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${userTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Course Management Tab */}
            {activeTab === 'course' && (
              <div className="space-y-6">
                {/* Add/Edit Module Form */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {moduleForm.moduleId ? 'Edit Module' : 'Add New Module'}
                  </h2>
                  <form onSubmit={handleModuleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Module Title
                      </label>
                      <input
                        type="text"
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={moduleForm.description}
                        onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={moduleForm.youtubeUrl}
                        onChange={(e) => setModuleForm({ ...moduleForm, youtubeUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        {moduleForm.moduleId ? 'Update Module' : 'Add Module'}
                      </button>
                      {moduleForm.moduleId && (
                        <button
                          type="button"
                          onClick={() => setModuleForm({ title: '', description: '', youtubeUrl: '', moduleId: null })}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Course Modules List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Course Modules</h2>
                  </div>
                  <div className="p-6">
                    {courseModules.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No modules added yet</p>
                    ) : (
                      <div className="space-y-4">
                        {courseModules.map((module, index) => (
                          <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {index + 1}. {module.title}
                                </h3>
                                {module.description && (
                                  <p className="text-gray-600 mt-1">{module.description}</p>
                                )}
                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                  <a
                                    href={module.youtube_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View on YouTube
                                  </a>
                                  <span>•</span>
                                  <span>Video ID: {module.youtube_video_id}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleModuleReorder(module.id, 'up')}
                                  disabled={index === 0}
                                  className={`p-1 rounded ${
                                    index === 0 
                                      ? 'text-gray-300 cursor-not-allowed' 
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                  title="Move up"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleModuleReorder(module.id, 'down')}
                                  disabled={index === courseModules.length - 1}
                                  className={`p-1 rounded ${
                                    index === courseModules.length - 1 
                                      ? 'text-gray-300 cursor-not-allowed' 
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                  title="Move down"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setModuleForm({
                                    title: module.title,
                                    description: module.description,
                                    youtubeUrl: module.youtube_url,
                                    moduleId: module.id,
                                  })}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Edit"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleModuleDelete(module.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
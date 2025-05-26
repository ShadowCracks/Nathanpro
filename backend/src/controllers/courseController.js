// backend/src/controllers/courseController.js
const supabase = require('../services/supabase');

// Get course modules for authenticated users
const getCourseModules = async (req, res) => {
  try {
    // Verify user has purchased the course
    if (!req.user.hasPurchasedCourse) {
      return res.status(403).json({ error: 'Course not purchased' });
    }
    
    // Get course modules
    const { data: modules, error } = await supabase
      .from('course_modules')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    res.json({ modules });
  } catch (error) {
    console.error('Error fetching course modules:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get course status (public info)
const getCourseStatus = async (req, res) => {
  try {
    // This could be from a settings table or hard-coded
    // For now, we'll return a simple status
    res.json({ 
      published: true,
      price: 99.00,
      currency: 'USD'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCourseModules,
  getCourseStatus
};
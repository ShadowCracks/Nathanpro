// backend/src/controllers/adminController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const supabase = require('../services/supabase');

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get admin from database
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const adminToken = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Set cookie
    res.cookie('adminToken', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
      success: true, 
      admin: { 
        id: admin.id, 
        email: admin.email,
        name: admin.name 
      } 
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        purchases (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get ebook statistics
const getEbookStats = async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .from('ebook_stats')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    res.json({ downloads: stats?.download_count || 0 });
  } catch (error) {
    console.error('Error fetching ebook stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create or update course module
const upsertCourseModule = async (req, res) => {
  try {
    const { title, description, youtubeUrl, orderIndex, moduleId } = req.body;
    
    // Extract YouTube video ID
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    const moduleData = {
      title,
      description,
      youtube_url: youtubeUrl,
      youtube_video_id: videoId,
      order_index: orderIndex,
      updated_at: new Date().toISOString(),
    };
    
    let result;
    
    if (moduleId) {
      // Update existing module
      const { data, error } = await supabase
        .from('course_modules')
        .update(moduleData)
        .eq('id', moduleId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new module
      const { data, error } = await supabase
        .from('course_modules')
        .insert({
          ...moduleData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    res.json({ success: true, module: result });
  } catch (error) {
    console.error('Error upserting module:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete course module
const deleteCourseModule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all course modules
const getAllCourseModules = async (req, res) => {
  try {
    const { data: modules, error } = await supabase
      .from('course_modules')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    res.json({ modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reorder course modules
const reorderCourseModules = async (req, res) => {
  try {
    const { modules } = req.body; // Array of { id, order_index }
    
    // Update each module's order
    const updates = modules.map(module => 
      supabase
        .from('course_modules')
        .update({ order_index: module.order_index })
        .eq('id', module.id)
    );
    
    await Promise.all(updates);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering modules:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  adminLogin,
  getAllUsers,
  getEbookStats,
  upsertCourseModule,
  deleteCourseModule,
  getAllCourseModules,
  reorderCourseModules
};
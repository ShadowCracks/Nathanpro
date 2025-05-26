// backend/src/middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const supabase = require('../services/supabase');

const authenticateAdmin = async (req, res, next) => {
  const token = req.cookies.adminToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', decoded.adminId)
      .single();
    
    if (error || !admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
};

module.exports = { authenticateAdmin };
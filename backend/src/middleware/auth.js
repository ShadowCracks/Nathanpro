// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const supabase = require('../services/supabase');

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }
    
    // Check if user has active course access
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_type', 'course')
      .eq('status', 'completed')
      .single();
    
    // Attach user to request object
    req.user = {
      ...user,
      hasPurchasedCourse: !!purchase
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateToken };
// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const supabase = require('../services/supabase');
const googleClient = require('../services/googleAuth');

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Google Sign-In
const googleSignIn = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    
    // Check if user exists
    let { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    let user;
    
    if (!existingUser || fetchError?.code === 'PGRST116') {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          name,
          google_id: googleId,
          profile_picture: picture,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (createError) throw createError;
      user = newUser;
    } else {
      user = existingUser;
    }
    
    // Check if user has purchased the course
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_type', 'course')
      .eq('status', 'completed')
      .single();
    
    // Create JWT token
    const authToken = generateToken(user.id, user.email);
    
    // Set secure HTTP-only cookie
    res.cookie('authToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasPurchasedCourse: !!purchase,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      hasPurchasedCourse: req.user.hasPurchasedCourse
    }
  });
};

// Logout
const logout = async (req, res) => {
  res.clearCookie('authToken');
  res.json({ success: true });
};

module.exports = {
  googleSignIn,
  getCurrentUser,
  logout
};
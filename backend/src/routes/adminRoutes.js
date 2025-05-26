// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminAuth');
const {
  adminLogin,
  getAllUsers,
  getEbookStats,
  upsertCourseModule,
  deleteCourseModule,
  getAllCourseModules,
  reorderCourseModules
} = require('../controllers/adminController');

// Public admin routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/users', authenticateAdmin, getAllUsers);
router.get('/ebook-stats', authenticateAdmin, getEbookStats);
router.get('/course/modules', authenticateAdmin, getAllCourseModules);
router.post('/course/module', authenticateAdmin, upsertCourseModule);
router.delete('/course/module/:id', authenticateAdmin, deleteCourseModule);
router.post('/course/reorder', authenticateAdmin, reorderCourseModules);

module.exports = router;
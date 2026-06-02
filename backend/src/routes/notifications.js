const { Router } = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAll,
  seedNotifications,
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.get('/unread-count', authenticateToken, getUnreadCount);
router.patch('/:id/read', authenticateToken, markAsRead);
router.patch('/read-all', authenticateToken, markAllAsRead);
router.delete('/clear-all', authenticateToken, clearAll);
router.post('/seed', authenticateToken, seedNotifications);

module.exports = router;

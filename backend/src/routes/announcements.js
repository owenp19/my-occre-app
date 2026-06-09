const router = require('express').Router();
const announcementController = require('../controllers/announcementController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/active', announcementController.getActive);
router.get('/', authenticateToken, requireRole('admin'), announcementController.getAll);
router.post('/', authenticateToken, requireRole('admin'), announcementController.create);
router.put('/:id', authenticateToken, requireRole('admin'), announcementController.update);
router.delete('/:id', authenticateToken, requireRole('admin'), announcementController.remove);

module.exports = router;

const router = require('express').Router();
const deviceController = require('../controllers/deviceController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', authenticateToken, deviceController.registerToken);
router.post('/unregister', authenticateToken, deviceController.unregisterToken);
router.get('/my', authenticateToken, deviceController.getMyTokens);

module.exports = router;

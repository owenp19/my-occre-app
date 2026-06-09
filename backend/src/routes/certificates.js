const router = require('express').Router();
const certificateController = require('../controllers/certificateController');
const { authenticateToken } = require('../middleware/auth');

router.get('/generate/:trackingNumber', authenticateToken, certificateController.generateCertificate);
router.post('/validate-qr', certificateController.validateQR);

module.exports = router;

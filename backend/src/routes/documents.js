const { Router } = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { uploadDocument, downloadDocument, validateDocument, deleteDocument } = require('../controllers/documentController');
const upload = require('../middleware/upload');

const router = Router();

router.post('/upload', authenticateToken, upload.single('file'), uploadDocument);
router.get('/:id/download', authenticateToken, downloadDocument);
router.patch('/:id/validate', authenticateToken, requireRole('funcionario', 'admin'), validateDocument);
router.delete('/:id', authenticateToken, deleteDocument);

module.exports = router;

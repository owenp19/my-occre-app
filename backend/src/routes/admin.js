const { Router } = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getDashboardStats, getAuditLog, getReports, exportExcel, exportPdf, getFuncionarios,
} = require('../controllers/adminController');

const router = Router();

router.get('/dashboard', authenticateToken, requireRole('admin', 'funcionario'), getDashboardStats);
router.get('/audit-log', authenticateToken, requireRole('admin'), getAuditLog);
router.get('/reports', authenticateToken, requireRole('admin'), getReports);
router.get('/export/excel', authenticateToken, requireRole('admin'), exportExcel);
router.get('/export/pdf', authenticateToken, requireRole('admin'), exportPdf);
router.get('/funcionarios', authenticateToken, requireRole('admin'), getFuncionarios);

module.exports = router;

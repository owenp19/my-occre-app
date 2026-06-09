const { Router } = require('express');
const { body } = require('express-validator');
const {
  create, getMyRequests, getByTrackingNumber,
  updateStatus, assignRequest, getAllRequests, getMyAssignedRequests,
  searchRecord, getMyProcedures, getProcedureDetail,
} = require('../controllers/requestController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

const router = Router();

router.post('/', authenticateToken, [
  body('procedureTypeId').isInt().withMessage('Tipo de trámite obligatorio'),
  handleValidationErrors,
], create);

router.get('/my', authenticateToken, getMyRequests);
router.get('/assigned', authenticateToken, requireRole('funcionario', 'admin'), getMyAssignedRequests);
router.get('/all', authenticateToken, requireRole('funcionario', 'admin'), getAllRequests);
router.get('/tracking/:trackingNumber', authenticateToken, getByTrackingNumber);
router.post('/search-record', searchRecord);
router.get('/my-procedures', authenticateToken, getMyProcedures);
router.get('/my-procedures/:id', authenticateToken, getProcedureDetail);

router.patch('/:id/status', authenticateToken, requireRole('funcionario', 'admin'), [
  body('status').isIn(['borrador', 'pendiente', 'en_revision', 'devuelto', 'aprobado', 'rechazado', 'finalizado']),
  handleValidationErrors,
], updateStatus);

router.patch('/:id/assign', authenticateToken, requireRole('admin'), assignRequest);

module.exports = router;

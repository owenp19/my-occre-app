const { Router } = require('express');
const { body, query } = require('express-validator');
const {
  getServices,
  getOffices,
  getAvailability,
  create,
  getMyAppointments,
  getAppointmentByCode,
  cancel,
  getAllAppointments,
} = require('../controllers/appointmentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = Router();

router.get('/services', getServices);
router.get('/offices', getOffices);

router.get('/availability', [
  query('office_id').notEmpty().withMessage('office_id es obligatorio'),
  query('date').notEmpty().withMessage('date es obligatorio'),
  handleValidationErrors,
], getAvailability);

router.post('/', authenticateToken, upload.array('documents', 5), [
  body('service_id').notEmpty().withMessage('Servicio obligatorio'),
  body('office_id').notEmpty().withMessage('Oficina obligatoria'),
  body('scheduled_date').notEmpty().withMessage('Fecha obligatoria'),
  body('scheduled_time').notEmpty().withMessage('Hora obligatoria'),
  body('citizen_full_name').notEmpty().withMessage('Nombre completo obligatorio'),
  body('citizen_email').isEmail().withMessage('Correo inválido'),
  handleValidationErrors,
], create);

router.get('/my', authenticateToken, getMyAppointments);
router.get('/all', authenticateToken, requireRole('admin', 'funcionario'), getAllAppointments);
router.patch('/:id/cancel', authenticateToken, cancel);
router.get('/:code', authenticateToken, getAppointmentByCode);

module.exports = router;

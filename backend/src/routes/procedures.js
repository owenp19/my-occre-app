const { Router } = require('express');
const { body } = require('express-validator');
const { getAll, getBySlug, create, update, remove } = require('../controllers/procedureController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

const router = Router();

router.get('/', getAll);
router.get('/:slug', getBySlug);

router.post('/', authenticateToken, requireRole('admin'), [
  body('name').trim().notEmpty().withMessage('Nombre obligatorio'),
  body('slug').trim().notEmpty().withMessage('Slug obligatorio'),
  handleValidationErrors,
], create);

router.put('/:id', authenticateToken, requireRole('admin'), update);
router.delete('/:id', authenticateToken, requireRole('admin'), remove);

module.exports = router;

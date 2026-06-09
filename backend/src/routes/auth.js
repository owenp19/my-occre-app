const { Router } = require('express');
const { body } = require('express-validator');
const {
  register, login, getProfile, updateProfile, uploadPhoto,
  forgotPassword, resetPassword, listUsers, updateUserRoles,
  getBiometricPreference, setBiometricPreference,
} = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

const router = Router();

router.post('/register', [
  body('firstName').trim().isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Apellido debe tener al menos 2 caracteres'),
  body('email').isEmail().withMessage('Correo inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors,
], register);

router.post('/login', login);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Correo inválido'),
  handleValidationErrors,
], forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token requerido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors,
], resetPassword);

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/photo', authenticateToken, uploadPhoto);

router.get('/users', authenticateToken, requireRole('admin'), listUsers);
router.put('/users/:userId/roles', authenticateToken, requireRole('admin'), updateUserRoles);

router.get('/biometric-preference', authenticateToken, getBiometricPreference);
router.put('/biometric-preference', authenticateToken, setBiometricPreference);

module.exports = router;

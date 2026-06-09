const { Router } = require('express');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validate');
const {
  getTariff, quote, createTourismCard, initPayment, checkPaymentStatus,
  searchCard, getReceipt, verifyCard, verifyByQrToken, updateCardStatusExpired,
  shareLocation, paymentWebhook,
} = require('../controllers/tourismCardController');

const router = Router();

router.get('/tariff', getTariff);

router.post('/quote', quote);

router.post('/card', [
  body('first_name').trim().isLength({ min: 2 }),
  body('last_name').trim().isLength({ min: 2 }),
  body('document_type').notEmpty(),
  body('document_number').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('entry_date').notEmpty(),
  body('return_date').notEmpty(),
  body('accepted_terms').isBoolean(),
  handleValidationErrors,
], createTourismCard);

router.post('/card/:code/payment/init', initPayment);
router.get('/card/:code/payment/status', checkPaymentStatus);
router.get('/card/:code/receipt', getReceipt);
router.get('/card/:code/verify', verifyCard);
router.post('/card/:code/share-location', shareLocation);
router.get('/card/verify/qr/:qr_token', verifyByQrToken);

router.post('/search', searchCard);

router.post('/payment/webhook', paymentWebhook);

router.post('/expired/check', updateCardStatusExpired);

module.exports = router;

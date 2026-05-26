const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const {
  addSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
  getInsights
} = require('../controllers/subscriptionController');

// Validation rules
const subscriptionValidation = [
  body('name')
    .notEmpty().withMessage('Subscription name is required'),
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .custom(value => value > 0).withMessage('Amount must be greater than 0'),
  body('billing_cycle')
    .isIn(['monthly', 'yearly']).withMessage('Billing cycle must be monthly or yearly'),
  body('next_renewal')
    .isDate().withMessage('Please enter a valid renewal date')
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/', authMiddleware, subscriptionValidation, validate, addSubscription);
router.get('/', authMiddleware, getSubscriptions);
router.put('/:id', authMiddleware, subscriptionValidation, validate, updateSubscription);
router.delete('/:id', authMiddleware, deleteSubscription);
router.get('/insights', authMiddleware, getInsights);

module.exports = router;
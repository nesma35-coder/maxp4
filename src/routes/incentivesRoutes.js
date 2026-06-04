const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const permissions = require('../middleware/permissions');
const incentivesController = require('../controllers/incentivesController');

const router = express.Router();

// Validation middleware
const validateIncentive = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title too long'),
  body('amount').isNumeric().withMessage('Amount must be a number').custom(v => v >= 0).withMessage('Amount must be non-negative'),
  body('incentiveType').isIn(['salary_increase', 'bonus', 'commission', 'stock_options', 'benefits_upgrade', 'other']).withMessage('Invalid incentive type'),
  body('category').isIn(['performance', 'attendance', 'project_completion', 'sales_target', 'retention', 'other']).withMessage('Invalid category'),
  body('criteria').trim().notEmpty().withMessage('Criteria is required'),
  body('startDate').isISO8601().toDate().withMessage('Start Date must be a valid date'),
  body('endDate').isISO8601().toDate().withMessage('End Date must be a valid date')
];

// GET all incentives
router.get('/', auth, incentivesController.getAllIncentives);

// GET single incentive
router.get('/:id', auth, incentivesController.getIncentiveById);

// GET deleted incentives (admin/hr_manager only)
router.get('/deleted/list', auth, permissions('delete_incentives'), incentivesController.getDeletedIncentives);

// CREATE incentive
router.post('/', auth, permissions('create_incentives'), validateIncentive, incentivesController.createIncentive);

// UPDATE incentive
router.put('/:id', auth, permissions('edit_incentives'), validateIncentive, incentivesController.updateIncentive);

// SOFT DELETE incentive
router.delete('/:id', auth, permissions('delete_incentives'), incentivesController.deleteIncentive);

// PERMANENTLY DELETE incentive (admin only)
router.delete('/:id/permanent', auth, permissions('delete_incentives'), incentivesController.permanentlyDeleteIncentive);

// RESTORE deleted incentive
router.patch('/:id/restore', auth, permissions('delete_incentives'), incentivesController.restoreIncentive);

module.exports = router;

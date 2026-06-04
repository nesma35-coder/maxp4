const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const permissions = require('../middleware/permissions');
const rewardsController = require('../controllers/rewardsController');

const router = express.Router();

// Validation middleware
const validateReward = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title too long'),
  body('points').isNumeric().withMessage('Points must be a number').custom(v => v >= 0).withMessage('Points must be non-negative'),
  body('rewardType').isIn(['bonus', 'certificate', 'promotion', 'gift', 'other']).withMessage('Invalid reward type'),
  body('category').isIn(['performance', 'attendance', 'innovation', 'teamwork', 'safety']).withMessage('Invalid category'),
  body('validFrom').isISO8601().toDate().withMessage('Valid From must be a valid date'),
  body('validTo').isISO8601().toDate().withMessage('Valid To must be a valid date')
];

// GET all rewards
router.get('/', auth, rewardsController.getAllRewards);

// GET single reward
router.get('/:id', auth, rewardsController.getRewardById);

// GET deleted rewards (admin/hr_manager only)
router.get('/deleted/list', auth, permissions('delete_rewards'), rewardsController.getDeletedRewards);

// CREATE reward
router.post('/', auth, permissions('create_rewards'), validateReward, rewardsController.createReward);

// UPDATE reward
router.put('/:id', auth, permissions('edit_rewards'), validateReward, rewardsController.updateReward);

// SOFT DELETE reward
router.delete('/:id', auth, permissions('delete_rewards'), rewardsController.deleteReward);

// PERMANENTLY DELETE reward (admin only)
router.delete('/:id/permanent', auth, permissions('delete_rewards'), rewardsController.permanentlyDeleteReward);

// RESTORE deleted reward
router.patch('/:id/restore', auth, permissions('delete_rewards'), rewardsController.restoreReward);

module.exports = router;

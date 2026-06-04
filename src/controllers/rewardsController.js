const Reward = require('../models/Reward');
const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');

// Validate request
const validateRequest = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return { hasErrors: true, errors: errors.array() };
  }
  return { hasErrors: false };
};

// Log audit
const logAudit = async (action, entityId, userId, userName, changes = {}, reason = '') => {
  try {
    await AuditLog.create({
      action,
      entityType: 'reward',
      entityId,
      userId,
      userName,
      changes,
      reason,
      status: 'success'
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

// Get all rewards
exports.getAllRewards = async (req, res) => {
  try {
    const { status, category, sortBy = '-createdAt', page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    const rewards = await Reward.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email')
      .populate('modifiedBy', 'name email');

    const total = await Reward.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: rewards,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rewards',
      error: error.message
    });
  }
};

// Get single reward
exports.getRewardById = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('modifiedBy', 'name email')
      .populate('appliedTo.employeeId', 'name email employeeId');

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    res.status(200).json({
      success: true,
      data: reward
    });
  } catch (error) {
    console.error('Get reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reward',
      error: error.message
    });
  }
};

// Create reward
exports.createReward = async (req, res) => {
  try {
    const validation = validateRequest(req, res);
    if (validation.hasErrors) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.errors
      });
    }

    const { title, description, points, rewardType, category, budget, validFrom, validTo } = req.body;

    if (new Date(validFrom) >= new Date(validTo)) {
      return res.status(400).json({
        success: false,
        message: 'Valid From date must be before Valid To date'
      });
    }

    const reward = new Reward({
      title,
      description,
      points,
      rewardType,
      category,
      budget,
      validFrom,
      validTo,
      createdBy: req.user._id
    });

    await reward.save();
    await logAudit('create', reward._id, req.user._id, req.user.name);

    res.status(201).json({
      success: true,
      message: 'Reward created successfully',
      data: reward
    });
  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reward',
      error: error.message
    });
  }
};

// Update reward
exports.updateReward = async (req, res) => {
  try {
    const validation = validateRequest(req, res);
    if (validation.hasErrors) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.errors
      });
    }

    const reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    const beforeData = reward.toObject();
    const { title, description, points, status, rewardType, category, budget, validFrom, validTo } = req.body;

    if (validFrom && validTo && new Date(validFrom) >= new Date(validTo)) {
      return res.status(400).json({
        success: false,
        message: 'Valid From date must be before Valid To date'
      });
    }

    Object.assign(reward, {
      title: title || reward.title,
      description: description !== undefined ? description : reward.description,
      points: points !== undefined ? points : reward.points,
      status: status || reward.status,
      rewardType: rewardType || reward.rewardType,
      category: category || reward.category,
      budget: budget !== undefined ? budget : reward.budget,
      validFrom: validFrom || reward.validFrom,
      validTo: validTo || reward.validTo,
      modifiedBy: req.user._id,
      updatedAt: new Date()
    });

    await reward.save();
    await logAudit('update', reward._id, req.user._id, req.user.name, {
      before: beforeData,
      after: reward.toObject()
    });

    res.status(200).json({
      success: true,
      message: 'Reward updated successfully',
      data: reward
    });
  } catch (error) {
    console.error('Update reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reward',
      error: error.message
    });
  }
};

// Delete reward (Soft Delete)
exports.deleteReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'No reason provided' } = req.body;

    const reward = await Reward.findById(id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    if (reward.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Reward is already deleted'
      });
    }

    const beforeData = reward.toObject();
    await reward.softDelete(req.user._id, reason);
    
    await logAudit('delete', reward._id, req.user._id, req.user.name, {
      before: beforeData,
      after: reward.toObject()
    }, reason);

    res.status(200).json({
      success: true,
      message: 'Reward deleted successfully',
      data: reward
    });
  } catch (error) {
    console.error('Delete reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reward',
      error: error.message
    });
  }
};

// Permanently delete reward
exports.permanentlyDeleteReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'No reason provided' } = req.body;

    const reward = await Reward.findById(id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    const beforeData = reward.toObject();
    await Reward.permanentlyDelete(id);
    
    await logAudit('delete', id, req.user._id, req.user.name, {
      before: beforeData,
      after: null
    }, `Permanently deleted: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'Reward permanently deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Permanent delete reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting reward',
      error: error.message
    });
  }
};

// Restore deleted reward
exports.restoreReward = async (req, res) => {
  try {
    const { id } = req.params;

    const reward = await Reward.findById(id).setOptions({ includeDeleted: true });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    if (!reward.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Reward is not deleted'
      });
    }

    const beforeData = reward.toObject();
    await reward.restore();
    
    await logAudit('restore', reward._id, req.user._id, req.user.name, {
      before: beforeData,
      after: reward.toObject()
    });

    res.status(200).json({
      success: true,
      message: 'Reward restored successfully',
      data: reward
    });
  } catch (error) {
    console.error('Restore reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring reward',
      error: error.message
    });
  }
};

// Get deleted rewards
exports.getDeletedRewards = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const rewards = await Reward.find({ isDeleted: true })
      .setOptions({ includeDeleted: true })
      .sort('-deletedAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('deletedBy', 'name email')
      .populate('createdBy', 'name email');

    const total = await Reward.countDocuments({ isDeleted: true }).setOptions({ includeDeleted: true });

    res.status(200).json({
      success: true,
      data: rewards,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get deleted rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deleted rewards',
      error: error.message
    });
  }
};

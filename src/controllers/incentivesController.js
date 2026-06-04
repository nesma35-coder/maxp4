const Incentive = require('../models/Incentive');
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
      entityType: 'incentive',
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

// Get all incentives
exports.getAllIncentives = async (req, res) => {
  try {
    const { status, category, sortBy = '-createdAt', page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    const incentives = await Incentive.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email')
      .populate('modifiedBy', 'name email');

    const total = await Incentive.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: incentives,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get incentives error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching incentives',
      error: error.message
    });
  }
};

// Get single incentive
exports.getIncentiveById = async (req, res) => {
  try {
    const incentive = await Incentive.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('modifiedBy', 'name email')
      .populate('recipients.employeeId', 'name email employeeId');

    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Incentive not found'
      });
    }

    res.status(200).json({
      success: true,
      data: incentive
    });
  } catch (error) {
    console.error('Get incentive error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching incentive',
      error: error.message
    });
  }
};

// Create incentive
exports.createIncentive = async (req, res) => {
  try {
    const validation = validateRequest(req, res);
    if (validation.hasErrors) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.errors
      });
    }

    const { title, description, amount, incentiveType, category, criteria, currency, startDate, endDate, maxRecipients } = req.body;

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start Date must be before End Date'
      });
    }

    const incentive = new Incentive({
      title,
      description,
      amount,
      incentiveType,
      category,
      criteria,
      currency,
      startDate,
      endDate,
      maxRecipients,
      createdBy: req.user._id
    });

    await incentive.save();
    await logAudit('create', incentive._id, req.user._id, req.user.name);

    res.status(201).json({
      success: true,
      message: 'Incentive created successfully',
      data: incentive
    });
  } catch (error) {
    console.error('Create incentive error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating incentive',
      error: error.message
    });
  }
};

// Update incentive
exports.updateIncentive = async (req, res) => {
  try {
    const validation = validateRequest(req, res);
    if (validation.hasErrors) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.errors
      });
    }

    const incentive = await Incentive.findById(req.params.id);

    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Incentive not found'
      });
    }

    const beforeData = incentive.toObject();
    const { title, description, amount, status, incentiveType, category, criteria, currency, startDate, endDate, maxRecipients } = req.body;

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start Date must be before End Date'
      });
    }

    Object.assign(incentive, {
      title: title || incentive.title,
      description: description !== undefined ? description : incentive.description,
      amount: amount !== undefined ? amount : incentive.amount,
      status: status || incentive.status,
      incentiveType: incentiveType || incentive.incentiveType,
      category: category || incentive.category,
      criteria: criteria || incentive.criteria,
      currency: currency || incentive.currency,
      startDate: startDate || incentive.startDate,
      endDate: endDate || incentive.endDate,
      maxRecipients: maxRecipients !== undefined ? maxRecipients : incentive.maxRecipients,
      modifiedBy: req.user._id,
      updatedAt: new Date()
    });

    await incentive.save();
    await logAudit('update', incentive._id, req.user._id, req.user.name, {
      before: beforeData,
      after: incentive.toObject()
    });

    res.status(200).json({
      success: true,
      message: 'Incentive updated successfully',
      data: incentive
    });
  } catch (error) {
    console.error('Update incentive error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating incentive',
      error: error.message
    });
  }
};

// Delete incentive (Soft Delete)
exports.deleteIncentive = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'No reason provided' } = req.body;

    const incentive = await Incentive.findById(id);

    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Incentive not found'
      });
    }

    if (incentive.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Incentive is already deleted'
      });
    }

    const beforeData = incentive.toObject();
    await incentive.softDelete(req.user._id, reason);
    
    await logAudit('delete', incentive._id, req.user._id, req.user.name, {
      before: beforeData,
      after: incentive.toObject()
    }, reason);

    res.status(200).json({
      success: true,
      message: 'Incentive deleted successfully',
      data: incentive
    });
  } catch (error) {
    console.error('Delete incentive error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting incentive',
      error: error.message
    });
  }
};

// Permanently delete incentive
exports.permanentlyDeleteIncentive = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'No reason provided' } = req.body;

    const incentive = await Incentive.findById(id);

    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Incentive not found'
      });
    }

    const beforeData = incentive.toObject();
    await Incentive.permanentlyDelete(id);
    
    await logAudit('delete', id, req.user._id, req.user.name, {
      before: beforeData,
      after: null
    }, `Permanently deleted: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'Incentive permanently deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Permanent delete incentive error:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting incentive',
      error: error.message
    });
  }
};

// Restore deleted incentive
exports.restoreIncentive = async (req, res) => {
  try {
    const { id } = req.params;

    const incentive = await Incentive.findById(id).setOptions({ includeDeleted: true });

    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Incentive not found'
      });
    }

    if (!incentive.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Incentive is not deleted'
      });
    }

    const beforeData = incentive.toObject();
    await incentive.restore();
    
    await logAudit('restore', incentive._id, req.user._id, req.user.name, {
      before: beforeData,
      after: incentive.toObject()
    });

    res.status(200).json({
      success: true,
      message: 'Incentive restored successfully',
      data: incentive
    });
  } catch (error) {
    console.error('Restore incentive error:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring incentive',
      error: error.message
    });
  }
};

// Get deleted incentives
exports.getDeletedIncentives = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const incentives = await Incentive.find({ isDeleted: true })
      .setOptions({ includeDeleted: true })
      .sort('-deletedAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('deletedBy', 'name email')
      .populate('createdBy', 'name email');

    const total = await Incentive.countDocuments({ isDeleted: true }).setOptions({ includeDeleted: true });

    res.status(200).json({
      success: true,
      data: incentives,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get deleted incentives error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deleted incentives',
      error: error.message
    });
  }
};

const mongoose = require('mongoose');

const incentiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Incentive title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be non-negative']
  },
  incentiveType: {
    type: String,
    enum: ['salary_increase', 'bonus', 'commission', 'stock_options', 'benefits_upgrade', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['performance', 'attendance', 'project_completion', 'sales_target', 'retention', 'other'],
    required: true
  },
  criteria: {
    type: String,
    required: true,
    maxlength: [300, 'Criteria cannot exceed 300 characters']
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP'],
    default: 'USD'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  maxRecipients: {
    type: Number,
    default: null
  },
  currentRecipients: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  recipients: [{
    employeeId: mongoose.Schema.Types.ObjectId,
    awardDate: Date,
    status: {
      type: String,
      enum: ['eligible', 'awarded', 'pending', 'rejected'],
      default: 'eligible'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deleteReason: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for soft delete queries
incentiveSchema.index({ isDeleted: 1, createdAt: -1 });

// Query middleware to exclude deleted records
incentiveSchema.pre(/^find/, function(next) {
  if (this.options.includeDeleted !== true) {
    this.where({ isDeleted: false });
  }
  next();
});

// Method to perform soft delete
incentiveSchema.methods.softDelete = async function(deletedBy, reason = '') {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.deleteReason = reason;
  return await this.save();
};

// Method to restore deleted record
incentiveSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  this.deleteReason = '';
  return await this.save();
};

// Static method to permanently delete
incentiveSchema.statics.permanentlyDelete = async function(id, session = null) {
  const options = session ? { session } : {};
  return await this.findByIdAndDelete(id, options);
};

module.exports = mongoose.model('Incentive', incentiveSchema);

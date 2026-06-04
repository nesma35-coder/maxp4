const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Reward title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  points: {
    type: Number,
    required: [true, 'Points value is required'],
    min: [0, 'Points must be non-negative']
  },
  rewardType: {
    type: String,
    enum: ['bonus', 'certificate', 'promotion', 'gift', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['performance', 'attendance', 'innovation', 'teamwork', 'safety'],
    required: true
  },
  budget: {
    type: Number,
    default: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  appliedTo: [{
    employeeId: mongoose.Schema.Types.ObjectId,
    appliedDate: Date,
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
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
rewardSchema.index({ isDeleted: 1, createdAt: -1 });

// Query middleware to exclude deleted records
rewardSchema.pre(/^find/, function(next) {
  if (this.options.includeDeleted !== true) {
    this.where({ isDeleted: false });
  }
  next();
});

// Method to perform soft delete
rewardSchema.methods.softDelete = async function(deletedBy, reason = '') {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.deleteReason = reason;
  return await this.save();
};

// Method to restore deleted record
rewardSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  this.deleteReason = '';
  return await this.save();
};

// Static method to permanently delete
rewardSchema.statics.permanentlyDelete = async function(id, session = null) {
  const options = session ? { session } : {};
  return await this.findByIdAndDelete(id, options);
};

// Static method to get deleted records
rewardSchema.statics.findDeleted = function() {
  return this.find({ isDeleted: true });
};

module.exports = mongoose.model('Reward', rewardSchema);

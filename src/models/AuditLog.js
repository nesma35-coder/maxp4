const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'restore', 'view'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['reward', 'incentive', 'employee', 'user'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityName: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: String,
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  reason: String,
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 2592000
  }
});

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entityId: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

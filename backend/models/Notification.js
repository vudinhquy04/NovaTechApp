const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['promotion', 'product', 'order', 'system'],
    required: true
  },
  image: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['khuyenmai', 'sanpham', 'donhang', 'heThong'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  actionUrl: {
    type: String,
    default: null
  },
  actionType: {
    type: String,
    enum: ['product', 'category', 'order', 'external'],
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better performance
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

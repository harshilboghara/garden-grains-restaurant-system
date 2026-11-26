const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: false
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['Food Quality', 'Service', 'Ambiance', 'Online Order', 'Other', 'general'],
    default: 'general'
  },
  type: {
    type: String,
    enum: ['menu', 'order', 'restaurant'],
    default: 'menu'
  }
}, {
  timestamps: true
});

// Prevent duplicate ratings
// Non-unique indexes for performance
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ menuItem: 1 });
feedbackSchema.index({ order: 1 });
feedbackSchema.index({ type: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);




const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Completed'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

assignmentSchema.index({ createdBy: 1, status: 1 });
assignmentSchema.index({ status: 1, dueDate: 1 });

assignmentSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'Completed';
});

assignmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Assignment', assignmentSchema);

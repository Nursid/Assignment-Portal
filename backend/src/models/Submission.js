const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewed: {
    type: Boolean,
    default: false
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

submissionSchema.index({ assignmentId: 1, submittedAt: -1 });
submissionSchema.index({ studentId: 1, submittedAt: -1 });

submissionSchema.virtual('isLate', {
  ref: 'Assignment',
  localField: 'assignmentId',
  foreignField: '_id',
  justOne: true
});

submissionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Submission', submissionSchema);

const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  // Student who made the purchase
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  // Course that was purchased
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  // Amount paid for the course
  amount: {
    type: Number,
    required: [true, 'Purchase amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  // Payment method used
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Stripe', 'PayPal', 'Razorpay', 'Free', 'Other'],
      message: '{VALUE} is not a valid payment method'
    },
    default: 'Credit Card'
  },
  // Transaction status
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed', 'refunded'],
      message: '{VALUE} is not a valid status'
    },
    default: 'completed'
  },
  // Optional: Transaction ID from payment gateway
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  // Optional: Currency
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  // Optional: Refund details
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  },
  refundDate: {
    type: Date
  },
  refundReason: {
    type: String
  },
  // Optional: Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Indexes for faster queries
purchaseSchema.index({ student: 1, course: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ createdAt: -1 });
purchaseSchema.index({ student: 1, status: 1 });

// Compound index to prevent duplicate purchases (one purchase per student per course)
purchaseSchema.index({ student: 1, course: 1, status: 1 }, { 
  unique: true,
  partialFilterExpression: { status: 'completed' }
});

// Virtual for checking if purchase is refundable (within 30 days)
purchaseSchema.virtual('isRefundable').get(function() {
  if (this.status !== 'completed') return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.createdAt > thirtyDaysAgo;
});

// Instance method to process refund
purchaseSchema.methods.processRefund = async function(refundAmount, reason) {
  if (this.status !== 'completed') {
    throw new Error('Only completed purchases can be refunded');
  }
  
  this.status = 'refunded';
  this.refundAmount = refundAmount || this.amount;
  this.refundDate = new Date();
  this.refundReason = reason || 'Customer request';
  
  return await this.save();
};

// Static method to get total revenue
purchaseSchema.statics.getTotalRevenue = async function(filters = {}) {
  const pipeline = [
    { $match: { status: 'completed', ...filters } },
    { 
      $group: { 
        _id: null, 
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 }
      } 
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || { totalRevenue: 0, totalTransactions: 0 };
};

// Static method to get revenue by course
purchaseSchema.statics.getRevenueByCourse = async function() {
  const pipeline = [
    { $match: { status: 'completed' } },
    { 
      $group: { 
        _id: '$course', 
        totalRevenue: { $sum: '$amount' },
        totalSales: { $sum: 1 }
      } 
    },
    { 
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'courseDetails'
      }
    },
    { $unwind: '$courseDetails' },
    { 
      $project: {
        courseId: '$_id',
        courseName: '$courseDetails.title',
        category: '$courseDetails.category',
        totalRevenue: 1,
        totalSales: 1
      }
    },
    { $sort: { totalRevenue: -1 } }
  ];
  
  return await this.aggregate(pipeline);
};

// Static method to get student's purchase history
purchaseSchema.statics.getStudentPurchases = async function(studentId) {
  return await this.find({ student: studentId })
    .populate('course', 'title thumbnail category price instructor')
    .sort({ createdAt: -1 });
};

// Pre-save hook to validate refund amount
purchaseSchema.pre('save', function(next) {
  if (this.status === 'refunded' && this.refundAmount > this.amount) {
    next(new Error('Refund amount cannot exceed purchase amount'));
  }
  next();
});

// Pre-save hook to set transaction ID if not provided
purchaseSchema.pre('save', function(next) {
  if (!this.transactionId && this.isNew) {
    this.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);

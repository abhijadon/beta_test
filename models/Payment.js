// models/payment.js

const mongoose = require('mongoose');
const PaymentHistory = require('./PaymentHIstory');
const paymentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application' 
    },
     userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    removed: {
      type: Boolean,
      default: false,
    },
    lead_id: {
      type: String,
      default: 0,
    },
    student_name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: Number,
      trim: true,
    },
   
    institute_name: {
      type: String,
      trim: true,
    },
    university_name: {
      type: String,
      trim: true,
    },
      session: {
      type: String,
      trim: true,
    },
    payment_type: {
      type: String,
      trim: true,
    },
    total_course_fee: { 
      type: Number,
      required: true,
      default: 0,
    },
    total_paid_amount: {
      type: Number,
      required: true,
    },
    paid_amount: {
      type: Number,
      default: 0,
    },
    payment_mode: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
    },
    updated: {
      type: Date,
      default: Date.now,
    },
    created: {
      type: Date,
      default: Date.now,
    },
     updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
   previousPaidAmounts: [{
      value: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    previousInstallmentTypes: [{
      value: {
        type: String,
        trim: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }]
    },
);

// Middleware for tracking changes and creating history
paymentSchema.post('findOneAndUpdate', async function (doc) {
  try {
    const paymentId = doc._id;
    const originalDoc = await this.model.findOne({ _id: paymentId }).lean();

    const updatedFields = {};
    for (const key of Object.keys(originalDoc)) {
      if (JSON.stringify(originalDoc[key]) !== JSON.stringify(doc[key])) {
        updatedFields[key] = {
          oldValue: originalDoc[key],
          newValue: doc[key]  
        };
      }
    }

    if (Object.keys(updatedFields).length > 0) {
      await PaymentHistory.create({
        paymentId,
        updatedFields,
        updatedBy: originalDoc.updatedBy // Use updatedBy from the original document
      });
    }
  } catch (error) {
    console.error('Error creating payment history:', error);
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Payment };

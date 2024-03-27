const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const { Payment } = require('./Payment');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
   updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },

  lead_id: {
    type: String,
    trim: true,
  },

  full_name: {
    type: String,
    trim: true,
  },
 
  contact: {
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: Number,
    trim: true,
  },
  alternate_phone: {
    type: Number,
    trim: true,
  },
},
  education: {
    course: {
      type: String,
      trim: true,
    },
    institute: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
  },

  customfields: {
    institute_name: {
      type: String,
      trim: true,
    },
    university_name: {
      type: String,
      trim: true,
    },
    send_fee_receipt: {
      type: String,
      trim: true,
      default: 'no',
    },
    father_name: {
      type: String,
      trim: true,
    },
    mother_name: {
      type: String,
      trim: true,
    },
    session: {
      type: String,
      trim: true,
    },
    admission_type: {
      type: String,
      trim: true,
      default: 'Fresher',
    },
    enter_specialization: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
      trim: true,
    },
    remark: {
      type: String,
      default: null,
      trim: true,
    },

    gender: {
      type: String,
      trim: true,
    },

    installment_type: {
      type: String,
      trim: true,
      default: '1st installmenttype/New',
    },

    payment_mode: {
      type: String,
      trim: true,
    },
    payment_type: {
      type: String,
      trim: true,
    },
    total_course_fee: {
      type: String,
      trim: true,
    },
    // Payment details that need to be saved in the Payment table
    total_paid_amount: {
      type: Number,
      default: 0,
    },
    paid_amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      trim: true,
      default: 'New',
    },
    lms: {
      type: String,
      trim: true,
      default: 'N/A',
    },
  },  
     
 previousPaidAmounts: {
    type: [
      {
        value: Number,
        date: Date,
        _id: mongoose.Schema.Types.ObjectId,
      }
    ],
    default: [],
  },

  previousInstallmentType: {
   type: [
      {
        value: String,
        date: Date,
        _id: mongoose.Schema.Types.ObjectId,
      }
    ],
    default: [],
  },

  previousstatus: {
  type: [
      {
        value: String,
        date: Date,
        _id: mongoose.Schema.Types.ObjectId,
      }
    ],
    default: [],
  },

  created: {
    type: Date,
    default: Date.now,
  },
});


applicationSchema.post('findOneAndUpdate', async function (doc) {
  try {
    const applicationId = doc._id;

    await Payment.findOneAndUpdate(
      { applicationId },
      {
        $set: {
          applicationId,
          userId: doc.userId,
          payment_type: doc.customfields['payment_type'],
          total_course_fee: doc.customfields['total_course_fee'],
          total_paid_amount: doc.customfields['total_paid_amount'],
          paid_amount: doc.customfields['paid_amount'],
          university_name: doc.customfields['university_name'],
          institute_name: doc.customfields['institute_name'],
                   session: doc.customfields['session'],
          payment_mode: doc.customfields['payment_mode'],
          status: doc.customfields['status'],
          email: doc.contact['email'],
          phone: doc.contact['phone'],
          student_name: doc.full_name,
          created: doc.created,
          updatedBy: doc.updatedBy,
       previousPaidAmounts: doc.previousPaidAmounts,
       previousInstallmentType: doc.previousInstallmentType,
       previousstatus: doc.previousstatus,
          // ... other fields you want to update in the Payment record
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating Payment record:', error);
  }
});
// for update according application to payment

// Pre-save hook for adding new data
applicationSchema.pre('save', async function (next) {
  try {
    const applicationId = this._id; // Get the ID of the Application
    // Check if the document is new or being updated
    if (!this.isNew) {
      // If the document is being updated, trigger the next middleware in the stack
      return next();
    }

    // Create a new Payment record based on the Application ID
    await Payment.create({
      applicationId,
      userId: this.userId,
      lead_id: this.lead_id,
      student_name: this.full_name,
      email: this.contact['email'],
      phone: this.contact['phone'],
        session: this.customfields['session'],
      status: this.customfields['status'],
      payment_type: this.customfields['payment_type'],
      total_course_fee: this.customfields['total_course_fee'],
      total_paid_amount: this.customfields['total_paid_amount'],
      paid_amount: this.customfields['paid_amount'],
      payment_mode: this.customfields['payment_mode'],
      university_name: this.customfields['university_name'],
      institute_name: this.customfields['institute_name'],
      created: this.created,
       updatedBy: this.updatedBy,
       previousPaidAmounts: this.previousPaidAmounts,
       previousInstallmentType: this.previousInstallmentType,
       previousstatus: this.previousstatus,
           // ... other fields you want to set in the Payment record
    });

    // Trigger the next middleware in the stack
    return next();
  } catch (error) {
    console.error('Error creating Payment record:', error);
    return next(error);
  }
});
// Post-save hook for updating existing data
applicationSchema.post('save', async function (doc) {
  try {
    const applicationId = doc._id; // Get the ID of the Application

    // Update existing Payment record based on the Application ID
    await Payment.findOneAndUpdate(
      { applicationId },
      {
        $set: {
          applicationId,
          userId: doc.userId,
          lead_id: doc.lead_id,
          student_name: doc.full_name,
          email: doc.contact['email'],
          phone: doc.contact['phone'],
          payment_type: doc.customfields['payment_type'],
          session: doc.customfields['session'],
          total_course_fee: doc.customfields['total_course_fee'],
          total_paid_amount: doc.customfields['total_paid_amount'],
          payment_mode: doc.customfields['payment_mode'],
          paid_amount: doc.customfields['paid_amount'],
          status: doc.customfields['status'],
         created: doc.created,
          updatedBy: doc.updatedBy,
          previousPaidAmounts: doc.previousPaidAmounts,
       previousInstallmentType: doc.previousInstallmentType,
       previousstatus: doc.previousstatus,
          // ... other fields you want to update in the Payment record
        },
      },
      { upsert: true } // Create the Payment record if it doesn't exist
    );
  } catch (error) {
    console.error('Error updating Payment record:', error);
  }
});


const Applications = mongoose.model('Applications', applicationSchema);

module.exports = { Applications };
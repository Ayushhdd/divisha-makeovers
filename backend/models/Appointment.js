import mongoose from 'mongoose';

const appointmentServiceSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    customServiceName: { type: String, trim: true },
    customServicePrice: { type: Number, min: 0 },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1, max: 100, validate: Number.isInteger },
    duration: { type: Number, default: 60 },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    services: [appointmentServiceSchema],
    customServiceRequest: { type: String, trim: true, default: '' },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    venue: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: '' },
    totalAmount: { type: Number, required: true, min: 0 },
    advancePaid: { type: Number, default: 0, min: 0 },
    remainingBalance: { type: Number, default: 0, min: 0 },
    paymentOption: {
      type: String,
      enum: ['pay_now', 'pay_later'],
      required: true,
    },
    paymentScreenshot: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'pending_approval',
        'confirmed',
        'rejected',
        'payment_rejected',
        'completed',
        'cancelled',
      ],
      default: 'pending_payment',
    },
    bookingReference: { type: String, unique: true },
    adminNotes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

appointmentSchema.index({ customer: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;

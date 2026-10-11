import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema(
  {
    upiId: { type: String, trim: true, default: '' },
    upiIntentEnabled: { type: Boolean, default: false },
    merchantCategoryCode: { type: String, trim: true, default: '' },
    qrCode: { type: String, default: '' },
    paymentInstructions: {
      type: String,
      trim: true,
      default: 'Scan the QR code or pay via UPI and upload the payment screenshot.',
    },
    businessName: { type: String, default: 'Divisha Makeovers' },
    businessPhone: { type: String, default: '' },
    businessEmail: { type: String, default: '' },
    reminderHoursBefore: { type: Number, default: 24 },
  },
  { timestamps: true }
);

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;

import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import { notifyAdmin, notifyCustomer } from '../utils/notifications.js';
import { compressImage, getFileUrl } from '../middleware/upload.js';

const withScreenshotUrl = (payment, req) => {
  const result = payment.toObject ? payment.toObject() : payment;
  return {
    ...result,
    screenshotUrl: result.screenshot ? getFileUrl(result.screenshot, req) : '',
  };
};

export const getMyPayments = async (req, res) => {
  const payments = await Payment.find({ customer: req.user._id })
    .populate('appointment', 'bookingReference appointmentDate totalAmount remainingBalance status')
    .sort({ createdAt: -1 });
  res.json(payments.map((payment) => withScreenshotUrl(payment, req)));
};

export const getAllPayments = async (req, res) => {
  const payments = await Payment.find()
    .populate('customer', 'fullName email mobile')
    .populate('appointment', 'bookingReference totalAmount remainingBalance paymentOption status')
    .sort({ createdAt: -1 });
  res.json(payments.map((payment) => withScreenshotUrl(payment, req)));
};

export const verifyPayment = async (req, res) => {
  const newStatus = req.body.status;
  const verificationNote = String(req.body.verificationNote || '').trim().slice(0, 500);
  if (!['verified', 'rejected'].includes(newStatus)) {
    return res.status(400).json({ message: 'Payment status must be verified or rejected' });
  }
  if (newStatus === 'rejected' && !verificationNote) {
    return res.status(400).json({ message: 'Add a reason before rejecting a payment' });
  }

  // A pending-only update prevents two quick clicks from approving the same
  // screenshot twice and adding the advance amount twice.
  const payment = await Payment.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' },
    {
      $set: {
        status: newStatus,
        verificationNote,
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
      },
    },
    { new: true }
  ).populate('appointment');

  if (!payment) {
    const existing = await Payment.findById(req.params.id).select('status');
    if (!existing) return res.status(404).json({ message: 'Payment not found' });
    return res.status(400).json({ message: 'This payment has already been reviewed' });
  }
  if (!payment.appointment) {
    return res.status(409).json({ message: 'This payment is not linked to a booking' });
  }


  // Update appointment status based on payment verification
  if (newStatus === 'verified') {
    payment.appointment.advancePaid = Math.min(
      payment.appointment.totalAmount,
      payment.appointment.advancePaid + payment.amount
    );
    payment.appointment.remainingBalance = Math.max(
      0,
      payment.appointment.totalAmount - payment.appointment.advancePaid
    );
    payment.appointment.status = 'confirmed';
    await payment.appointment.save();

    // A notification failure must not turn a successful payment approval into
    // an error for the owner after the payment and booking have been saved.
    void notifyCustomer({
      customerId: payment.customer,
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `Your payment of ₹${payment.amount} has been verified. Your booking ${payment.appointment.bookingReference} is now confirmed.`,
      relatedId: payment._id,
      relatedModel: 'Payment',
    }).catch((error) => console.error('Could not create payment confirmation notification:', error));
  } else if (newStatus === 'rejected') {
    payment.appointment.status = 'payment_rejected';
    await payment.appointment.save();

    void notifyCustomer({
      customerId: payment.customer,
      type: 'payment_rejected',
      title: 'Payment Rejected',
      message: `Your payment of ₹${payment.amount} was not verified. Please upload a valid payment screenshot.`,
      relatedId: payment._id,
      relatedModel: 'Payment',
    }).catch((error) => console.error('Could not create payment rejection notification:', error));
  }

  res.json(payment);
};

export const addPayment = async (req, res) => {
  const { appointmentId, amount, method, transactionRef } = req.body;
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
  if (appointment.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (['completed', 'cancelled', 'rejected'].includes(appointment.status)) {
    return res.status(400).json({ message: 'This booking cannot accept another payment' });
  }

  const payAmount = parseFloat(amount);
  if (!Number.isFinite(payAmount) || payAmount < 1 || payAmount > appointment.remainingBalance) {
    return res.status(400).json({ message: 'Invalid payment amount' });
  }

  let screenshot = '';
  if (req.file) {
    await compressImage(req.file.path);
    screenshot = req.file.filename;
  }

  if (!screenshot) {
    return res.status(400).json({ message: 'Upload the payment screenshot before submitting it for verification' });
  }

  const pendingPayment = await Payment.exists({ appointment: appointment._id, status: 'pending' });
  if (pendingPayment) {
    return res.status(409).json({ message: 'A payment screenshot for this booking is already awaiting verification' });
  }

  const payment = await Payment.create({
    appointment: appointmentId,
    customer: req.user._id,
    amount: payAmount,
    type: payAmount >= appointment.remainingBalance ? 'balance' : 'advance',
    method: method || (screenshot ? 'screenshot' : 'upi'),
    screenshot,
    transactionRef: String(transactionRef || '').replace(/\s/g, '').trim(),
    status: 'pending',
  });

  appointment.status = 'pending_approval';
  await appointment.save();

  await notifyAdmin({
    type: 'advance_payment',
    title: 'Payment Received',
    message: `₹${payAmount} payment for ${appointment.bookingReference}`,
    relatedId: appointment._id,
    relatedModel: 'Appointment',
  });

  res.status(201).json(payment);
};

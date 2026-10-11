import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import AdminSettings from '../models/AdminSettings.js';
import { compressImage, getFileUrl } from '../middleware/upload.js';

export const getDashboardStats = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalCustomers,
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    revenueData,
    advanceData,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Appointment.countDocuments(),
    Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['confirmed', 'pending_approval', 'pending_payment'] },
    }),
    Appointment.countDocuments({ status: { $in: ['pending_approval', 'pending_payment'] } }),
    Appointment.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Appointment.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed', 'pending_approval', 'pending_payment'] } } },
      { $group: { _id: null, total: { $sum: '$advancePaid' } } },
    ]),
  ]);

  const remainingData = await Appointment.aggregate([
    { $match: { status: { $in: ['confirmed', 'pending_approval', 'pending_payment'] } } },
    { $group: { _id: null, total: { $sum: '$remainingBalance' } } },
  ]);

  res.json({
    totalCustomers,
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    revenue: revenueData[0]?.total || 0,
    advanceRevenue: advanceData[0]?.total || 0,
    remainingPayments: remainingData[0]?.total || 0,
  });
};

export const getCustomers = async (req, res) => {
  const customers = await User.find({ role: 'customer' })
    .select('-password')
    .sort({ createdAt: -1 });
  res.json(customers);
};

export const getCustomerHistory = async (req, res) => {
  const customer = await User.findById(req.params.id).select('-password');
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  const appointments = await Appointment.find({ customer: customer._id })
    .populate('services.service', 'name category')
    .sort({ appointmentDate: -1 });

  const payments = await Payment.find({ customer: customer._id }).sort({ createdAt: -1 });

  const totalSpent = appointments
    .filter((a) => ['confirmed', 'completed'].includes(a.status))
    .reduce((sum, a) => sum + a.totalAmount, 0);

  const totalAdvance = payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const remainingBalance = appointments
    .filter((a) => ['confirmed', 'pending_approval', 'pending_payment'].includes(a.status))
    .reduce((sum, a) => sum + a.remainingBalance, 0);

  res.json({
    customer,
    appointments,
    payments,
    stats: {
      totalSpent,
      totalAdvance,
      remainingBalance,
      totalBookings: appointments.length,
    },
  });
};

export const getSettings = async (req, res) => {
  let settings = await AdminSettings.findOne();
  if (!settings) {
    settings = await AdminSettings.create({});
  }
  if (settings.qrCode) {
    settings = settings.toObject();
    settings.qrCodeUrl = getFileUrl(settings.qrCode, req);
  }
  res.json(settings);
};

export const updateSettings = async (req, res) => {
  let settings = await AdminSettings.findOne();
  if (!settings) settings = await AdminSettings.create({});

  const { upiId, paymentInstructions, businessName, businessPhone, businessEmail, reminderHoursBefore } = req.body;

  const merchantCategoryCode = req.body.merchantCategoryCode === undefined
    ? settings.merchantCategoryCode : String(req.body.merchantCategoryCode).trim();
  if (merchantCategoryCode && !/^\d{4}$/.test(merchantCategoryCode)) {
    return res.status(400).json({ message: 'Enter the 4-digit merchant category code issued by your provider' });
  }
  const upiChanged = upiId !== undefined && String(upiId).trim() !== settings.upiId;
  const intentFlag = req.body.upiIntentEnabled;
  if (intentFlag !== undefined && ![true, false, 'true', 'false'].includes(intentFlag)) {
    return res.status(400).json({ message: 'Invalid merchant checkout setting' });
  }
  const upiIntentEnabled = intentFlag === undefined ? (upiChanged ? false : settings.upiIntentEnabled)
    : intentFlag === true || intentFlag === 'true';
  const nextUpiId = String(upiId ?? settings.upiId).trim();
  if (upiIntentEnabled && (!/^[\w.-]+@[\w.-]+$/.test(nextUpiId) || !/^\d{4}$/.test(merchantCategoryCode) || merchantCategoryCode === '0000')) {
    return res.status(400).json({ message: 'Merchant checkout needs your verified merchant UPI ID and its assigned non-zero 4-digit category code. Manual UPI payments remain available.' });
  }
  settings.upiIntentEnabled = upiIntentEnabled;
  settings.merchantCategoryCode = merchantCategoryCode || '';

  if (upiId !== undefined) settings.upiId = upiId;
  if (paymentInstructions !== undefined) settings.paymentInstructions = paymentInstructions;
  if (businessName !== undefined) settings.businessName = businessName;
  if (businessPhone !== undefined) settings.businessPhone = businessPhone;
  if (businessEmail !== undefined) settings.businessEmail = businessEmail;
  if (reminderHoursBefore !== undefined) settings.reminderHoursBefore = reminderHoursBefore;

  if (req.file) {
    await compressImage(req.file.path);
    settings.qrCode = req.file.filename;
  }

  await settings.save();
  const result = settings.toObject();
  if (result.qrCode) result.qrCodeUrl = getFileUrl(result.qrCode, req);
  res.json(result);
};

export const getPublicSettings = async (req, res) => {
  let settings = await AdminSettings.findOne();
  if (!settings) settings = await AdminSettings.create({});
  res.json({
    upiId: settings.upiId,
    upiIntentEnabled: settings.upiIntentEnabled,
    merchantCategoryCode: settings.merchantCategoryCode,
    paymentInstructions: settings.paymentInstructions,
    businessName: settings.businessName,
    qrCodeUrl: settings.qrCode ? getFileUrl(settings.qrCode, req) : '',
  });
};

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
};

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true }
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json({ message: 'Marked as read' });
};

export const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ message: 'All marked as read' });
};

export const getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });
  res.json({ count });
};

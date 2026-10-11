import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import Payment from '../models/Payment.js';
import { generateBookingRef } from '../utils/tokens.js';
import { notifyAdmin, notifyCustomer } from '../utils/notifications.js';
import { sendBookingConfirmation } from '../utils/email.js';
import { compressImage, getFileUrl } from '../middleware/upload.js';
import User from '../models/User.js';
import { getLocalServiceById, isLocalServiceCatalogEnabled } from '../data/serviceCatalog.js';

const cleanText = (value, maxLength = 500) =>
  String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);

const populateAppointment = (query) =>
  query
    .populate('customer', 'fullName email mobile address')
    .populate('services.service', 'name category price duration');

const parseJsonField = (value, fallback = []) => {
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const normalizeCustomServices = (customServices) => {
  const normalized = [];
  let hasPartial = false;

  for (const service of customServices || []) {
    const name = cleanText(service?.name, 120);
    const rawPrice = String(service?.price ?? '').trim();
    const price = parseFloat(rawPrice);
    const duration = parseInt(service?.duration, 10) || 60;
    const quantity = Number(service?.quantity ?? 1);

    if (!name && !rawPrice) continue;

    if (!name || !Number.isFinite(price) || price <= 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      hasPartial = true;
      continue;
    }

    normalized.push({
      name,
      price,
      duration: Math.max(duration, 15),
      quantity,
    });
  }

  return { normalized, hasPartial };
};

const parseAppointmentDate = (value) => {
  const dateText = cleanText(value, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return null;

  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  return date;
};

export const createBooking = async (req, res) => {
  const serviceIds = parseJsonField(req.body.serviceIds, []);
  const customServices = parseJsonField(req.body.customServices, []);
  const serviceQuantities = parseJsonField(req.body.serviceQuantities, {});
  if (!Array.isArray(serviceIds) || !Array.isArray(customServices) ||
      !serviceQuantities || typeof serviceQuantities !== 'object' || Array.isArray(serviceQuantities)) {
    return res.status(400).json({ message: 'Invalid service selection or quantities' });
  }
  const {
    customServiceRequest,
    appointmentDate,
    appointmentTime,
    venue,
    notes,
    advanceAmount,
    paymentOption,
  } = req.body;
  const customServiceRequestText = cleanText(customServiceRequest, 800);
  const appointmentDateValue = parseAppointmentDate(appointmentDate);
  const appointmentTimeText = cleanText(appointmentTime, 10);
  const venueText = cleanText(venue, 300);
  const notesText = cleanText(notes, 1000);
  const paymentOptionValue = cleanText(paymentOption, 20);
  const selectedServiceIds = Array.isArray(serviceIds) ? serviceIds.filter(Boolean) : [];
  if (new Set(selectedServiceIds).size !== selectedServiceIds.length ||
      Object.keys(serviceQuantities).some(id => !selectedServiceIds.includes(id))) {
    return res.status(400).json({ message: 'Select each service once and set its quantity' });
  }
  const quantities = new Map(selectedServiceIds.map(id => [String(id), Number(serviceQuantities[id] ?? 1)]));
  if ([...quantities.values()].some(quantity => !Number.isInteger(quantity) || quantity < 1 || quantity > 100)) {
    return res.status(400).json({ message: 'Service quantities must be whole numbers from 1 to 100' });
  }
  const { normalized: normalizedCustomServices, hasPartial } =
    normalizeCustomServices(customServices);

  if (!appointmentDateValue || !appointmentTimeText || !venueText) {
    return res.status(400).json({ message: 'Please fill appointment date, time and venue' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDateValue < today) {
    return res.status(400).json({ message: 'Please choose today or a future appointment date' });
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(appointmentTimeText)) {
    return res.status(400).json({ message: 'Please enter a valid appointment time' });
  }

  if (!['pay_now', 'pay_later'].includes(paymentOptionValue)) {
    return res.status(400).json({ message: 'Please choose a valid payment option' });
  }

  if (selectedServiceIds.some((id) => !/^[a-f\d]{24}$/i.test(String(id)))) {
    return res.status(400).json({ message: 'Invalid service selected' });
  }

  if (hasPartial) {
    return res.status(400).json({
      message: 'Please complete custom service name, price and a quantity from 1 to 100, or remove the incomplete row',
    });
  }

  const services = [];
  let totalAmount = 0;

  if (selectedServiceIds.length) {
    const localCatalogEnabled = isLocalServiceCatalogEnabled();
    const localServices = localCatalogEnabled
      ? selectedServiceIds.map((id) => getLocalServiceById(id)).filter(Boolean)
      : [];
    const localServiceIds = new Set(localServices.map((service) => service._id));
    const dbServiceIds = selectedServiceIds.filter((id) => !localServiceIds.has(String(id)));

    for (const svc of localServices) {
      const quantity = quantities.get(String(svc._id));
      services.push({
        customServiceName: svc.name,
        customServicePrice: svc.price,
        price: svc.price,
        duration: svc.duration,
        quantity,
      });
      totalAmount += Math.round(svc.price * 100) * quantity / 100;
    }

    const dbServices = dbServiceIds.length
      ? await Service.find({ _id: { $in: dbServiceIds }, isActive: true })
      : [];
    if (dbServices.length !== dbServiceIds.length) {
      return res.status(400).json({ message: 'One or more selected services are unavailable' });
    }
    for (const svc of dbServices) {
      const quantity = quantities.get(String(svc._id));
      services.push({
        service: svc._id,
        price: svc.price,
        duration: svc.duration,
        quantity,
      });
      totalAmount += Math.round(svc.price * 100) * quantity / 100;
    }
  }

  if (normalizedCustomServices.length) {
    for (const cs of normalizedCustomServices) {
      services.push({
        customServiceName: cs.name,
        customServicePrice: cs.price,
        price: cs.price,
        duration: cs.duration,
        quantity: cs.quantity,
      });
      totalAmount += Math.round(cs.price * 100) * cs.quantity / 100;
    }
  }

  totalAmount = Math.round(totalAmount * 100) / 100;

  if (services.length === 0 && !customServiceRequestText) {
    return res.status(400).json({ message: 'Select at least one service' });
  }

  const advance = paymentOptionValue === 'pay_now' ? parseFloat(advanceAmount) || 0 : 0;
  if (advance < 0 || advance > totalAmount) {
    return res.status(400).json({ message: 'Invalid advance amount' });
  }

  if (paymentOptionValue === 'pay_now' && totalAmount <= 0) {
    return res.status(400).json({ message: 'Pay Now requires a priced service' });
  }

  if (paymentOptionValue === 'pay_now' && advance < 1) {
    return res.status(400).json({ message: 'Minimum advance of ₹1 required for pay now' });
  }

  let paymentScreenshot = '';
  if (req.file) {
    await compressImage(req.file.path);
    paymentScreenshot = req.file.filename;
  }

  if (paymentOptionValue === 'pay_now' && !paymentScreenshot) {
    return res.status(400).json({ message: 'Please upload the payment screenshot' });
  }

  // Status logic: Never auto-confirm. Always require admin verification.
  // pending_payment: No payment screenshot uploaded yet
  // pending_approval: Payment screenshot uploaded, awaiting admin verification
  const status =
    paymentOptionValue === 'pay_later' || paymentScreenshot
      ? 'pending_approval'
      : 'pending_payment';
  const bookingReference = generateBookingRef();

  console.log(`[Appointment Created] Reference: ${bookingReference}, Status: ${status}, PaymentOption: ${paymentOptionValue}, Advance: ${advance}, Screenshot: ${paymentScreenshot ? 'Yes' : 'No'}`);

  const appointment = await Appointment.create({
    customer: req.user._id,
    services,
    customServiceRequest: customServiceRequestText,
    appointmentDate: appointmentDateValue,
    appointmentTime: appointmentTimeText,
    venue: venueText,
    notes: notesText,
    totalAmount,
    // A screenshot is only a payment claim. The balance changes after owner verification.
    advancePaid: 0,
    remainingBalance: totalAmount,
    paymentOption: paymentOptionValue,
    paymentScreenshot,
    status,
    bookingReference,
  });

  if (advance > 0) {
    const payment = await Payment.create({
      appointment: appointment._id,
      customer: req.user._id,
      amount: advance,
      type: advance >= totalAmount ? 'full' : 'advance',
      method: paymentScreenshot ? 'screenshot' : 'upi',
      screenshot: paymentScreenshot,
      status: 'pending', // Always pending, never auto-verified
    });
    console.log(`[Payment Created] Amount: ${advance}, Status: pending, Appointment: ${appointment.bookingReference}`);
  }

  await notifyAdmin({
    type: 'new_booking',
    title: 'New Booking',
    message: `New booking ${appointment.bookingReference} from ${req.user.fullName}`,
    relatedId: appointment._id,
    relatedModel: 'Appointment',
  });

  if (advance > 0) {
    await notifyAdmin({
      type: 'advance_payment',
      title: 'Advance Payment Received',
      message: `₹${advance} advance for booking ${appointment.bookingReference}`,
      relatedId: appointment._id,
      relatedModel: 'Appointment',
    });
  }

  if (status === 'confirmed') {
    await notifyCustomer({
      customerId: req.user._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your booking ${appointment.bookingReference} is confirmed.`,
      relatedId: appointment._id,
      relatedModel: 'Appointment',
    });
    await sendBookingConfirmation(
      req.user.email,
      req.user.fullName,
      appointment.bookingReference,
      new Date(appointmentDate).toLocaleDateString('en-IN'),
      appointmentTime
    );
  }

  const populated = await populateAppointment(Appointment.findById(appointment._id));
  res.status(201).json(await populated);
};

export const getMyAppointments = async (req, res) => {
  const { type } = req.query;
  const filter = { customer: req.user._id };
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (type === 'upcoming') {
    filter.appointmentDate = { $gte: now };
    filter.status = {
      $in: ['confirmed', 'pending_approval', 'pending_payment', 'payment_rejected'],
    };
  } else if (type === 'past') {
    filter.$or = [
      { appointmentDate: { $lt: now } },
      { status: { $in: ['completed', 'cancelled', 'rejected'] } },
    ];
  }

  const appointments = await populateAppointment(
    Appointment.find(filter).sort({ appointmentDate: -1 })
  );
  res.json(await appointments);
};

export const getAppointmentById = async (req, res) => {
  const appointment = await populateAppointment(
    Appointment.findById(req.params.id)
  );
  const result = await appointment;
  if (!result) return res.status(404).json({ message: 'Appointment not found' });

  if (
    req.user.role === 'customer' &&
    result.customer._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const payload = result.toObject();
  payload.paymentScreenshotUrl = payload.paymentScreenshot
    ? getFileUrl(payload.paymentScreenshot, req)
    : '';
  res.json(payload);
};

export const getAllAppointments = async (req, res) => {
  const { date, customer, status, service, month, year } = req.query;
  const filter = {};

  if (date) {
    const d = parseAppointmentDate(date);
    if (!d) return res.status(400).json({ message: 'Invalid appointment date' });
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    filter.appointmentDate = { $gte: d, $lt: next };
  }

  if (month && year) {
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 1);
    filter.appointmentDate = { $gte: start, $lt: end };
  }

  if (customer) filter.customer = customer;
  if (status) filter.status = status;

  let query = Appointment.find(filter);

  if (service) {
    query = query.where('services.service').equals(service);
  }

  const appointments = await populateAppointment(query.sort({ appointmentDate: 1 }));
  res.json(await appointments);
};

export const updateAppointmentStatus = async (req, res) => {
  const { status, adminNotes } = req.body;
  const appointment = await Appointment.findById(req.params.id).populate('customer');

  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  const allowedStatuses = [
    'pending_payment',
    'pending_approval',
    'confirmed',
    'rejected',
    'payment_rejected',
    'completed',
    'cancelled',
  ];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid appointment status' });
  }

  if (status === 'confirmed' && appointment.paymentOption === 'pay_now') {
    const verifiedPayment = await Payment.exists({ appointment: appointment._id, status: 'verified' });
    if (!verifiedPayment) {
      return res.status(400).json({
        message: 'Verify the payment against the UPI or bank record before confirming this booking',
      });
    }
  }

  if (status === 'completed' && appointment.status !== 'confirmed') {
    return res.status(400).json({ message: 'Only confirmed appointments can be marked completed' });
  }

  const oldStatus = appointment.status;
  appointment.status = status;
  if (adminNotes !== undefined) appointment.adminNotes = adminNotes;
  await appointment.save();

  console.log(`[Appointment Status Updated] Reference: ${appointment.bookingReference}, Old: ${oldStatus}, New: ${status}`);

  if (status === 'confirmed') {
    await notifyCustomer({
      customerId: appointment.customer._id,
      type: 'booking_confirmed',
      title: 'Booking Approved',
      message: `Your booking ${appointment.bookingReference} has been approved.`,
      relatedId: appointment._id,
      relatedModel: 'Appointment',
    });
  } else if (status === 'rejected') {
    await notifyCustomer({
      customerId: appointment.customer._id,
      type: 'booking_rejected',
      title: 'Booking Rejected',
      message: `Your booking ${appointment.bookingReference} was not approved.`,
      relatedId: appointment._id,
      relatedModel: 'Appointment',
    });
  } else if (status === 'cancelled') {
    await notifyAdmin({
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Booking ${appointment.bookingReference} was cancelled.`,
      relatedId: appointment._id,
      relatedModel: 'Appointment',
    });
  }

  res.json(await populateAppointment(Appointment.findById(appointment._id)));
};

export const cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  if (
    req.user.role === 'customer' &&
    appointment.customer.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (appointment.status === 'completed') {
    return res.status(400).json({ message: 'Completed appointments cannot be cancelled' });
  }

  appointment.status = 'cancelled';
  await appointment.save();

  await notifyAdmin({
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: `Booking ${appointment.bookingReference} cancelled by customer.`,
    relatedId: appointment._id,
    relatedModel: 'Appointment',
  });

  res.json({ message: 'Booking cancelled' });
};

export const getCalendarView = async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(parseInt(year), parseInt(month) - 1, 1);
  const end = new Date(parseInt(year), parseInt(month), 1);

  const appointments = await Appointment.find({
    appointmentDate: { $gte: start, $lt: end },
    status: { $in: ['confirmed', 'pending_approval', 'pending_payment', 'completed'] },
  })
    .populate('customer', 'fullName mobile')
    .select('appointmentDate appointmentTime status bookingReference customer services totalAmount');

  const calendar = {};
  appointments.forEach((apt) => {
    const key = apt.appointmentDate.toISOString().slice(0, 10);
    if (!calendar[key]) calendar[key] = [];
    calendar[key].push(apt);
  });

  res.json(calendar);
};

export const getDailySchedule = async (req, res) => {
  const { date } = req.query;
  const d = parseAppointmentDate(date);
  if (!d) return res.status(400).json({ message: 'Invalid appointment date' });
  const next = new Date(d);
  next.setDate(next.getDate() + 1);

  const appointments = await populateAppointment(
    Appointment.find({
      appointmentDate: { $gte: d, $lt: next },
      status: { $in: ['confirmed', 'pending_approval', 'pending_payment'] },
    }).sort({ appointmentTime: 1 })
  );

  res.json(await appointments);
};

export const getReceipt = async (req, res) => {
  const appointment = await populateAppointment(
    Appointment.findById(req.params.id)
  );
  const result = await appointment;
  if (!result) return res.status(404).json({ message: 'Appointment not found' });

  if (
    req.user.role === 'customer' &&
    result.customer._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (!['confirmed', 'completed'].includes(result.status)) {
    return res.status(409).json({
      message: 'Your receipt will be available after the booking and payment are approved.',
    });
  }

  const payments = await Payment.find({
    appointment: result._id,
    status: 'verified',
  }).sort({ createdAt: 1 });

  res.json({
    appointment: result,
    payments,
    generatedAt: new Date(),
  });
};

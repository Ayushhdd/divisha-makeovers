import User from '../models/User.js';
import { generateToken, generateOTP } from '../utils/tokens.js';
import { sendOTPEmail } from '../utils/email.js';
import { notifyAdmin } from '../utils/notifications.js';
import crypto from 'crypto';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const recoveryRole = (body) => ['admin', 'customer'].includes(body.accountType) ? body.accountType : undefined;
const hashOTP = (otp, email) =>
  crypto.createHash('sha256').update(`${otp}:${normalizeEmail(email)}`).digest('hex');
const passwordError = (password, role) => {
  const minimum = role === 'admin' ? 11 : 6;
  return typeof password !== 'string' || password.length < minimum || Buffer.byteLength(password, 'utf8') > 72
    ? `Use a password of at least ${minimum} characters and no more than 72 UTF-8 bytes.` : '';
};

export const registerCustomer = async (req, res) => {
  const {
    fullName,
    age,
    email,
    mobile,
    password,
    address,
  } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const user = await User.create({
    fullName,
    age,
    email,
    mobile,
    password,
    address,
    role: 'customer',
  });

  await notifyAdmin({
    type: 'new_registration',
    title: 'New Customer Registered',
    message: `${fullName} (${email}) has registered.`,
    relatedId: user._id,
    relatedModel: 'User',
  });

  res.status(201).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
};

export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+password +sessionVersion');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!(await user.matchPassword(password)) ||
      (req.body.adminOnly === true && user.role !== 'admin') ||
      (req.body.customerOnly === true && user.role !== 'customer')) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(401).json({ message: 'Account is deactivated' });
  }

  const token = generateToken(user._id, rememberMe, user.sessionVersion ?? 0);

  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    token: token,
  });
};

export const getProfile = async (req, res) => {
  res.json(req.user);
};

export const updateProfile = async (req, res) => {
  const { fullName, age, mobile, address } = req.body;
  const user = await User.findById(req.user._id);

  if (fullName) user.fullName = fullName;
  if (age) user.age = age;
  if (mobile) user.mobile = mobile;
  if (address) user.address = { ...user.address?.toObject?.() || user.address, ...address };

  await user.save();
  res.json(user);
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, newEmail } = req.body;
  const user = await User.findById(req.user._id).select('+password +sessionVersion');

  if (typeof currentPassword !== 'string' || !(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  const validationError = passwordError(newPassword, user.role);
  if (validationError) return res.status(400).json({ message: validationError });
  if (await user.matchPassword(newPassword)) {
    return res.status(400).json({ message: 'Choose a new password different from your current password.' });
  }
  if (newEmail !== undefined && user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required to change the login email here.' });
  }
  if (newEmail !== undefined) {
    const email = normalizeEmail(newEmail);
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid login email.' });
    if (await User.exists({ email, _id: { $ne: user._id } })) {
      return res.status(400).json({ message: 'That email is already registered.' });
    }
    user.email = email;
  }

  user.password = newPassword;
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  user.otp = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = 0;
  user.otpSentAt = undefined;
  await user.save();
  res.json({ message: 'Login updated. All sessions have been signed out. Sign in with your new details.' });
};

export const forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  if (req.body.accountType !== undefined && !recoveryRole(req.body)) {
    return res.status(400).json({ message: 'Choose a valid account type' });
  }
  const role = recoveryRole(req.body);
  const user = await User.findOne({ email, ...(role ? { role } : {}) }).select('+otp +otpExpires +otpAttempts +otpSentAt');

  if (!user) {
    return res.status(404).json({ message: role === 'admin'
      ? 'No admin account found for this email.'
      : 'No customer account found for this email. Please register first, then request an OTP.' });
  }

  const resendWindowMs = 60 * 1000;
  if (user.otpSentAt && Date.now() - user.otpSentAt.getTime() < resendWindowMs) {
    return res.status(429).json({ message: 'Please wait one minute before requesting another OTP',
      retryAfter: Math.ceil((resendWindowMs - (Date.now() - user.otpSentAt.getTime())) / 1000) });
  }

  const otp = generateOTP();
  user.otp = hashOTP(otp, email);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  user.otpSentAt = new Date();
  await user.save();

  const delivery = await sendOTPEmail(user.email, otp, user.fullName);
  if (!delivery.success) {
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpSentAt = undefined;
    await user.save();
    return res.status(503).json({ message: 'OTP email could not be sent. Please try again later.' });
  }

  res.json({ message: 'OTP sent. Check your inbox and spam folder.', retryAfter: 60, expiresIn: 600 });
};

export const resetPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || '').replace(/\D/g, '');
  const newPassword = String(req.body.newPassword || '');
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(otp) || newPassword.length < 6) {
    return res.status(400).json({ message: 'Enter a valid email, 6-digit OTP and a password of at least 6 characters' });
  }

  if (req.body.accountType !== undefined && !recoveryRole(req.body)) {
    return res.status(400).json({ message: 'Choose a valid account type' });
  }
  const role = recoveryRole(req.body);
  const user = await User.findOne({ email, ...(role ? { role } : {}) }).select('+otp +otpExpires +otpAttempts +password +sessionVersion');

  if (!user || !user.otp || !user.otpExpires || user.otpExpires < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  if (user.otpAttempts >= 5) {
    return res.status(429).json({ message: 'Too many incorrect OTP attempts. Please request a new OTP.' });
  }
  const validationError = passwordError(newPassword, user.role);
  if (validationError) return res.status(400).json({ message: validationError });

  if (user.otp !== hashOTP(otp, email)) {
    user.otpAttempts += 1;
    await user.save();
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.password = newPassword;
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  user.otp = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = 0;
  user.otpSentAt = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
};

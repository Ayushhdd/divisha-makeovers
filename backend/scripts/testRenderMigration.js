import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const backendDir = fileURLToPath(new URL('../', import.meta.url));
const mongo = await MongoMemoryServer.create({ binary: {
  // MongoDB has no Windows ARM binary; Windows supports the x64 build.
  ...(process.platform === 'win32' && process.arch === 'arm64' ? { arch: 'x64' } : {}),
} });
const staging = await mkdtemp(path.join(os.tmpdir(), 'divisha-migration-test-'));
const port = 15051;
const base = `http://127.0.0.1:${port}`;
const deliveredEmails = [];
let rejectEmail = false;
const relay = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString();
  const expected = createHmac('sha256', 'isolated-test-email-relay').update(`${req.headers['x-email-timestamp']}.${body}`).digest('hex');
  if (req.headers['x-email-signature'] !== expected) { res.writeHead(401).end(); return; }
  if (rejectEmail) { res.writeHead(502).end(); return; }
  deliveredEmails.push(JSON.parse(body));
  res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"ok":true}');
});
relay.listen(0, '127.0.0.1');
await once(relay, 'listening');
const relayUrl = `http://127.0.0.1:${relay.address().port}`;
let server;
let logs = '';
const stop = async () => {
  if (server && server.exitCode === null) {
    const ended = once(server, 'exit');
    server.kill();
    await ended;
  }
};
const start = async () => {
  server = spawn(process.execPath, ['server.js'], {
    cwd: backendDir,
    env: {
      ...process.env,
      MONGODB_URI: mongo.getUri('render_migration_test'), PORT: String(port),
      NODE_ENV: 'test', JWT_SECRET: 'isolated-migration-test-secret',
      ADMIN_EMAIL: 'admin@example.invalid', ADMIN_PASSWORD: 'TestPass12!',
      UPLOAD_STORAGE: 'mongodb', UPLOAD_DIR: staging, API_URL: base,
      CLIENT_URL: 'https://divishamakeovers.com',
      EMAIL_RELAY_URL: relayUrl, EMAIL_RELAY_SECRET: 'isolated-test-email-relay', SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '',
    }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', data => { logs += data; });
  server.stderr.on('data', data => { logs += data; });
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(`${base}/api/health`)).ok) return; } catch {}
    if (server.exitCode !== null) throw new Error(logs);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Test server did not start: ${logs}`);
};
const request = async (route, token, body, method = 'GET', expected = 200) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${base}/api${route}`, {
    method, headers, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  assert.equal(response.status, expected, `${route}: ${JSON.stringify(data)}`);
  return data;
};
try {
  await start();
  const health = await request('/health');
  assert.equal(health.database, 'connected');
  const admin = await request('/auth/login', '', {
    email: 'admin@example.invalid', password: 'TestPass12!',
  }, 'POST');
  const customer = await request('/auth/register', '', {
    fullName: 'Migration Test Customer', email: 'customer@example.invalid', mobile: '9999999998',
    password: 'TestPass12!',
    address: { line1: 'Test', district: 'Test', state: 'Test', postalCode: '144001' },
  }, 'POST', 201);
  const services = await request('/services');
  const initialSettings = await request('/admin/settings/public');
  assert.equal(initialSettings.upiIntentEnabled, false, 'Old settings must not claim merchant checkout support');
  await request('/admin/settings', admin.token, { upiId: 'test@example', upiIntentEnabled: true }, 'PUT', 400);
  await request('/admin/settings', admin.token, { upiId: 'test@example', upiIntentEnabled: true, merchantCategoryCode: '0000' }, 'PUT', 400);
  await request('/admin/settings', admin.token, { merchantCategoryCode: 'wrong' }, 'PUT', 400);
  await request('/admin/settings', admin.token, { upiId: 'test@example', upiIntentEnabled: true, merchantCategoryCode: '7298' }, 'PUT');
  const merchantSettings = await request('/admin/settings/public');
  assert.equal(merchantSettings.upiIntentEnabled, true);
  assert.equal(merchantSettings.merchantCategoryCode, '7298');
  const changedPayee = await request('/admin/settings', admin.token, { upiId: 'changed@example' }, 'PUT');
  assert.equal(changedPayee.upiIntentEnabled, false, 'Changing the receiving UPI ID must require reconfirming merchant configuration');
  await request('/auth/login', '', {
    email: 'customer@example.invalid', password: 'TestPass12!', adminOnly: true,
  }, 'POST', 401);
  await request('/auth/login', '', {
    email: 'admin@example.invalid', password: 'TestPass12!', adminOnly: true,
  }, 'POST');
  await request('/auth/login', '', {
    email: 'admin@example.invalid', password: 'TestPass12!', customerOnly: true,
  }, 'POST', 401);
  const customerLogin = await request('/auth/login', '', {
    email: 'customer@example.invalid', password: 'TestPass12!', customerOnly: true,
  }, 'POST');
  assert.equal(customerLogin.role, 'customer');
  await request('/admin/dashboard', customerLogin.token, undefined, 'GET', 403);
  assert.ok(services.length);
  const engagement = services.find(service => service.category === 'Engagement & Reception Makeup') || services[0];
  const quantityBody = {
    serviceIds: [engagement._id], serviceQuantities: { [engagement._id]: 5 },
    appointmentDate: '2099-10-12', appointmentTime: '10:00', venue: 'Isolated quantity test', paymentOption: 'pay_later',
  };
  for (const quantity of [0, -1, 1.5, 101, 'invalid']) {
    await request('/appointments', customer.token, { ...quantityBody, serviceQuantities: { [engagement._id]: quantity } }, 'POST', 400);
  }
  await request('/appointments', customer.token, { ...quantityBody, serviceIds: [engagement._id, engagement._id] }, 'POST', 400);
  const legacyBooking = await request('/appointments', customer.token, { ...quantityBody, serviceQuantities: undefined }, 'POST', 201);
  assert.equal(legacyBooking.services[0].quantity, 1);
  assert.equal(legacyBooking.totalAmount, engagement.price);
  const screenshot = await sharp({ create: {
    width: 100, height: 100, channels: 3, background: '#336699',
  } }).png().toBuffer();
  const bookingForm = new FormData();
  Object.entries({
    serviceIds: JSON.stringify([engagement._id]), serviceQuantities: JSON.stringify({ [engagement._id]: 5 }),
    customServices: JSON.stringify([{ name: 'Test custom service', price: 100, quantity: 2 }]), totalAmount: '1', appointmentDate: '2099-10-12',
    appointmentTime: '10:00', venue: 'Isolated test venue', advanceAmount: '1', paymentOption: 'pay_now',
  }).forEach(([key, value]) => bookingForm.set(key, value));
  bookingForm.set('paymentScreenshot', new Blob([screenshot], { type: 'image/png' }), 'test.png');
  const booking = await request('/appointments', customer.token, bookingForm, 'POST', 201);
  assert.equal(booking.advancePaid, 0);
  assert.equal(booking.totalAmount, engagement.price * 5 + 200, 'Backend must calculate quantity totals itself, ignoring supplied totals');
  assert.equal(booking.services[0].quantity, 5);
  assert.equal(booking.services[1].quantity, 2);
  const payments = await request('/payments/my', customer.token);
  assert.equal(payments.length, 1);
  assert.equal(payments[0].status, 'pending');
  const storedUrl = payments[0].screenshotUrl;
  let image = await fetch(storedUrl);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('content-type'), 'image/jpeg');
  assert.ok((await image.arrayBuffer()).byteLength > 0);
  assert.deepEqual(await readdir(staging), []);
  await request(`/payments/${payments[0]._id}/verify`, customer.token, { status: 'verified' }, 'PUT', 403);
  await request(`/appointments/${booking._id}/receipt`, customer.token, undefined, 'GET', 409);
  await stop();
  await start();
  image = await fetch(storedUrl);
  assert.equal(image.status, 200, 'Screenshot must survive a backend restart');
  await request(`/payments/${payments[0]._id}/verify`, admin.token, { status: 'verified' }, 'PUT');
  await request(`/payments/${payments[0]._id}/verify`, admin.token, { status: 'verified' }, 'PUT', 400);
  const receipt = await request(`/appointments/${booking._id}/receipt`, customer.token);
  assert.equal(receipt.appointment.advancePaid, 1);
  assert.equal(receipt.appointment.services[0].quantity, 5);
  assert.equal(receipt.appointment.services[1].quantity, 2);
  assert.equal(receipt.appointment.remainingBalance, booking.totalAmount - 1);
  assert.equal(receipt.appointment.status, 'confirmed');
  const splitForm = new FormData();
  splitForm.set('appointmentId', booking._id);
  splitForm.set('amount', '2');
  splitForm.set('screenshot', new Blob([screenshot], { type: 'image/png' }), 'installment.png');
  const installment = await request('/payments', customer.token, splitForm, 'POST', 201);
  await request(`/payments/${installment._id}/verify`, admin.token, { status: 'verified' }, 'PUT');
  const splitReceipt = await request(`/appointments/${booking._id}/receipt`, customer.token);
  assert.equal(splitReceipt.appointment.advancePaid, 3);
  assert.equal(splitReceipt.appointment.remainingBalance, booking.totalAmount - 3);
  assert.equal(splitReceipt.payments.length, 2);
  const balanceForm = new FormData();
  balanceForm.set('appointmentId', booking._id);
  balanceForm.set('amount', String(booking.totalAmount - 3));
  balanceForm.set('screenshot', new Blob([screenshot], { type: 'image/png' }), 'balance.png');
  const balance = await request('/payments', customer.token, balanceForm, 'POST', 201);
  await request(`/payments/${balance._id}/verify`, admin.token, { status: 'verified' }, 'PUT');
  const paid = await request(`/appointments/${booking._id}/receipt`, customer.token);
  assert.equal(paid.appointment.remainingBalance, 0);
  assert.equal(paid.payments.length, 3);
  const cors = await fetch(`${base}/api/health`, { headers: { Origin: 'https://divishamakeovers.com' } });
  assert.equal(cors.headers.get('access-control-allow-origin'), 'https://divishamakeovers.com');
  await mongoose.connect(mongo.getUri('render_migration_test'));
  const otpEmailCount = () => deliveredEmails.filter(email => email.subject.includes('Password Reset OTP')).length;
  let emailCount = otpEmailCount();
  await request('/auth/forgot-password', '', { email: 'missing@example.invalid', accountType: 'customer' }, 'POST', 404);
  await request('/auth/forgot-password', '', { email: 'admin@example.invalid', accountType: 'customer' }, 'POST', 404);
  assert.equal(otpEmailCount(), emailCount, 'Missing and wrong-role accounts must not send an OTP');
  rejectEmail = true;
  await request('/auth/forgot-password', '', { email: 'customer@example.invalid', accountType: 'customer' }, 'POST', 503);
  assert.equal((await mongoose.connection.collection('users').findOne({ email: 'customer@example.invalid' })).otp, undefined);
  rejectEmail = false;
  const otpSent = await request('/auth/forgot-password', '', { email: 'customer@example.invalid', accountType: 'customer' }, 'POST');
  assert.equal(otpSent.retryAfter, 60);
  assert.equal(otpEmailCount(), emailCount + 1);
  const deliveredOtp = deliveredEmails.filter(email => email.subject.includes('Password Reset OTP')).at(-1).html.match(/<h1[^>]*>(\d{6})<\/h1>/)[1];
  const otpRecord = await mongoose.connection.collection('users').findOne({ email: 'customer@example.invalid' });
  assert.notEqual(otpRecord.otp, deliveredOtp);
  assert.equal(otpRecord.otp, createHash('sha256').update(`${deliveredOtp}:customer@example.invalid`).digest('hex'));
  await request('/auth/forgot-password', '', { email: 'customer@example.invalid', accountType: 'customer' }, 'POST', 429);
  assert.equal(otpEmailCount(), emailCount + 1);
  await request('/auth/reset-password', '', { email: 'customer@example.invalid', accountType: 'admin', otp: deliveredOtp, newPassword: 'ClientPass9!' }, 'POST', 400);
  await request('/auth/reset-password', '', { email: 'customer@example.invalid', accountType: 'customer', otp: deliveredOtp, newPassword: 'ClientPass9!' }, 'POST');
  await request('/auth/profile', customer.token, undefined, 'GET', 401);
  await request('/auth/login', '', { email: 'customer@example.invalid', password: 'ClientPass9!', customerOnly: true }, 'POST');
  const qrForm = new FormData();
  qrForm.set('qrCode', new Blob([screenshot], { type: 'image/png' }), 'qr.png');
  const qr = await request('/admin/settings', admin.token, qrForm, 'PUT');
  assert.equal((await fetch(qr.qrCodeUrl)).status, 200);
  const secondAdminSession = await request('/auth/login', '', {
    email: 'admin@example.invalid', password: 'TestPass12!', rememberMe: true,
  }, 'POST');
  await request('/auth/change-password', admin.token, {
    currentPassword: 'WrongPassword123!', newPassword: 'NewPass456!',
  }, 'PUT', 400);
  await request('/auth/change-password', admin.token, {
    currentPassword: 'TestPass12!', newPassword: '1234567890',
  }, 'PUT', 400);
  await request('/auth/change-password', admin.token, {
    currentPassword: 'TestPass12!', newPassword: 'a'.repeat(73),
  }, 'PUT', 400);
  await request('/auth/change-password', admin.token, {
    currentPassword: 'TestPass12!', newPassword: 'NewPass456!', newEmail: 'customer@example.invalid',
  }, 'PUT', 400);
  await request('/auth/change-password', admin.token, {
    currentPassword: 'TestPass12!', newPassword: 'NewPass456!', newEmail: 'private-admin@example.invalid',
  }, 'PUT');
  await request('/auth/profile', admin.token, undefined, 'GET', 401);
  await request('/admin/dashboard', secondAdminSession.token, undefined, 'GET', 401);
  await request('/auth/login', '', { email: 'admin@example.invalid', password: 'TestPass12!' }, 'POST', 401);
  await request('/auth/login', '', { email: 'private-admin@example.invalid', password: 'TestPass12!' }, 'POST', 401);
  let updatedAdmin = await request('/auth/login', '', {
    email: 'private-admin@example.invalid', password: 'NewPass456!',
  }, 'POST');
  const profile = await request('/auth/profile', updatedAdmin.token);
  assert.equal(profile.password, undefined);
  assert.equal(profile.sessionVersion, undefined);
  assert.equal(profile.email, 'private-admin@example.invalid');
  const users = mongoose.connection.collection('users');
  let storedAdmin = await users.findOne({ _id: new mongoose.Types.ObjectId(admin._id) });
  assert.match(storedAdmin.password, /^\$2[aby]\$12\$/);
  assert.notEqual(storedAdmin.password, 'NewPass456!');
  // Supply a test-only OTP directly in the isolated database; no email is sent.
  await users.updateOne({ _id: storedAdmin._id }, { $set: {
    otp: createHash('sha256').update('123456:private-admin@example.invalid').digest('hex'),
    otpExpires: new Date(Date.now() + 60000), otpAttempts: 0,
  } });
  await request('/auth/reset-password', '', {
    email: 'private-admin@example.invalid', otp: '123456', newPassword: 'ResetPass9!',
  }, 'POST');
  await request('/auth/profile', updatedAdmin.token, undefined, 'GET', 401);
  updatedAdmin = await request('/auth/login', '', {
    email: 'private-admin@example.invalid', password: 'ResetPass9!',
  }, 'POST');
  // A redeploy must not restore the old environment bootstrap credentials.
  await stop();
  await start();
  await request('/auth/login', '', { email: 'admin@example.invalid', password: 'TestPass12!' }, 'POST', 401);
  await request('/admin/dashboard', updatedAdmin.token);
  const { migrateAdminEmail } = await import('../utils/adminEmailMigration.js');
  const beforeEmailCorrection = await users.findOne({ role: 'admin' });
  const correction = {
    legacyEmail: 'private-admin@example.invalid', targetEmail: 'owner@example.invalid',
    migrationId: 'isolated-owner-email-correction',
  };
  await assert.rejects(migrateAdminEmail({ ...correction, targetEmail: 'customer@example.invalid' }), /conflicts/);
  assert.equal((await users.findOne({ _id: beforeEmailCorrection._id })).email, correction.legacyEmail);
  await migrateAdminEmail(correction);
  const afterEmailCorrection = await users.findOne({ _id: beforeEmailCorrection._id });
  assert.equal(afterEmailCorrection.password, beforeEmailCorrection.password, 'Email correction must preserve the exact existing password hash');
  assert.equal(afterEmailCorrection.sessionVersion, beforeEmailCorrection.sessionVersion + 1);
  await request('/admin/dashboard', updatedAdmin.token, undefined, 'GET', 401);
  await request('/auth/login', '', { email: correction.legacyEmail, password: 'ResetPass9!' }, 'POST', 401);
  updatedAdmin = await request('/auth/login', '', {
    email: correction.targetEmail, password: 'ResetPass9!', adminOnly: true,
  }, 'POST');
  await request('/admin/dashboard', updatedAdmin.token);
  await migrateAdminEmail(correction);
  assert.equal((await users.findOne({ _id: beforeEmailCorrection._id })).sessionVersion, afterEmailCorrection.sessionVersion);
  const { ensureAdminAccount } = await import('../utils/adminBootstrap.js');
  const bootstrapAdmin = await users.findOne({ role: 'admin' });
  await users.deleteOne({ _id: bootstrapAdmin._id });
  const savedEmail = process.env.ADMIN_EMAIL;
  const savedPassword = process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;
  try {
    await assert.rejects(ensureAdminAccount(), /No default admin login/);
    assert.equal(await users.countDocuments({ role: 'admin' }), 0);
  } finally {
    if (savedEmail !== undefined) process.env.ADMIN_EMAIL = savedEmail;
    if (savedPassword !== undefined) process.env.ADMIN_PASSWORD = savedPassword;
  }
  console.log('PASS: merchant checkout configuration and payee changes, quantity pricing and legacy bookings, three-part receipts, OTP delivery with a signed isolated relay, missing-account and wrong-portal rejection, SMTP failure handling, password/email changes, session revocation, hashing, restart without restoring bootstrap login, and no default admin account.');
} finally {
  await stop();
  await mongoose.disconnect();
  await mongo.stop();
  await new Promise(resolve => relay.close(resolve));
  await rm(staging, { recursive: true, force: true });
}

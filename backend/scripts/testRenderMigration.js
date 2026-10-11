import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
      EMAIL_RELAY_URL: '', EMAIL_RELAY_SECRET: '', SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '',
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
  await request('/auth/login', '', {
    email: 'customer@example.invalid', password: 'TestPass12!', adminOnly: true,
  }, 'POST', 401);
  await request('/auth/login', '', {
    email: 'admin@example.invalid', password: 'TestPass12!', adminOnly: true,
  }, 'POST');
  assert.ok(services.length);
  const screenshot = await sharp({ create: {
    width: 100, height: 100, channels: 3, background: '#336699',
  } }).png().toBuffer();
  const bookingForm = new FormData();
  Object.entries({
    serviceIds: JSON.stringify([services[0]._id]), appointmentDate: '2099-10-12',
    appointmentTime: '10:00', venue: 'Isolated test venue', advanceAmount: '1', paymentOption: 'pay_now',
  }).forEach(([key, value]) => bookingForm.set(key, value));
  bookingForm.set('paymentScreenshot', new Blob([screenshot], { type: 'image/png' }), 'test.png');
  const booking = await request('/appointments', customer.token, bookingForm, 'POST', 201);
  assert.equal(booking.advancePaid, 0);
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
  console.log('PASS: migration, three-part payments and receipts, password/email changes, session revocation, password hashing, OTP reset, restart without restoring bootstrap login, and no default admin account.');
} finally {
  await stop();
  await mongoose.disconnect();
  await mongo.stop();
  await rm(staging, { recursive: true, force: true });
}

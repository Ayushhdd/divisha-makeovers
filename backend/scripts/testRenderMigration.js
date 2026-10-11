import assert from 'node:assert/strict';
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
      ADMIN_EMAIL: 'admin@example.invalid', ADMIN_PASSWORD: 'TestPassword123!',
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
    email: 'admin@example.invalid', password: 'TestPassword123!',
  }, 'POST');
  const customer = await request('/auth/register', '', {
    fullName: 'Migration Test Customer', email: 'customer@example.invalid', mobile: '9999999998',
    password: 'TestPassword123!',
    address: { line1: 'Test', district: 'Test', state: 'Test', postalCode: '144001' },
  }, 'POST', 201);
  const services = await request('/services');
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
  const balanceForm = new FormData();
  balanceForm.set('appointmentId', booking._id);
  balanceForm.set('amount', String(booking.totalAmount - 1));
  balanceForm.set('screenshot', new Blob([screenshot], { type: 'image/png' }), 'balance.png');
  const balance = await request('/payments', customer.token, balanceForm, 'POST', 201);
  await request(`/payments/${balance._id}/verify`, admin.token, { status: 'verified' }, 'PUT');
  const paid = await request(`/appointments/${booking._id}/receipt`, customer.token);
  assert.equal(paid.appointment.remainingBalance, 0);
  assert.equal(paid.payments.length, 2);
  const cors = await fetch(`${base}/api/health`, { headers: { Origin: 'https://divishamakeovers.com' } });
  assert.equal(cors.headers.get('access-control-allow-origin'), 'https://divishamakeovers.com');
  await mongoose.connect(mongo.getUri('render_migration_test'));
  const qrForm = new FormData();
  qrForm.set('qrCode', new Blob([screenshot], { type: 'image/png' }), 'qr.png');
  const qr = await request('/admin/settings', admin.token, qrForm, 'PUT');
  assert.equal((await fetch(qr.qrCodeUrl)).status, 200);
  console.log('PASS: health, registration, login, services, booking, persistent screenshots after restart, payment authorization, duplicate approval prevention, advance and balance payment, receipts, CORS and QR upload.');
} finally {
  await stop();
  await mongoose.disconnect();
  await mongo.stop();
  await rm(staging, { recursive: true, force: true });
}

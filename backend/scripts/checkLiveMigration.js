import 'dotenv/config';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createRequire } from 'node:module';

// Read-only production checks, except the explicitly requested payment QR setup.
// No customer, booking, payment, or email message is created by this script.
const base = process.env.API_URL;
assert.ok(base?.startsWith('https://') && base.endsWith('.onrender.com'));
const request = async (route, token, body, method = 'GET') => {
  const response = await fetch(`${base}/api${route}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60000),
  });
  assert.equal(response.status, 200, `${route} returned ${response.status}`);
  return response.json();
};
const health = await request('/health');
assert.equal(health.database, 'connected');
const services = await request('/services');
assert.ok(services.length > 0);
const settings = await request('/admin/settings/public');
assert.equal(settings.upiId, process.env.INITIAL_UPI_ID);
const frontend = new URL(process.env.EMAIL_RELAY_URL).origin;
const proxy = await fetch(`${frontend}/backend-api/health`, { signal: AbortSignal.timeout(60000) });
assert.equal(proxy.status, 200, 'Frontend API proxy is unavailable');
assert.equal((await proxy.json()).database, 'connected');
const admin = await request('/auth/login', '', {
  email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD,
}, 'POST');
assert.equal(admin.role, 'admin');
if (process.argv.includes('--setup-qr')) {
  const require = createRequire(new URL('../../portal-frontend/package.json', import.meta.url));
  const QRCode = require('qrcode');
  const uri = `upi://pay?${new URLSearchParams({ pa: settings.upiId, pn: settings.businessName, cu: 'INR' })}`;
  const image = await QRCode.toBuffer(uri, { width: 768, margin: 4, errorCorrectionLevel: 'H' });
  const form = new FormData();
  form.set('qrCode', new Blob([image], { type: 'image/png' }), 'divisha-payment-qr.png');
  await request('/admin/settings', admin.token, form, 'PUT');
}
const paymentSettings = await request('/admin/settings/public');
if (paymentSettings.qrCodeUrl) {
  const image = await fetch(paymentSettings.qrCodeUrl, { signal: AbortSignal.timeout(60000) });
  assert.equal(image.status, 200, 'Payment QR is unavailable');
  assert.match(image.headers.get('content-type'), /^image\//);
  assert.ok((await image.arrayBuffer()).byteLength > 1000);
}
const results = {};
const today = new Date();
const scheduleDate = today.toISOString().slice(0, 10);
for (const route of ['/auth/profile', '/admin/dashboard', '/admin/customers', '/appointments/admin/all',
  `/appointments/calendar?month=${today.getUTCMonth() + 1}&year=${today.getUTCFullYear()}`,
  `/appointments/schedule?date=${scheduleDate}`,
  '/payments/all', '/admin/settings', '/admin/notifications', '/admin/notifications/unread-count']) {
  await request(route, admin.token);
  results[route] = 'ok';
}
const forbidden = await fetch(`${base}/api/payments/all`);
assert.equal(forbidden.status, 401);
const cors = await fetch(`${base}/api/health`, { headers: { Origin: 'https://divishamakeovers.com' } });
assert.equal(cors.headers.get('access-control-allow-origin'), 'https://divishamakeovers.com');
console.log(JSON.stringify({ backend: base, frontend, proxy: 'ok', health, serviceCount: services.length,
  upi: paymentSettings.upiId, qrCodeUrl: paymentSettings.qrCodeUrl, checks: results }, null, 2));
if (process.env.CHECK_EMAIL_RELAY === 'true' || process.argv.includes('--email')) {
  const body = JSON.stringify({ verifyOnly: true });
  const timestamp = String(Date.now());
  const signature = createHmac('sha256', process.env.EMAIL_RELAY_SECRET)
    .update(`${timestamp}.${body}`).digest('hex');
  const response = await fetch(process.env.EMAIL_RELAY_URL, {
    method: 'POST', body,
    headers: { 'Content-Type': 'application/json', 'X-Email-Timestamp': timestamp, 'X-Email-Signature': signature },
    signal: AbortSignal.timeout(30000),
  });
  console.log('SMTP relay verification:', response.status, await response.text());
  assert.equal(response.status, 200);
}

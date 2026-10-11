import assert from 'node:assert/strict';
import { getPortalRole, loadSession, saveSession, clearSession } from '../src/utils/authSession.js';
import { buildUpiLink, googlePayLink, createUpiReference, buildUpiPaymentRequest } from '../src/utils/upi.js';

const values = new Map();
const storage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
};
const admin = { role: 'admin', email: 'owner@example.invalid', token: 'test-admin-token' };
const customer = { role: 'customer', email: 'client@example.invalid', token: 'test-customer-token' };
storage.setItem('token', admin.token);
storage.setItem('user', JSON.stringify(admin));
assert.deepEqual(loadSession('customer', storage), { user: null, token: null }, 'An existing admin login must not sign in the customer portal');
assert.equal(loadSession('admin', storage).token, admin.token, 'Existing admin login is preserved in the admin portal');
assert.equal(storage.getItem('token'), null);
saveSession('customer', customer, storage);
assert.equal(loadSession('customer', storage).token, customer.token);
assert.equal(loadSession('admin', storage).token, admin.token, 'Customer sign-in must not overwrite the admin session');
assert.throws(() => saveSession('customer', admin, storage), /Incorrect account type/);
clearSession('customer', storage);
assert.equal(loadSession('customer', storage).token, null);
assert.equal(loadSession('admin', storage).token, admin.token, 'Customer logout must not clear the admin session');
saveSession('customer', customer, storage);
clearSession('admin', storage);
assert.equal(loadSession('customer', storage).token, customer.token, 'Admin logout must not clear the customer session');
storage.setItem('divisha.customer.user', JSON.stringify(admin));
assert.equal(loadSession('customer', storage).token, null, 'A mismatched saved role must not be reused');
storage.setItem('divisha.customer.user', '{invalid');
assert.equal(loadSession('customer', storage).token, null);
for (const path of ['/portal/divisha/dashboard', '/divisha/login', '/', '/portal/administrator']) {
  assert.equal(getPortalRole(path), 'customer');
}
for (const path of ['/portal/admin/login', '/admin', '/portal/admin/change-password']) {
  assert.equal(getPortalRole(path), 'admin');
}
const link = buildUpiLink({ upiId: 'business@example', businessName: 'Test & Makeup', amount: 2500.5, reference: 'TEST-123' });
const query = new URLSearchParams(link.split('?')[1]);
assert.equal(query.get('pa'), 'business@example');
assert.equal(query.get('pn'), 'Test & Makeup');
assert.equal(query.get('am'), '2500.50');
assert.equal(query.get('cu'), 'INR');
assert.equal(query.get('tn'), 'Divisha Makeovers TEST-123');
assert.equal(query.get('tr'), null, 'A personal QR must not present a booking ID as a merchant transaction ID');
assert.ok(!link.includes('+'), 'UPI labels use percent encoding for spaces across apps');
assert.ok(link.startsWith('upi://pay?'));
assert.equal(googlePayLink(link).split('?')[1], link.split('?')[1]);
for (const amount of [0, -1, 'invalid', Infinity]) assert.equal(buildUpiLink({ upiId: 'test@example', amount }), '');
assert.equal(buildUpiLink({ amount: 100 }), '');
const settings = { upiId: 'merchant@example', businessName: 'Test & Makeup', upiIntentEnabled: true, merchantCategoryCode: '7298' };
const firstReference = createUpiReference();
assert.match(firstReference, /^[a-z\d]{1,35}$/i);
assert.notEqual(firstReference, createUpiReference(), 'New requests have unique references, including installments for one booking');
const request = buildUpiPaymentRequest({ settings, amount: 255, reference: 'BOOKING-1', transactionReference: firstReference });
assert.equal(request.qrLink, request.appLink, 'QR and app launch use the same merchant payment request');
const merchantQuery = new URLSearchParams(request.appLink.split('?')[1]);
assert.equal(merchantQuery.get('am'), '255.00', 'Small amounts are preserved exactly');
assert.equal(merchantQuery.get('mc'), '7298');
assert.equal(merchantQuery.get('tr'), firstReference);
assert.equal(merchantQuery.get('tn'), 'Divisha Makeovers BOOKING-1');
const android = googlePayLink(request.appLink, 'Mozilla/5.0 Android');
assert.ok(android.startsWith('intent://pay?'));
assert.ok(android.endsWith('#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end'));
assert.equal(android.split('?')[1].split('#')[0], request.appLink.split('?')[1]);
assert.ok(googlePayLink(request.appLink, 'iPhone').startsWith('gpay://upi/pay?'));
for (const overrides of [{ upiIntentEnabled: false }, { merchantCategoryCode: '' }, { merchantCategoryCode: '0000' }, { merchantCategoryCode: 'invalid' }]) {
  const manual = buildUpiPaymentRequest({ settings: { ...settings, ...overrides }, amount: 255, transactionReference: firstReference });
  assert.equal(manual.appLink, '', 'Unconfigured merchant checkout must not launch an unsupported app payment');
  assert.ok(manual.qrLink.startsWith('upi://pay?'), 'Manual QR payment remains available');
  assert.equal(new URLSearchParams(manual.qrLink.split('?')[1]).get('mc'), null);
}
assert.equal(buildUpiPaymentRequest({ settings, amount: 0, transactionReference: firstReference }).appLink, '');
console.log('PASS: isolated portal sessions; exact INR 255 amounts; merchant MCC and unique references; matching QR/app requests; Android/iOS launch formats; manual fallback without fabricated merchant details.');

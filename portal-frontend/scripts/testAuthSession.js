import assert from 'node:assert/strict';
import { getPortalRole, loadSession, saveSession, clearSession } from '../src/utils/authSession.js';
import { buildUpiLink, googlePayLink } from '../src/utils/upi.js';

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
assert.equal(query.get('tr'), 'TEST-123');
assert.ok(link.startsWith('upi://pay?'));
assert.equal(googlePayLink(link).split('?')[1], link.split('?')[1]);
for (const amount of [0, -1, 'invalid', Infinity]) assert.equal(buildUpiLink({ upiId: 'test@example', amount }), '');
assert.equal(buildUpiLink({ amount: 100 }), '');
console.log('PASS: separate customer/admin sessions and UPI links preserve payee, amount, currency, and booking reference; invalid amounts cannot launch a payment.');

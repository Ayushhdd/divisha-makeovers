import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import nodemailer from 'nodemailer';
import { POST } from '../src/app/api/backend-email/route.js';

process.env.EMAIL_RELAY_SECRET = 'isolated-relay-test-secret';
process.env.SMTP_HOST = 'smtp.example.invalid';
process.env.SMTP_USER = 'sender@example.invalid';
process.env.SMTP_PASS = 'test-only-password';
let verified = 0;
let sent;
const original = nodemailer.createTransport;
nodemailer.createTransport = () => ({
  verify: async () => { verified++; },
  sendMail: async message => { sent = message; return { accepted: [message.to], rejected: [] }; },
});
const request = (payload, { timestamp = String(Date.now()), signature, unsigned = false } = {}) => {
  const body = JSON.stringify(payload);
  const headers = unsigned ? {} : {
    'x-email-timestamp': timestamp,
    'x-email-signature': signature || createHmac('sha256', process.env.EMAIL_RELAY_SECRET)
      .update(`${timestamp}.${body}`).digest('hex'),
  };
  return new Request('https://example.invalid/api/backend-email', { method: 'POST', headers, body });
};
try {
  assert.equal((await POST(request({ verifyOnly: true }, { unsigned: true }))).status, 401);
  assert.equal((await POST(request({ verifyOnly: true }, { signature: '0'.repeat(64) }))).status, 401);
  assert.equal((await POST(request({ verifyOnly: true }, { timestamp: String(Date.now() - 120000) }))).status, 401);
  assert.equal(verified, 0);
  assert.equal((await POST(request({ verifyOnly: true }))).status, 200);
  assert.equal(verified, 1);
  assert.equal(sent, undefined);
  assert.equal((await POST(request({ to: 'bad\r\nrecipient', subject: 'Test', html: 'Test' }))).status, 400);
  assert.equal((await POST(request({ to: 'customer@example.invalid', subject: 'Test', html: '<p>Test</p>' }))).status, 200);
  assert.equal(sent.to, 'customer@example.invalid');
  nodemailer.createTransport = () => ({ sendMail: async () => ({ accepted: [], rejected: ['customer@example.invalid'] }) });
  assert.equal((await POST(request({ to: 'customer@example.invalid', subject: 'Test', html: '<p>Test</p>' }))).status, 502);
  assert.equal((await POST(request({ html: 'x'.repeat(33000) }))).status, 413);
  console.log('PASS: email relay rejects unsigned, tampered, expired and oversized requests; SMTP verification sends no email; authenticated valid delivery works with a stub transport.');
} finally {
  nodemailer.createTransport = original;
}

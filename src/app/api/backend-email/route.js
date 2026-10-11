import { createHmac, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Render Free cannot connect to SMTP. Only signed requests from our backend
// can use this relay; browser clients never receive the shared secret.
export async function POST(request) {
  const secret = process.env.EMAIL_RELAY_SECRET;
  if (!secret) return Response.json({ error: 'Email is not configured' }, { status: 503 });
  const timestamp = request.headers.get('x-email-timestamp') || '';
  const signature = request.headers.get('x-email-signature') || '';
  if (!/^\d{13}$/.test(timestamp) || Math.abs(Date.now() - Number(timestamp)) > 60000 ||
      !/^[a-f0-9]{64}$/.test(signature)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.text();
  if (Buffer.byteLength(body) > 32768) return Response.json({ error: 'Too large' }, { status: 413 });
  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { to, subject, html, verifyOnly } = JSON.parse(body);
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return Response.json({ error: 'Email is not configured' }, { status: 503 });
    }
    const port = Number(process.env.SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port, secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    });
    if (verifyOnly === true) {
      await transporter.verify();
      return Response.json({ ok: true });
    }
    if (typeof to !== 'string' || !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(to) ||
        typeof subject !== 'string' || !subject || subject.length > 200 || /[\r\n]/.test(subject) ||
        typeof html !== 'string' || html.length > 24000) {
      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER, to, subject, html,
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error('[backend-email] Delivery failed:', error.code || 'unknown');
    return Response.json({ error: 'Email could not be sent' }, { status: 502 });
  }
}

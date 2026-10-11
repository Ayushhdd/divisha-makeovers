import nodemailer from 'nodemailer';
import { createHmac } from 'node:crypto';

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  if (process.env.EMAIL_RELAY_URL && process.env.EMAIL_RELAY_SECRET) {
    try {
      const body = JSON.stringify({ to, subject, html });
      const timestamp = String(Date.now());
      const signature = createHmac('sha256', process.env.EMAIL_RELAY_SECRET)
        .update(`${timestamp}.${body}`).digest('hex');
      const response = await fetch(process.env.EMAIL_RELAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Email-Timestamp': timestamp,
          'X-Email-Signature': signature,
        },
        body,
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) throw new Error(`Email relay returned ${response.status}`);
      return { success: true };
    } catch (error) {
      console.error('Email relay failed:', error.message);
      return { success: false, error: 'Email could not be sent. Please try again later.' };
    }
  }
  const transporter = createTransporter();
  if (!transporter) {
    console.error(`[Email not sent - SMTP is incomplete] To: ${to}, Subject: ${subject}`);
    return {
      success: false,
      error: 'Email service is not configured. Please contact Divisha Makeovers.',
    };
  }
  try {
    const delivery = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    if (!delivery?.accepted?.length || delivery.rejected?.length) {
      throw new Error('Recipient was not accepted by the email provider');
    }
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendOTPEmail = async (email, otp, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #b76e79;">Divisha Makeovers</h2>
      <p>Hello ${name || 'there'},</p>
      <p>Your password reset OTP is:</p>
      <h1 style="color: #b76e79; letter-spacing: 8px;">${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: 'Password Reset OTP - Divisha Makeovers',
    html,
  });
};

export const sendBookingConfirmation = async (email, name, bookingRef, date, time) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #b76e79;">Booking Confirmed!</h2>
      <p>Dear ${name},</p>
      <p>Your appointment has been confirmed.</p>
      <p><strong>Reference:</strong> ${bookingRef}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p>Thank you for choosing Divisha Makeovers!</p>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: `Booking Confirmed - ${bookingRef}`,
    html,
  });
};

export const sendAppointmentReminder = async (email, name, date, time, venue) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #b76e79;">Appointment Reminder</h2>
      <p>Dear ${name},</p>
      <p>This is a reminder for your upcoming appointment.</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Venue:</strong> ${venue}</p>
      <p>We look forward to seeing you!</p>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: 'Appointment Reminder - Divisha Makeovers',
    html,
  });
};

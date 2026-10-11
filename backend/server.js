import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { startReminderJob } from './utils/reminderJob.js';
import { startPaymentScreenshotCleanupJob } from './utils/paymentScreenshotCleanup.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import User from './models/User.js';
import Service from './models/Service.js';
import AdminSettings from './models/AdminSettings.js';
import { seedServiceCatalog } from './data/serviceCatalog.js';
import { serveStoredImage } from './utils/imageStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await connectDB();
startReminderJob();
const isCleanupEnabled =
  process.env.ENABLE_PAYMENT_SCREENSHOT_CLEANUP !== 'false' &&
  !['development', 'test'].includes(process.env.NODE_ENV);
if (isCleanupEnabled) {
  startPaymentScreenshotCleanupJob();
}

// Auto-seed admin user on startup
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        fullName: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@divishamakeovers.com',
        mobile: '9999999999',
        password: process.env.ADMIN_PASSWORD || 'ChangeMe@123',
        role: 'admin',
        address: {
          line1: 'Admin Office',
          district: 'Default',
          state: 'Default',
          postalCode: '000000',
        },
      });
      console.log('✓ Admin created successfully');
      console.log(`  Email: ${process.env.ADMIN_EMAIL || 'admin@divishamakeovers.com'}`);
    } else {
      console.log('✓ Admin already exists');
    }

    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(seedServiceCatalog);
      console.log('✓ Default services seeded');
    }

    const settings = await AdminSettings.findOne();
    if (!settings) {
      await AdminSettings.create({
        upiId: process.env.INITIAL_UPI_ID || '',
        businessEmail: process.env.INITIAL_BUSINESS_EMAIL || '',
      });
      console.log('✓ Admin settings initialized');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

await seedAdmin();

const app = express();
// The hosting provider terminates HTTPS before forwarding the request.
app.set('trust proxy', 1);
const localOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const configuredOrigins = (
  process.env.CLIENT_URL || 'https://divisha-makeovers-zeta.vercel.app'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...configuredOrigins, ...localOrigins]));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin?.replace(/\/$/, '');
      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, 'uploads');
app.get('/uploads/:filename', serveStoredImage);
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'unavailable',
    app: 'Divisha Makeovers API',
    database: ready ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

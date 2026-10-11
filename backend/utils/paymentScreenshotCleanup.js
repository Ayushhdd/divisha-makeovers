import fs from 'fs/promises';
import path from 'path';
import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import { uploadDir } from '../middleware/upload.js';
import { removeStoredImage } from './imageStorage.js';

const retentionDays = () => {
  const configuredDays = Number.parseInt(process.env.PAYMENT_SCREENSHOT_RETENTION_DAYS, 10);
  return Number.isFinite(configuredDays) && configuredDays >= 1 ? configuredDays : 7;
};

export const cleanupPaymentScreenshots = async () => {
  const days = retentionDays();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const reviewedPayments = await Payment.find({
      status: { $in: ['verified', 'rejected'] },
      screenshot: { $nin: ['', null] },
      verifiedAt: { $lte: cutoff },
    }).select('_id appointment screenshot');

    let cleared = 0;
    for (const payment of reviewedPayments) {
      const filename = payment.screenshot;

      // Stored uploads are file names. Never let database content resolve to a
      // path outside the controlled uploads directory.
      if (!filename.startsWith('http') && path.basename(filename) === filename) {
        try {
          await removeStoredImage(filename);
          await fs.unlink(path.join(uploadDir, filename));
        } catch (error) {
          if (error.code !== 'ENOENT') {
            console.error(`Could not remove payment screenshot ${payment._id}:`, error.message);
            continue;
          }
        }
      }

      await Payment.updateOne({ _id: payment._id }, { $set: { screenshot: '' } });
      await Appointment.updateOne(
        { _id: payment.appointment, paymentScreenshot: filename },
        { $set: { paymentScreenshot: '' } }
      );
      cleared += 1;
    }

    if (cleared > 0) {
      console.log(`Payment screenshot cleanup: removed ${cleared} reviewed screenshot(s) older than ${days} days.`);
    }
  } catch (error) {
    console.error('Payment screenshot cleanup error:', error.message);
  }
};

export const startPaymentScreenshotCleanupJob = () => {
  cleanupPaymentScreenshots();
  setInterval(cleanupPaymentScreenshots, 24 * 60 * 60 * 1000);
};

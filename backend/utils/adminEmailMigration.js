import mongoose from 'mongoose';
import User from '../models/User.js';

// One-time correction of the existing owner's login identifier. This never
// creates an account, changes its role, or reads/writes its password hash.
export const migrateAdminEmail = async ({ legacyEmail, targetEmail, migrationId }) => {
  const migrations = mongoose.connection.collection('maintenanceMigrations');
  if (await migrations.findOne({ _id: migrationId }, { projection: { _id: 1 } })) return;
  const target = String(targetEmail || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(target) || target === legacyEmail) {
    throw new Error('Admin email correction requires a valid replacement email.');
  }

  const source = await User.findOne({ role: 'admin', email: legacyEmail }).select('_id email').lean();
  const destination = await User.findOne({ email: target }).select('_id role').lean();
  if (destination && (!source || String(destination._id) !== String(source._id))) {
    if (source || destination.role !== 'admin') {
      throw new Error('Admin email correction conflicts with an existing account. No accounts were changed.');
    }
    // Recover safely if the process stopped after updating the account but
    // before recording completion, or if the owner already corrected it.
  } else if (source) {
    const result = await User.updateOne({ _id: source._id, role: 'admin', email: legacyEmail }, {
      $set: { email: target }, $inc: { sessionVersion: 1 },
      $unset: { otp: 1, otpExpires: 1, otpAttempts: 1 },
    });
    if (result.modifiedCount !== 1) throw new Error('Admin email correction could not be completed.');
  } else {
    throw new Error('Admin email correction could not locate the existing owner account.');
  }
  await migrations.updateOne({ _id: migrationId }, { $setOnInsert: {
    completedAt: new Date(),
  } }, { upsert: true });
  console.log('Admin login email correction completed; existing password preserved.');
};

import User from '../models/User.js';

// Bootstrap is only for a new database. Existing logins are managed in the portal.
export const ensureAdminAccount = async () => {
  if (await User.exists({ role: 'admin' })) return;
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' ||
      password.length < 11 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('A new database requires ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 11 characters (maximum 72 UTF-8 bytes). No default admin login is available.');
  }
  await User.create({
    fullName: 'Admin', email, mobile: '9999999999', password, role: 'admin',
    address: { line1: 'Admin Office', district: 'Default', state: 'Default', postalCode: '000000' },
  });
  console.log('Admin account initialized');
};

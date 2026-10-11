import dotenv from 'dotenv';
import { ensureAdminAccount } from '../utils/adminBootstrap.js';
import Service from '../models/Service.js';
import AdminSettings from '../models/AdminSettings.js';
import connectDB from '../config/db.js';
import { seedServiceCatalog } from '../data/serviceCatalog.js';

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  await ensureAdminAccount();

  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(seedServiceCatalog);
    console.log('Default services seeded');
  }

  const settings = await AdminSettings.findOne();
  if (!settings) {
    await AdminSettings.create({});
    console.log('Admin settings initialized');
  }

  console.log('Seed completed');
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});

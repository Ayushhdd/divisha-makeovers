import jwt from 'jsonwebtoken';
import { randomInt } from 'node:crypto';

export const generateToken = (id, rememberMe = false, sessionVersion = 0) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRE || '30d'
    : process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id, sessionVersion }, process.env.JWT_SECRET, { expiresIn });
};

export const generateOTP = () => {
  return randomInt(100000, 1000000).toString();
};

export const generateBookingRef = () => {
  const date = new Date();
  const prefix = 'DM';
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${dateStr}${random}`;
};

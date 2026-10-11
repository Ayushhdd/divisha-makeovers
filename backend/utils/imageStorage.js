import fs from 'node:fs/promises';
import path from 'node:path';
import UploadedImage from '../models/UploadedImage.js';

export const usesDatabaseUploads = () => process.env.UPLOAD_STORAGE === 'mongodb';

export const persistImage = async (filePath) => {
  if (!usesDatabaseUploads()) return;
  const data = await fs.readFile(filePath);
  await UploadedImage.updateOne(
    { filename: path.basename(filePath) },
    { $set: { data, contentType: 'image/jpeg' } },
    { upsert: true }
  );
  // The local file is only staging; the database write must succeed first.
  await fs.unlink(filePath);
};

export const serveStoredImage = async (req, res, next) => {
  if (!usesDatabaseUploads()) return next();
  const filename = req.params.filename;
  if (path.basename(filename) !== filename) return res.sendStatus(404);
  try {
    const image = await UploadedImage.findOne({ filename }).select('+data');
    if (!image) return next();
    res.set('Cache-Control', 'private, max-age=300');
    res.type(image.contentType).send(image.data);
  } catch (error) {
    next(error);
  }
};

export const removeStoredImage = async (filename) => {
  if (usesDatabaseUploads()) await UploadedImage.deleteOne({ filename });
};

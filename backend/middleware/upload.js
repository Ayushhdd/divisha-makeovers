import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { persistImage } from '../utils/imageStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Every accepted image is compressed to JPEG immediately after upload, so
    // give it a matching extension from the beginning.
    cb(null, `${uuidv4()}.jpg`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

export const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter,
});

export const compressImage = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const outputPath = filePath.replace(ext, `-compressed${ext}`);
  await sharp(filePath)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
  fs.unlinkSync(filePath);
  fs.renameSync(outputPath, filePath);
  await persistImage(filePath);
  return filePath;
};

export const getFileUrl = (filename, req) => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  const base = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${filename}`;
};

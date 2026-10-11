import mongoose from 'mongoose';

// Compressed images are bounded by the upload limit and fit in a MongoDB document.
// Keep them in the existing database so free hosting can safely discard local files.
const uploadedImageSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true },
  contentType: { type: String, default: 'image/jpeg' },
  data: { type: Buffer, required: true, select: false },
}, { timestamps: true });

export default mongoose.model('UploadedImage', uploadedImageSchema);

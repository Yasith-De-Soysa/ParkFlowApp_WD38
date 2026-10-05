import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

const uploadDirectory = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, safeName);
  },
});

const imageOnly = (_req, file, callback) => {
  if (file.mimetype.startsWith('image/')) {
    callback(null, true);
    return;
  }
  callback(new Error('Only image files are allowed.'), false);
};

export const uploadAvatar = multer({
  storage,
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024 },
});

import multer from 'multer';

const storage = multer.memoryStorage();

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

export const uploadFacilityImage = uploadAvatar;

export const imageDataUrl = (file) => {
  if (!file) {
    return undefined;
  }
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

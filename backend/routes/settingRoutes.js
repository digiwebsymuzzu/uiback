// routes/settingRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔹 Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/logo'); // save inside uploads/logo
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

// 🔹 File filter (only images allowed)
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

// GET settings
router.get('/', authMiddleware, getSettings);

// POST update settings (with optional logo upload)
router.post(
  '/update',
  authMiddleware,
  upload.single('logo'), // expects form-data with `logo` field
  updateSettings
);

export default router;
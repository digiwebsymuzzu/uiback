import express from 'express';
import multer from 'multer';
import { importCategories, getCategories, deleteCategory, updateStatus, addCategory, updateCategory } from '../controllers/categoryController.js';

const router = express.Router();

// Multer storage for category image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/category'); // folder must exist
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// POST /api/categories/import
router.post('/import', upload.single('file'), importCategories);

// GET categories
router.get('/', getCategories);

// POST Add category
router.post('/', upload.single('cat_img'), addCategory);

// Edit Category
router.put('/edit/:id', upload.single('cat_img'), updateCategory);

// DELETE category
router.delete('/:id', deleteCategory);

// UPDATE status
router.put('/:id', updateStatus);

export default router;

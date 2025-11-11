import express from 'express'
import {
  getTags,
  addTag,
  updateTag,     
  updateTagStatus, 
  deleteTag,
  importTags,
} from '../controllers/tagsController.js'
import multer from "multer";

const router = express.Router()

// Multer storage for tags CSV (temporary uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/tags"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// POST /api/tags/import
router.post("/import", upload.single("file"), importTags);

// GET all tags
router.get('/', getTags)

// POST new tag
router.post('/', addTag)

// PUT update tag (Edit form)
router.put('/edit/:id', updateTag)

// PUT update status (Status toggle)
router.put('/status/:id', updateTagStatus)

// DELETE single tag
router.delete('/:id', deleteTag)

export default router
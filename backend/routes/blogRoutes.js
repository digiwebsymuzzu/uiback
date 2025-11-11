import express from 'express'
import multer from 'multer'
import path from 'path'

import {
  createBlogPost,
  getAllBlogs,
  blogdelete,
  updateBlog,
  updateBlogStatus,
} from '../controllers/BlogController.js'

const router = express.Router()

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/blogs/') // ✅ images uploads/blogs folder me save hongi
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)) // unique file name
  },
})
const upload = multer({ storage })

// ✅ Create blog (with image upload)
router.post('/', upload.single('blogImage'), createBlogPost)

// ✅ Get all blogs
router.get('/', getAllBlogs)

// ✅ Delete blog by id
router.delete('/:id', blogdelete)

// ✅ Update blog (with image upload)
router.put('/:id', upload.single('blogImage'), updateBlog)

router.patch('/:id', updateBlogStatus)

export default router

import express from 'express'
import multer from 'multer'
import path from 'path'

import {
  createblogcategory,
  getAllCategory,
  categorydelete,
  updatecategory,
  updatecategoryStatus,
} from '../controllers/BlogcategoryController.js'
const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/categoryblogs/') // ✅ images uploads/blogs folder me save hongi
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)) // unique file name
  },
})
const upload = multer({ storage })

// POST blog category
router.post('/', upload.single('categoryImage'), createblogcategory)

//Get All Category
router.get('/', getAllCategory)

//Delete Category
router.delete('/:id', categorydelete)

//Update Category

router.put('/:id', upload.single('categoryImage'), updatecategory)

router.patch('/:id', updatecategoryStatus)

export default router

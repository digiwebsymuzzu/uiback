import express from 'express'
import multer from 'multer'
import {
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
  updateBrandStatus,
} from '../controllers/brandController.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/brand') // folder must exist
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  },
})
const upload = multer({ storage })

// GET brands
router.get('/', getBrands)

// POST brand
router.post('/', upload.single('brand_img'), addBrand)

// PUT brand
router.put('/edit/:id', upload.single('brand_img'), updateBrand)

// DELETE brand
router.delete('/:id', deleteBrand)

// UPDATE status
router.put('/:id', updateBrandStatus)

export default router

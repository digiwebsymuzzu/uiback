import express from 'express'
import multer from 'multer'
import {
  createProduct,
  getProducts,
  deleteProducts,
  updateProductsStatus,
  updateProduct,
  importProductsFromCSV,
} from '../controllers/productController.js'

const router = express.Router()

console.log('[PRODUCT ROUTES] Loaded - productRoutes.js:7')

// ---------------- Multer storage ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  },
})

const upload = multer({ storage })

// ---------------- Routes ----------------

// POST /api/products
// Handles both main/gallery images and attribute images
router.post(
  '/',
  upload.fields([
    { name: 'images', maxCount: 10 }, // main + gallery images
    { name: 'attrImages', maxCount: 50 }, // attribute images
  ]),
  createProduct,
)

// GET all products
router.get('/', getProducts)

// GET single product by ID (optional, useful for edit/view)
router.get('/:id', getProducts)

// DELETE
router.delete('/', deleteProducts)

// STATUS CHANGE
router.patch('/:id/status', updateProductsStatus)

// EDIT
router.put(
  '/:id',
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'attrImages', maxCount: 50 },
  ]),
  updateProduct,
)

// CSV Upload
// router.post('/import', upload.single('file'), importProductsFromCSV);

router.post(
  '/import',
  (req, res, next) => {
    console.log('[PRODUCT ROUTES] /import hit - productRoutes.js:63')
    next()
  },
  upload.single('file'),
  importProductsFromCSV,
)

export default router

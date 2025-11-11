import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'

// Routes
import userRoutes from './routes/userRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import settingRoutes from './routes/settingRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import brandRoutes from './routes/brandRoutes.js'
import tagRoutes from './routes/tagRoutes.js'
import attributeRoutes from './routes/attributeRoutes.js'
import productRoutes from './routes/productRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

// blogs
import createBlogPost from './routes/blogRoutes.js'
import getallblogs from './routes/blogRoutes.js'
import blogdelete from './routes/blogRoutes.js'
import updateBlog from './routes/blogRoutes.js'
import updateBlogStatus from './routes/blogRoutes.js'

import createblogcategory from './routes/blogcategoryRoutes.js'
import getAllCategory from './routes/blogcategoryRoutes.js'
import categorydelete from './routes/blogcategoryRoutes.js'
import updatecategory from './routes/blogcategoryRoutes.js'
import updatecategoryStatus from './routes/blogcategoryRoutes.js'
import createblogtag from './routes/BlogtagRoutes.js'
import getAlltag from './routes/BlogtagRoutes.js'
import tagdelete from './routes/BlogtagRoutes.js'
import updatetag from './routes/BlogtagRoutes.js'

//youtube
import createdewalt from './routes/dewaltyoutubeRoutes.js'
import getalldewalt from './routes/dewaltyoutubeRoutes.js'
import deletedewalt from './routes/dewaltyoutubeRoutes.js'
import updateyoutube from './routes/dewaltyoutubeRoutes.js'
import updateYoutubeStatus from './routes/dewaltyoutubeRoutes.js'
import createdsafety from './routes/safetyyoutubeRouts.js'
import getallsafety from './routes/safetyyoutubeRouts.js'
import deletesafety from './routes/safetyyoutubeRouts.js'
import updateyoutubesafety from './routes/safetyyoutubeRouts.js'
import updateStatus from './routes/safetyyoutubeRouts.js'
import createwelding from './routes/WeldingyoutubeRoutes.js'
import getallwelding from './routes/WeldingyoutubeRoutes.js'
import deletewelding from './routes/WeldingyoutubeRoutes.js'
import updatewelding from './routes/WeldingyoutubeRoutes.js'
import updateweldingStatus from './routes/WeldingyoutubeRoutes.js'
import createdannular from './routes/AnnularyoutubeRoutes.js'
import getallannular from './routes/AnnularyoutubeRoutes.js'
import deleteannular from './routes/AnnularyoutubeRoutes.js'
import updateyoutubeannular from './routes/AnnularyoutubeRoutes.js'
import updateStatusannular from './routes/AnnularyoutubeRoutes.js'

dotenv.config()
connectDB()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Debug: log every request
app.use((req, res, next) => {
  console.log('[INDEX] Incoming request: - index.js:31', req.method, req.path)
  next()
})

// CORS setup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://udemandme.cloud')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  )
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE')
    return res.status(204).end()
  }
  next()
})

// Serve static files (for uploaded logos)
app.use('/uploads/logo', express.static(path.join(__dirname, 'uploads/logo')))

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api', userRoutes) // Login
app.use('/api/profile', profileRoutes) // Profile
app.use('/api/settings', settingRoutes) // Settings
app.use('/api/categories', categoryRoutes) // Product Category
app.use('/api/brands', brandRoutes) // Product Brand
app.use('/api/tags', tagRoutes) // Product Tags
app.use('/api/attributes', attributeRoutes) // Product Attributes
app.use('/api/products', productRoutes) // Products
app.use('/api/reviews', reviewRoutes) // Reviews
app.use('/api/order', orderRoutes) // Order

app.use('/api/blog', createBlogPost)
app.use('/api/allblog', getallblogs)
app.use('/api/blogdelete', blogdelete)
app.use('/api/blogupdate', updateBlog)
app.use('/api/updatestatus', updateBlogStatus)

app.use('/api/postblogcategory', createblogcategory)
app.use('/api/allcategory', getAllCategory)
app.use('/api/deletecategory', categorydelete)
app.use('/api/updatecategory', updatecategory)
app.use('/api/updatecategorystatus', updatecategoryStatus)
app.use('/api/blogtag', createblogtag)
app.use('/api/getalltag', getAlltag)
app.use('/api/deletetag', tagdelete)
app.use('/api/tagupdate', updatetag)

app.use('/api/createdewalt', createdewalt)
app.use('/api/dewaltgetall', getalldewalt)
app.use('/api/deletedewaltyoutube', deletedewalt)
app.use('/api/updateyoutube', updateyoutube)
app.use('/api/updatestatusyutube', updateYoutubeStatus)
app.use('/api/postsafety', createdsafety)
app.use('/api/safetyallget', getallsafety)
app.use('/api/safetydelete', deletesafety)
app.use('/api/updateyoutubesafety', updateyoutubesafety)
app.use('/api/safetystatus', updateStatus)
app.use('/api/weldingpost', createwelding)
app.use('/api/getallwelding', getallwelding)
app.use('/api/deletewelding', deletewelding)
app.use('/api/updatewelding', updatewelding)
app.use('/api/updateweldingstatus', updateweldingStatus)
app.use('/api/postannular', createdannular)
app.use('/api/annularget', getallannular)
app.use('/api/annulardelete', deleteannular)
app.use('/api/annularupdate', updateyoutubeannular)
app.use('/api/annularupdatestatus', updateStatusannular)

// 404 fallback
app.use((req, res) => {
  console.log('[INDEX] Route not found: - index.js:68', req.method, req.path)
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT} - index.js:73`))

app.listen(PORT, () => {
  console.log(`http://udemandme.cloud/ server is running on ${PORT}`)
})

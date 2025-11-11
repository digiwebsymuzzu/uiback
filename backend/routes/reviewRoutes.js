// routes/reviewRoutes.js
import express from 'express'
import {
  getReviews,
  replyReview,
  deleteReview,
} from '../controllers/reviewController.js'

const router = express.Router()


router.get('/', getReviews)


// ✅ PATCH reply to a review
router.put('/reply/:id', replyReview)

// ✅ DELETE a review
router.delete('/:id', deleteReview)

export default router
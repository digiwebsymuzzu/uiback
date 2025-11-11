import express from 'express'

import {
  createdewalt,
  getalldewalt,
  deletedewalt,
  updateyoutube,
  updateYoutubeStatus,
} from '../controllers/Dewaltyoutube.js'
const router = express.Router()

// POST Youtube
router.post('/', createdewalt)
// Get Youtube
router.get('/', getalldewalt)
// delete youtubr
router.delete('/:id', deletedewalt)
router.put('/:id', updateyoutube)
router.patch('/:id', updateYoutubeStatus)

export default router

import express from 'express'

import {
  createdannular,
  getallannular,
  deleteannular,
  updateyoutubeannular,
  updateStatusannular,
} from '../controllers/Annularyoutube.js'
const router = express.Router()

// POST Youtube
router.post('/', createdannular)
// Get Youtube
router.get('/', getallannular)
// // delete youtubr
router.delete('/:id', deleteannular)
router.put('/:id', updateyoutubeannular)
router.patch('/:id', updateStatusannular)

export default router

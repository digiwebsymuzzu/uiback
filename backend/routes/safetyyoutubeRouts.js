import express from 'express'

import {
  createdsafety,
  getallsafety,
  deletesafety,
  updateyoutubesafety,
  updateStatus,
} from '../controllers/Safetyyoutube.js'
const router = express.Router()

// POST Youtube
router.post('/', createdsafety)
router.get('/', getallsafety)
router.delete('/:id', deletesafety)
router.put('/:id', updateyoutubesafety)
router.patch('/:id', updateStatus)

export default router

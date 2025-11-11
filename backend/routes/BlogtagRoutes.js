import express from 'express'

import { createblogtag, getAlltag, tagdelete, updatetag } from '../controllers/BlogtagController.js'
const router = express.Router()

// POST Tag
router.post('/', createblogtag)
// Get Tag
router.get('/', getAlltag)
// Delete Tag
router.delete('/:id', tagdelete)
// Update Tag
router.put('/:id', updatetag)

export default router

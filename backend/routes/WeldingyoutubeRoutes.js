import express from 'express'

import {
  createwelding,
  getallwelding,
  deletewelding,
  updatewelding,
  updateweldingStatus,
} from '../controllers/weldingtechnique.js'
const router = express.Router()

// POST Youtube
router.post('/', createwelding)
router.get('/', getallwelding)
router.delete('/:id', deletewelding)
router.put('/:id', updatewelding)
router.patch('/:id', updateweldingStatus)

export default router

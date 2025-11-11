import express from 'express'
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  deleteMultipleOrders,
} from '../controllers/orderController.js'

const router = express.Router()

router.get('/', getOrders)
router.patch('/:id/status', updateOrderStatus)
router.delete('/:id', deleteOrder)
router.post('/delete-multiple', deleteMultipleOrders)

export default router

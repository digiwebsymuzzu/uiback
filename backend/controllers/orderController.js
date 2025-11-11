import Order from '../models/Order.js'

/**
 * @desc   Get all orders (with optional search & pagination)
 * @route  GET /api/order
 */
export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query

    const query = search
      ? {
          $or: [
            { 'user.firstName': { $regex: search, $options: 'i' } },
            { 'user.lastName': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    const total = await Order.countDocuments(query)

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: orders,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @desc   Update order status
 * @route  PUT /api/order/status/:id
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) return res.status(400).json({ success: false, message: 'Status is required' })

    const order = await Order.findByIdAndUpdate(
      id,
      {
        status,
        $push: {
          statusHistory: { status },
        },
      },
      { new: true },
    )

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @desc   Delete single order
 * @route  DELETE /api/order/:id
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params

    const order = await Order.findByIdAndDelete(id)

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    res.status(200).json({ success: true, message: 'Order deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @desc   Bulk delete orders
 * @route  POST /api/order/delete-multiple
 * @body   { ids: ["id1","id2","id3"] }
 */
export const deleteMultipleOrders = async (req, res) => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No order IDs provided' })
    }

    const result = await Order.deleteMany({ _id: { $in: ids } })

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} orders deleted successfully`,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

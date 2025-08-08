import express from 'express'
import { PrismaClient } from '@prisma/client'
import { adminMiddleware } from '../middleware/roleMiddleware.js'
import { v4 as uuidv4 } from 'uuid'
const router = express.Router()
const prisma = new PrismaClient()
const tranId = uuidv4()
// Place order (checkout)
router.post('/checkout', async (req, res) => {
  const userId = req.user.id

  try {
    // Find user cart with items and products (for price)
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.quantity * Number(item.product.price)
    }, 0)

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        totalAmount,
        tranId,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price
          }))
        }
      },
      include: { items: true }
    })

    // Clear cart items
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    res.json({ message: 'Order placed successfully', order })
  } catch (error) {
    console.error('Order placement error:', error)
    res.status(500).json({ error: 'Failed to place order' })
  }
})

// Get all orders for user
router.get('/', async (req, res) => {
  const userId = req.user.id
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } }
    })
    res.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})
// Update order status
router.put('/:orderId/status', adminMiddleware, async (req, res) => {
  const { orderId } = req.params
  const { status } = req.body

  const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' })
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status }
    })
    res.json({ message: 'Order status updated', updatedOrder })
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})
// Admin: Get all orders
router.get('/all', adminMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    })
    res.json(orders)
  } catch (error) {
    console.error('Error fetching all orders:', error)
    res.status(500).json({ error: 'Failed to fetch all orders' })
  }
})

export default router

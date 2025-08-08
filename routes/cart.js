// routes/cart.js
import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Middleware to check if user is logged in (based on req.user)
const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: Please login' })
  }
  next()
}

// GET /api/cart
router.get('/', requireAuth, async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } }
    })

    res.json(cart || { items: [] }) // Always return structure
  } catch (error) {
    console.error('Error getting cart:', error)
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// POST /api/cart/add
router.post('/add', requireAuth, async (req, res) => {
  const { productId, quantity } = req.body

  if (!productId || !quantity) {
    return res.status(400).json({ error: 'productId and quantity required' })
  }

  try {
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } })
    }

    let cartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    })

    if (cartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity + quantity }
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity }
      })
    }

    res.json({ message: 'Item added to cart', cartItem })
  } catch (error) {
    console.error('Error adding to cart:', error)
    res.status(500).json({ error: 'Failed to add item to cart' })
  }
})

// PUT /api/cart/update/:itemId
router.put('/update/:itemId', requireAuth, async (req, res) => {
  const { itemId } = req.params
  const { quantity } = req.body
  if (quantity <= 0) return res.status(400).json({ error: 'Quantity must be > 0' })

  try {
    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity }
    })
    res.json({ message: 'Cart item updated', updatedItem })
  } catch (error) {
    console.error('Error updating cart item:', error)
    res.status(500).json({ error: 'Failed to update cart item' })
  }
})

// DELETE /api/cart/remove/:itemId
router.delete('/remove/:itemId', requireAuth, async (req, res) => {
  const { itemId } = req.params

  try {
    await prisma.cartItem.delete({ where: { id: parseInt(itemId) } })
    res.json({ message: 'Cart item removed' })
  } catch (error) {
    console.error('Error removing cart item:', error)
    res.status(500).json({ error: 'Failed to remove cart item' })
  }
})

export default router

import express from 'express'
import { PrismaClient } from '@prisma/client'
import { adminMiddleware } from '../../middleware/roleMiddleware.js'

const router = express.Router()
const prisma = new PrismaClient()

// Get all products (admin view)
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    })
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Create a new product
router.post('/', adminMiddleware, async (req, res) => {
  const { title, description, price, stockQuantity, imageUrl, categoryName } = req.body
  try {
    // Connect or create category
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
        imageUrl,
        category: {
          connectOrCreate: {
            where: { name: categoryName },
            create: { name: categoryName }
          }
        }
      }
    })
    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// Update a product
router.put('/:productId', adminMiddleware, async (req, res) => {
  const { productId } = req.params
  const { title, description, price, stockQuantity, imageUrl, categoryName } = req.body

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        title,
        description,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
        imageUrl,
        category: {
          connectOrCreate: {
            where: { name: categoryName },
            create: { name: categoryName }
          }
        }
      }
    })
    res.json(updatedProduct)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// Delete a product
router.delete('/:productId', adminMiddleware, async (req, res) => {
  const { productId } = req.params
  try {
    await prisma.product.delete({ where: { id: parseInt(productId) } })
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router

import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Search products (put before /:id)
router.get('/search', async (req, res) => {
  const { query } = req.query
  try {
    const results = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }
    })
    res.json(results)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Failed to search products' })
  }
})

// Filter products
router.get('/filter', async (req, res) => {
  const { categoryId, minPrice, maxPrice, rating } = req.query

  try {
    const filtered = await prisma.product.findMany({
      where: {
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(minPrice && maxPrice && {
          price: {
            gte: parseFloat(minPrice),
            lte: parseFloat(maxPrice),
          },
        }),
        ...(rating && {
          reviews: {
            some: {
              rating: {
                gte: parseInt(rating),
              },
            },
          },
        }),
      },
      include: {
        category: true,
        reviews: true,
      },
    })
    res.json(filtered)
  } catch (error) {
    console.error('Filter error:', error)
    res.status(500).json({ error: 'Failed to filter products' })
  }
})

// Get products by category name
router.get('/category/:name', async (req, res) => {
  const { name } = req.params
  try {
    const category = await prisma.category.findUnique({
      where: { name },
    })
    if (!category) return res.status(404).json({ error: 'Category not found' })

    const products = await prisma.product.findMany({
      where: { categoryId: category.id },
      include: { category: true },
    })

    res.json(products)
  } catch (error) {
    console.error('Category fetch error:', error)
    res.status(500).json({ error: 'Failed to get category products' })
  }
})

// Get product by ID (last because of param route)
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true, reviews: true },
    })
    if (!product) return res.status(404).json({ error: 'Product not found' })

    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// Paginated get all products (root route)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  try {
    const products = await prisma.product.findMany({
      skip,
      take: limit,
      include: { category: true },
    })

    const total = await prisma.product.count()

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      products,
    })
  } catch (error) {
    console.error('Pagination error:', error)
    res.status(500).json({ error: 'Failed to get paginated products' })
  }
})

export default router

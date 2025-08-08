// index.js

import express from 'express'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import { authMiddleware } from './middleware/authMiddleware.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import { adminMiddleware } from './middleware/roleMiddleware.js'
import adminProductRoutes from './routes/admin/products.js'

import paymentRoutes from './routes/payment.js'



dotenv.config()
const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));  // <-- add this
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', authMiddleware, orderRoutes)
app.use('/api/admin/products', authMiddleware, adminProductRoutes)
app.use('/api/cart', authMiddleware, cartRoutes)
app.use('/api/payment', paymentRoutes)
app.get('/', (req, res) => res.send('API is working ✅'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

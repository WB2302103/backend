import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import SSLCommerz from 'sslcommerz-lts';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const store_id = process.env.SSLC_STORE_ID;
const store_passwd = process.env.SSLC_STORE_PASSWORD;
const is_live = false; // false = sandbox

// POST /api/payment/init
router.post('/init', async (req, res) => {
  const {
    userId,
    totalAmount,  // expect string or number from client
    cus_name,
    cus_email,
    cus_add1,
    cus_phone
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Convert totalAmount to float here
  const totalAmountFloat = parseFloat(totalAmount);
  if (isNaN(totalAmountFloat)) {
    return res.status(400).json({ error: 'Invalid totalAmount' });
  }

  try {
    // Fetch user's cart with items and products
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const tranId = uuidv4();

    // Create order with items copied from cart
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: totalAmountFloat,  // <-- here it must be a number
        status: 'PENDING',
        tranId,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price
          }))
        }
      }
    });

    // Prepare payment data for SSLCommerz
    const data = {
      total_amount: totalAmountFloat,
      currency: "BDT",
      tran_id: tranId,
      success_url: "http://localhost:5000/api/payment/success",
      fail_url: "http://localhost:5000/api/payment/fail",
      cancel_url: "http://localhost:5000/api/payment/cancel",
      cus_name,
      cus_email,
      cus_add1,
      cus_phone,
      shipping_method: "Courier",
      ship_name: cus_name,
      ship_add1: cus_add1,
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: "1207",
      ship_country: "Bangladesh",
      product_name: "Cart Items",
      product_category: "Mixed",
      product_profile: "general"
    };

    const sslcz = new SSLCommerz(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    console.log("SSLCommerz API response:", apiResponse);

    res.json({ url: apiResponse.GatewayPageURL || "" });
  } catch (err) {
    console.error("🔥 Payment initiation error:", err);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

// The other payment handlers (success, fail, cancel) look good, just make sure the deleteMany is correct:
router.post('/success', async (req, res) => {
  console.log('Success webhook received, req.body:', req.body);
  // const { tran_id, val_id, amount, card_type } = req.body;
  const { tran_id, val_id, amount, card_type } = req.body || {};
 if (!tran_id) {
    return res.status(400).send('Missing tran_id in request body');
  }
  try {
    const order = await prisma.order.update({
      where: { tranId: tran_id },
      data: {
        status: 'PAID',
        payment: {
          create: {
            provider: 'SSLCommerz',
            status: 'SUCCESS',
            amount: parseFloat(amount),
            transactionId: val_id,
            paidAt: new Date()
          }
        }
      },
      include: { items: true }
    });

    // Clear the cart items after successful payment
    const cart = await prisma.cart.findUnique({
      where: { userId: order.userId }
    });
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id } // FIXED: delete by cart.id, not cart.userId
      });
    }

    res.redirect('http://localhost:5173/payment-success'); // Update frontend URL accordingly
  } catch (error) {
    console.error('Success handler error:', error);
    res.status(500).send('Error updating payment status');
  }
});

// fail, cancel, and ipn routes are fine as they are

export default router;

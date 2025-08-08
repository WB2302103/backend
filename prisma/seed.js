import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  
// First, ensure the category "smartphones" exists or create it
  const category = await prisma.category.upsert({
    where: { name: 'mobile-accessories' },
    update: {},
    create: { name: 'mobile-accessories' }
  });

  // Define the products to seed
  const products = [
    {
    title: "Amazon Echo Plus",
    description: "The Amazon Echo Plus is a smart speaker with built-in Alexa voice control. It features premium sound quality and serves as a hub for controlling smart home devices.",
    price: 99.99,
    stockQuantity: 61,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/1.webp",
    categoryId: category.id
  },
  {
    title: "Apple Airpods",
    description: "The Apple Airpods offer a seamless wireless audio experience. With easy pairing, high-quality sound, and Siri integration, they are perfect for on-the-go listening.",
    price: 129.99,
    stockQuantity: 67,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp",
    categoryId: category.id
  },
  {
    title: "Apple AirPods Max Silver",
    description: "The Apple AirPods Max in Silver are premium over-ear headphones with high-fidelity audio, adaptive EQ, and active noise cancellation. Experience immersive sound in style.",
    price: 549.99,
    stockQuantity: 59,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp",
    categoryId: category.id
  },
  {
    title: "Apple Airpower Wireless Charger",
    description: "The Apple AirPower Wireless Charger provides a convenient way to charge your compatible Apple devices wirelessly. Simply place your devices on the charging mat for effortless charging.",
    price: 79.99,
    stockQuantity: 1,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpower-wireless-charger/1.webp",
    categoryId: category.id
  },
  {
    title: "Apple HomePod Mini Cosmic Grey",
    description: "The Apple HomePod Mini in Cosmic Grey is a compact smart speaker that delivers impressive audio and integrates seamlessly with the Apple ecosystem for a smart home experience.",
    price: 99.99,
    stockQuantity: 27,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-homepod-mini-cosmic-grey/1.webp",
    categoryId: category.id
  },
  {
    title: "Apple iPhone Charger",
    description: "The Apple iPhone Charger is a high-quality charger designed for fast and efficient charging of your iPhone. Ensure your device stays powered up and ready to go.",
    price: 19.99,
    stockQuantity: 31,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/1.webp",
    categoryId: category.id
  },
  {
    title: "Apple MagSafe Battery Pack",
    description: "The Apple MagSafe Battery Pack is a portable and convenient way to add extra battery life to your MagSafe-compatible iPhone. Attach it magnetically for a secure connection.",
    price: 99.99,
    stockQuantity: 1,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/1.webp",
    categoryId: category.id
  },
  {
    title: "Apple Watch Series 4 Gold",
    description: "The Apple Watch Series 4 in Gold is a stylish and advanced smartwatch with features like heart rate monitoring, fitness tracking, and a beautiful Retina display.",
    price: 349.99,
    stockQuantity: 33,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/1.webp",
    categoryId: category.id
  },
  {
    title: "Beats Flex Wireless Earphones",
    description: "The Beats Flex Wireless Earphones offer a comfortable and versatile audio experience. With magnetic earbuds and up to 12 hours of battery life, they are ideal for everyday use.",
    price: 49.99,
    stockQuantity: 50,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/1.webp",
    categoryId: category.id
  },
  {
    title: "iPhone 12 Silicone Case with MagSafe Plum",
    description: "The iPhone 12 Silicone Case with MagSafe in Plum is a stylish and protective case designed for the iPhone 12. It features MagSafe technology for easy attachment of accessories.",
    price: 29.99,
    stockQuantity: 69,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/1.webp",
    categoryId: category.id
  },
  {
    title: "Monopod",
    description: "The Monopod is a versatile camera accessory for stable and adjustable shooting. Perfect for capturing selfies, group photos, and videos with ease.",
    price: 19.99,
    stockQuantity: 48,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/monopod/1.webp",
    categoryId: category.id
  },
  {
    title: "Selfie Lamp with iPhone",
    description: "The Selfie Lamp with iPhone is a portable and adjustable LED light designed to enhance your selfies and video calls. Attach it to your iPhone for well-lit photos.",
    price: 14.99,
    stockQuantity: 58,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/1.webp",
    categoryId: category.id
  },
  {
    title: "Selfie Stick Monopod",
    description: "The Selfie Stick Monopod is a extendable and foldable device for capturing the perfect selfie or group photo. Compatible with smartphones and cameras.",
    price: 12.99,
    stockQuantity: 11,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-stick-monopod/1.webp",
    categoryId: category.id
  },
  {
    title: "TV Studio Camera Pedestal",
    description: "The TV Studio Camera Pedestal is a professional-grade camera support system for smooth and precise camera movements in a studio setting. Ideal for broadcast and production.",
    price: 499.99,
    stockQuantity: 15,
    imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/tv-studio-camera-pedestal/1.webp",
    categoryId: category.id
  }
  ];

  // Insert all products
  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        categoryId: category.id
      }
    });
  }

  console.log('✅ Products seeded!');
  
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

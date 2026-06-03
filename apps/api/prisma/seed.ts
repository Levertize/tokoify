import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean up existing data to avoid conflicts
  await prisma.session.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const sellerPassword = await bcrypt.hash('Seller123!', 10);
  const buyerPassword = await bcrypt.hash('Buyer123!', 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ecommerce.local',
      password: adminPassword,
      name: 'Super Admin',
      role: 'super_admin',
      isVerified: true,
      isActive: true,
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@ecommerce.local',
      password: sellerPassword,
      name: 'Seller Official',
      role: 'seller',
      isVerified: true,
      isActive: true,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@ecommerce.local',
      password: buyerPassword,
      name: 'Buyer Budi',
      role: 'buyer',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('Users seeded.');

  // 4. Create Categories
  const fashion = await prisma.category.create({
    data: { name: 'Fashion', slug: 'fashion', description: 'Kategori fashion pria dan wanita' },
  });
  const elektronik = await prisma.category.create({
    data: { name: 'Elektronik', slug: 'elektronik', description: 'Gadget, laptop, dan barang elektronik' },
  });
  const rumahTangga = await prisma.category.create({
    data: { name: 'Rumah Tangga', slug: 'rumah-tangga', description: 'Peralatan rumah tangga' },
  });
  const olahraga = await prisma.category.create({
    data: { name: 'Olahraga', slug: 'olahraga', description: 'Alat olahraga dan fitness' },
  });
  const kecantikan = await prisma.category.create({
    data: { name: 'Kecantikan', slug: 'kecantikan', description: 'Perawatan wajah dan produk kecantikan' },
  });

  console.log('Categories seeded.');

  // 5. Create 3 Main Products
  // Product 1: Kemeja Linen
  const p1 = await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: fashion.id,
      name: 'Kemeja Linen Premium Relaxed Fit',
      slug: 'kemeja-linen-premium',
      description: 'Kemeja linen premium dengan bahan berkualitas tinggi, nyaman dipakai untuk segala musim. Cocok untuk casual maupun formal. Material: 100% Linen, Machine washable.',
      basePrice: 299000,
      weight: 200,
      avgRating: 4.8,
      reviewCount: 124,
      isActive: true,
      isApproved: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=600&fit=crop&q=80', isPrimary: true, sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', isPrimary: false, sortOrder: 1 },
        ]
      },
      variants: {
        create: [
          { sku: 'KMN-LINEN-NAVY-M', options: { color: 'Navy', size: 'M' }, price: 199000, stock: 25 },
          { sku: 'KMN-LINEN-NAVY-L', options: { color: 'Navy', size: 'L' }, price: 199000, stock: 15 },
        ]
      }
    }
  });

  // Product 2: Tas Kulit
  const p2 = await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: fashion.id,
      name: 'Tas Kulit Handmade Artisan Collection',
      slug: 'tas-kulit-handmade',
      description: 'Tas kulit asli dengan desain elegan, cocok untuk pria dan wanita. Tahan lama dan mewah.',
      basePrice: 850000,
      weight: 500,
      avgRating: 4.9,
      reviewCount: 89,
      isActive: true,
      isApproved: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop&q=80', isPrimary: true, sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1546250867-2129a00d71eb?w=800&q=80', isPrimary: false, sortOrder: 1 },
        ]
      },
      variants: {
        create: [
          { sku: 'TAS-KULIT-BROWN', options: { color: 'Cokelat' }, price: 680000, stock: 12 }
        ]
      }
    }
  });

  // Product 3: Sneakers Canvas
  const p3 = await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: fashion.id,
      name: 'Sneakers Canvas Minimalist White',
      slug: 'sneakers-canvas-white',
      description: 'Sneakers putih minimalis dengan desain timeless. Nyaman dipakai sepanjang hari.',
      basePrice: 500000,
      weight: 800,
      avgRating: 4.6,
      reviewCount: 256,
      isActive: true,
      isApproved: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop&q=80', isPrimary: true, sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1460353581641-694a9f6a0416?w=800&q=80', isPrimary: false, sortOrder: 1 },
        ]
      },
      variants: {
        create: [
          { sku: 'SNK-WHITE-42', options: { color: 'Putih', size: '42' }, price: 320000, stock: 3 },
          { sku: 'SNK-WHITE-43', options: { color: 'Putih', size: '43' }, price: 320000, stock: 5 },
        ]
      }
    }
  });

  // Seed 17 other mock products to fulfill 20 total products
  const categoryMap = [fashion, elektronik, rumahTangga, olahraga, kecantikan];
  const prodNames = [
    'Laptop Stand Ergonomic Aluminum', 'USB-C Hub 7-in-1 Multiport', 'Wireless Earbuds Pro with ANC',
    'Dekorasi Rumah Lampu String Vintage', 'Sarung Bantal Sofa Cotton Premium', 'Sepeda Statis Fitness Home Gym',
    'Yoga Mat Premium Non-Slip TPE', 'Serum Wajah Vitamin C Brightening', 'Moisturizer Gel Aloe Vera 100ml',
    'T-Shirt Cotton Combed 30s Black', 'Jeans Denim Slim Fit Indigo', 'Sweater Hoodie Minimalist Gray',
    'Powerbank 20000mAh Fast Charging', 'Mechanical Keyboard RGB Wireless', 'Tas Ransel Waterproof Travel',
    'Tumbler Vacuum Insulated Stainless Steel', 'Kacamata Hitam Polarized Retro'
  ];

  for (let i = 0; i < prodNames.length; i++) {
    const cat = categoryMap[i % categoryMap.length];
    const basePrice = Math.floor(Math.random() * 800 + 100) * 1000;
    const name = prodNames[i];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: cat.id,
        name,
        slug,
        description: `${name} deskripsi produk dummy berkualitas tinggi untuk pengujian e-commerce Tokoify.`,
        basePrice,
        weight: 300,
        avgRating: 4.5,
        reviewCount: 10 + i,
        isActive: true,
        isApproved: true,
        images: {
          create: [
            { url: `https://picsum.photos/seed/${slug}/600/600`, isPrimary: true, sortOrder: 0 }
          ]
        },
        variants: {
          create: [
            { sku: `SKU-${slug.toUpperCase()}-STD`, options: { size: 'Standar' }, price: basePrice - 20000, stock: 10 + i }
          ]
        }
      }
    });
  }

  // 6. Create Voucher
  await prisma.voucher.create({
    data: {
      code: 'TESTDISKON10',
      type: 'percentage',
      value: 10,
      minPurchase: 100000,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
    }
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

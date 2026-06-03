export interface ProductDetail {
  id: string
  slug: string
  name: string
  category: string
  price: number
  originalPrice?: number
  discountPercent?: number
  imageUrl: string
  images: string[]
  avgRating: number
  reviewCount: number
  stock: number
  description: string
  seller: string
}

export const productDatabase: ProductDetail[] = [
  {
    id: "1",
    slug: "kemeja-linen-premium",
    name: "Kemeja Linen Premium - Slim Fit",
    category: "Fashion",
    price: 199000,
    originalPrice: 299000,
    discountPercent: 33,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=800&q=80",
    ],
    avgRating: 4.8,
    reviewCount: 234,
    stock: 45,
    description: "Kemeja linen premium dengan bahan berkualitas tinggi, nyaman dipakai untuk segala musim. Cocok untuk casual maupun formal. Material: 100% Linen, Machine washable.",
    seller: "FashionStore Official",
  },
  {
    id: "2",
    slug: "tas-kulit-coklat",
    name: "Tas Kulit Asli - Warna Coklat",
    category: "Fashion",
    price: 450000,
    originalPrice: 600000,
    discountPercent: 25,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
      "https://images.unsplash.com/photo-1546250867-2129a00d71eb?w=800&q=80",
    ],
    avgRating: 4.7,
    reviewCount: 156,
    stock: 12,
    description: "Tas kulit asli dengan desain elegan, cocok untuk pria dan wanita. Tahan lama dan mewah.",
    seller: "LeatherGoods Store",
  },
  {
    id: "3",
    slug: "sneakers-putih-minimalis",
    name: "Sneakers Putih Minimalis",
    category: "Fashion",
    price: 350000,
    originalPrice: 500000,
    discountPercent: 30,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1460353581641-694a9f6a0416?w=800&q=80",
    ],
    avgRating: 4.6,
    reviewCount: 89,
    stock: 3,
    description: "Sneakers putih minimalis dengan desain timeless. Nyaman dipakai sepanjang hari.",
    seller: "Footwear Pro",
  },
]

export function getProductBySlug(slug: string): ProductDetail | undefined {
  return productDatabase.find((product) => product.slug === slug)
}

export function getAllProductSlugs(): string[] {
  return productDatabase.map((product) => product.slug)
}

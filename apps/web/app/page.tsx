"use client"

import { useState } from "react"
import { ProductCard, type Product } from "@/components/product-card"
import { Navbar } from "@/components/navbar"

const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Kemeja Linen Premium Relaxed Fit",
    slug: "kemeja-linen-premium",
    category: "Pakaian Pria",
    price: 450000,
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=600&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 124,
    stock: 25,
  },
  {
    id: "2",
    name: "Tas Kulit Handmade Artisan Collection",
    slug: "tas-kulit-handmade",
    category: "Aksesori",
    price: 680000,
    originalPrice: 850000,
    discountPercent: 20,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 89,
    stock: 12,
  },
  {
    id: "3",
    name: "Sneakers Canvas Minimalist White",
    slug: "sneakers-canvas-white",
    category: "Sepatu",
    price: 320000,
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop&q=80",
    avgRating: 4.6,
    reviewCount: 256,
    stock: 3,
  },
]

export default function ProductShowcase() {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  const handleAddToCart = (productId: string) => {
    console.log("[v0] Adding to cart:", productId)
    // Cart logic would go here
  }

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  return (
    <>
      <Navbar notificationCount={3} cartCount={2} />
      <main className="min-h-screen bg-background px-4 py-12 pb-24 md:pb-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Produk Pilihan
          </h1>
          <p className="mt-2 text-muted-foreground">
            Temukan produk berkualitas untuk gaya hidup Anda
          </p>
        </header>

        {/* Variant Labels */}
        <div className="mb-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span className="rounded-full bg-secondary px-3 py-1">Regular</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
            Diskon
          </span>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
            Stok Terbatas
          </span>
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={wishlist.has(product.id)}
            />
          ))}
        </div>
      </div>
    </main>
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import { ProductCard, type Product } from "@/components/product-card"
import { Navbar } from "@/components/navbar"
import apiClient from "@/lib/api"

export default function ProductShowcase() {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getFeaturedProducts() {
      try {
        const res: any = await apiClient.get("/products", {
          params: { limit: 3, sortBy: "createdAt", sortOrder: "desc" },
        })
        const apiProducts = res.data || []
        const formatted = apiProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category?.name || "Umum",
          price: p.lowestPrice || p.basePrice,
          originalPrice: p.basePrice > (p.lowestPrice || p.basePrice) ? p.basePrice : undefined,
          discountPercent: p.discountPercent || undefined,
          imageUrl: p.primaryImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
          avgRating: p.avgRating || 0,
          reviewCount: p.reviewCount || 0,
          stock: p.stock || 10,
        }))
        setProducts(formatted)
      } catch (err) {
        console.error("Error fetching featured products:", err)
      } finally {
        setIsLoading(false)
      }
    }
    getFeaturedProducts()
  }, [])

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
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.has(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-foreground">Produk tidak ditemukan</h3>
            <p className="mt-2 text-sm text-muted-foreground">Belum ada produk pilihan tersedia</p>
          </div>
        )}
      </div>
    </main>
    </>
  )
}

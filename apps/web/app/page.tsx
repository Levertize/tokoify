"use client"

import { useState, useEffect } from "react"
import { ProductCard, type Product } from "@/components/product-card"
import { Navbar } from "@/components/navbar"
import apiClient from "@/lib/api"
import { useCartStore } from "@/store/cartStore"
import { useWishlistStore } from "@/store/wishlistStore"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ProductShowcase() {
  const router = useRouter()
  const { user: loggedInUser } = useAuthStore()
  const addToCart = useCartStore((state) => state.addToCart)
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)
  const isWishlisted = useWishlistStore((state) => state.isWishlisted)

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

  const handleAddToCart = async (prod: Product) => {
    if (!loggedInUser) {
      toast.error("Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.")
      router.push("/login")
      return
    }
    try {
      const res: any = await apiClient.get(`/products/${prod.slug}`)
      const variants = res.data?.variants || []
      if (variants.length === 0) {
        toast.error("Varian produk tidak tersedia.")
        return
      }
      await addToCart(variants[0].id, 1)
      toast.success("Produk berhasil ditambahkan ke keranjang")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menambahkan produk ke keranjang")
    }
  }

  const handleToggleWishlist = async (productId: string) => {
    if (!loggedInUser) {
      toast.error("Silakan login terlebih dahulu untuk menyimpan produk.")
      router.push("/login")
      return
    }
    try {
      const wish = isWishlisted(productId)
      await toggleWishlist(productId)
      toast.success(
        wish
          ? "Produk dihapus dari wishlist"
          : "Produk ditambahkan ke wishlist"
      )
    } catch (err) {
      toast.error("Gagal mengubah wishlist")
    }
  }

  return (
    <>
      <Navbar />
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
                onAddToCart={() => handleAddToCart(product)}
                onToggleWishlist={() => handleToggleWishlist(product.id)}
                isWishlisted={isWishlisted(product.id)}
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

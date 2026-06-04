"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, Loader2, Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useWishlistStore } from "@/store/wishlistStore"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"
import apiClient from "@/lib/api"

export default function WishlistPage() {
  const router = useRouter()
  const { user: loggedInUser, isLoading: authLoading } = useAuthStore()
  const { items, isLoading, fetchWishlist, toggleWishlist } = useWishlistStore()
  const addToCart = useCartStore((state) => state.addToCart)

  useEffect(() => {
    if (loggedInUser) {
      fetchWishlist()
    }
  }, [loggedInUser, fetchWishlist])

  const handleAddToCart = async (prod: any) => {
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

  const handleRemoveWishlist = async (productId: string) => {
    try {
      await toggleWishlist(productId)
      toast.success("Produk berhasil dihapus dari wishlist")
    } catch (err) {
      toast.error("Gagal menghapus produk dari wishlist")
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  if (!loggedInUser) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Akses Terbatas
          </h1>
          <p className="mt-2 text-muted-foreground">
            Silakan masuk ke akun Anda terlebih dahulu untuk melihat daftar produk favorit Anda.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/login">
              <Button>Masuk Akun</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Kembali ke Beranda</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Wishlist Saya
          </h1>
          <p className="mt-2 text-muted-foreground">
            Simpan barang-barang favorit Anda untuk dibeli nanti
          </p>
        </header>

        {isLoading && items.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Wishlist kosong</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Belum ada produk pilihan yang Anda simpan di sini.
            </p>
            <Link href="/jelajahi">
              <Button className="mt-6 flex items-center gap-2 mx-auto">
                <Search className="h-4 w-4" />
                Cari Produk
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={() => handleAddToCart(item)}
                onToggleWishlist={() => handleRemoveWishlist(item.id)}
                isWishlisted={true}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

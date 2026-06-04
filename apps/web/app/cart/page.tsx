"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"
import apiClient from "@/lib/api"

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("IDR", "Rp")
    .trim()
}

export default function CartPage() {
  const router = useRouter()
  const { user: loggedInUser, isLoading: authLoading } = useAuthStore()
  const { items, isLoading, fetchCart, updateQty, removeItem } = useCartStore()
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (loggedInUser) {
      fetchCart()
    }
  }, [loggedInUser, fetchCart])

  const handleQtyChange = async (itemId: string, currentQty: number, change: number, stock: number) => {
    const newQty = currentQty + change
    if (newQty < 1) return
    if (newQty > stock) {
      toast.error(`Stok maksimal yang tersedia adalah ${stock}`)
      return
    }
    try {
      await updateQty(itemId, newQty)
      toast.success("Kuantitas berhasil diperbarui")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui kuantitas")
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId)
      toast.success("Produk berhasil dihapus dari keranjang")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus produk")
    }
  }

  const handleCheckout = async () => {
    setIsValidating(true)
    try {
      const res: any = await apiClient.post("/cart/validate")
      if (res?.success && res.data.isValid) {
        toast.success("Stok tervalidasi, mengalihkan ke checkout...")
        router.push("/checkout")
      } else {
        const invalidItems = res.data.items.filter((item: any) => !item.isValid)
        invalidItems.forEach((item: any) => {
          toast.error(item.message)
        })
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memvalidasi keranjang belanja")
    } finally {
      setIsValidating(false)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0)
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

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
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Akses Terbatas
          </h1>
          <p className="mt-2 text-muted-foreground">
            Silakan masuk ke akun Anda terlebih dahulu untuk melihat keranjang belanja Anda.
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
            Keranjang Belanja
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola barang pilihan yang siap Anda beli
          </p>
        </header>

        {isLoading && items.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Keranjang kosong</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Belum ada produk yang ditambahkan ke keranjang belanja Anda.
            </p>
            <Link href="/jelajahi">
              <Button className="mt-6">Mulai Belanja</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Items List */}
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/10"
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
                    <img
                      src={item.variant?.product?.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop"}
                      alt={item.variant?.product?.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {item.variant?.product?.category?.name || "Umum"}
                    </span>
                    <h3 className="truncate text-[15px] font-medium text-foreground leading-snug">
                      <Link href={`/produk/${item.variant?.product?.slug}`} className="hover:underline">
                        {item.variant?.product?.name}
                      </Link>
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {item.variant?.options &&
                        Object.entries(item.variant.options).map(([key, val]: any) => (
                          <span key={key} className="rounded bg-secondary px-1.5 py-0.5 font-medium">
                            {key}: {val}
                          </span>
                        ))}
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700">
                        Stok: {item.variant?.stock || 0}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {formatIDR(item.variant?.price || 0)}
                    </p>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background p-1">
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity, -1, item.variant?.stock || 0)}
                      disabled={item.quantity <= 1}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity, 1, item.variant?.stock || 0)}
                      disabled={item.quantity >= (item.variant?.stock || 0)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:w-[350px]">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-foreground mb-4">Ringkasan Belanja</h3>

                <div className="space-y-3 border-b border-border pb-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Barang</span>
                    <span className="font-medium text-foreground">{totalItemsCount} item</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Harga</span>
                    <span className="font-medium text-foreground">{formatIDR(subtotal)}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-baseline mb-6">
                  <span className="font-semibold text-foreground text-sm">Total Belanja</span>
                  <span className="font-bold text-lg text-foreground">{formatIDR(subtotal)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isValidating}
                  className="w-full flex items-center justify-center gap-2 h-12 text-sm"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Lanjut ke Checkout
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Stok barang akan tervalidasi secara otomatis sebelum melakukan checkout.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

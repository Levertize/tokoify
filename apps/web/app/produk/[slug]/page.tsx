"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ImageGallery } from "@/components/product/image-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { SizeSelector } from "@/components/product/size-selector"
import { QuantitySelector } from "@/components/product/quantity-selector"
import { ProductReviews } from "@/components/product/product-reviews"
import apiClient from "@/lib/api"
import { useCartStore } from "@/store/cartStore"
import { useWishlistStore } from "@/store/wishlistStore"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"

const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { user: loggedInUser } = useAuthStore()
  const addToCart = useCartStore((state) => state.addToCart)
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)

  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product?.id || ''))

  useEffect(() => {
    async function getProduct() {
      setIsLoading(true)
      try {
        const res: any = await apiClient.get(`/products/${slug}`)
        setProduct(res.data)
      } catch (err) {
        console.error('Error fetching product detail:', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (slug) {
      getProduct()
    }
  }, [slug])

  const variants = product?.variants || []
  const availableSizes = Array.from(
    new Set(
      variants
        .map((v: any) => v.options?.size || v.options?.Size || '')
        .filter((size: string) => size !== '')
    )
  ) as string[]

  const sizesToRender = availableSizes.length > 0 ? availableSizes : []

  useEffect(() => {
    if (sizesToRender.length > 0 && !selectedSize) {
      setSelectedSize(sizesToRender[0])
    }
  }, [sizesToRender, selectedSize])

  const selectedVariant = variants.find((v: any) => {
    const sizeVal = v.options?.size || v.options?.Size
    return sizeVal === selectedSize
  }) || variants[0]

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Produk tidak ditemukan</h1>
          <p className="mt-2 text-muted-foreground">Maaf, produk yang Anda cari tidak tersedia.</p>
        </div>
      </main>
    )
  }

  const handleAddToCart = async () => {
    if (!loggedInUser) {
      toast.error("Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.")
      router.push("/login")
      return
    }
    if (!selectedVariant) {
      toast.error("Varian produk tidak tersedia.")
      return
    }
    try {
      await addToCart(selectedVariant.id, quantity)
      toast.success("Produk berhasil ditambahkan ke keranjang")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menambahkan produk ke keranjang")
    }
  }

  const handleToggleWishlist = async () => {
    if (!loggedInUser) {
      toast.error("Silakan login terlebih dahulu untuk menyimpan produk.")
      router.push("/login")
      return
    }
    if (!product) return
    try {
      await toggleWishlist(product.id)
      toast.success(
        isWishlisted
          ? "Produk dihapus dari wishlist"
          : "Produk ditambahkan ke wishlist"
      )
    } catch (err) {
      toast.error("Gagal mengubah wishlist")
    }
  }

  const currentPrice = selectedVariant ? Number(selectedVariant.price) : (product.lowestPrice || product.basePrice)
  const currentStock = selectedVariant ? selectedVariant.stock : (product.stock || 0)

  // Convert product images to array of strings
  const imageUrls = product.images && product.images.length > 0 
    ? product.images.map((img: any) => img.url)
    : [product.primaryImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop']

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Product Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-6">
            <ImageGallery images={imageUrls} productName={product.name} />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col gap-6">
            <ProductInfo
              name={product.name}
              price={currentPrice}
              originalPrice={product.basePrice > currentPrice ? product.basePrice : undefined}
              rating={product.avgRating || 4.5}
              reviewCount={product.reviewCount || 0}
              seller={product.seller?.name || 'Seller'}
              stock={currentStock}
              description={product.description?.replace(/<[^>]*>/g, '') || ''}
              onAddToCart={handleAddToCart}
              isWishlisted={isWishlisted}
              onToggleWishlist={handleToggleWishlist}
            />

            {/* Size Selector */}
            {sizesToRender.length > 0 && (
              <div className="border-t border-border pt-6">
                <SizeSelector sizes={sizesToRender} onSelect={setSelectedSize} />
              </div>
            )}

            {/* Quantity Selector */}
            <div className="border-t border-border pt-6">
              <QuantitySelector max={currentStock} onQuantityChange={setQuantity} />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-border pt-12">
          <ProductReviews />
        </div>
      </div>
    </main>
  )
}

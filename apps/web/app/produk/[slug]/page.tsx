"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ImageGallery } from "@/components/product/image-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { SizeSelector } from "@/components/product/size-selector"
import { QuantitySelector } from "@/components/product/quantity-selector"
import { ProductReviews } from "@/components/product/product-reviews"
import apiClient from "@/lib/api"

const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar notificationCount={3} cartCount={2} />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar notificationCount={3} cartCount={2} />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Produk tidak ditemukan</h1>
          <p className="mt-2 text-muted-foreground">Maaf, produk yang Anda cari tidak tersedia.</p>
        </div>
      </main>
    )
  }

  const handleAddToCart = () => {
    alert(`Added ${quantity} item(s) to cart`)
  }

  // Convert product images to array of strings
  const imageUrls = product.images && product.images.length > 0 
    ? product.images.map((img: any) => img.url)
    : [product.primaryImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop']

  return (
    <main className="min-h-screen bg-background">
      <Navbar notificationCount={3} cartCount={2} />

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
              price={product.lowestPrice || product.basePrice}
              originalPrice={product.basePrice > (product.lowestPrice || product.basePrice) ? product.basePrice : undefined}
              rating={product.avgRating || 4.5}
              reviewCount={product.reviewCount || 0}
              seller={product.seller?.name || 'Seller'}
              stock={product.stock || 10}
              description={product.description?.replace(/<[^>]*>/g, '') || ''}
              onAddToCart={handleAddToCart}
            />

            {/* Size Selector */}
            <div className="border-t border-border pt-6">
              <SizeSelector sizes={sizes} onSelect={setSelectedSize} />
            </div>

            {/* Quantity Selector */}
            <div className="border-t border-border pt-6">
              <QuantitySelector max={product.stock || 10} onQuantityChange={setQuantity} />
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

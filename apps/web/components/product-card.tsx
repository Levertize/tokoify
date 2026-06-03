"use client"

import Image from "next/image"
import { Heart, Star, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Product {
  id: string
  name: string
  slug: string
  category: string
  price: number
  originalPrice?: number
  discountPercent?: number
  imageUrl: string
  avgRating: number
  reviewCount: number
  stock: number
}

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
  onToggleWishlist: (productId: string) => void
  isWishlisted: boolean
}

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

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: ProductCardProps) {
  const showLowStock = product.stock > 0 && product.stock < 5
  const hasDiscount = product.discountPercent && product.discountPercent > 0

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:border-foreground/20"
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-md bg-amber-500 px-2 py-1 text-xs font-semibold text-white">
            -{product.discountPercent}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleWishlist(product.id)
          }}
          className={cn(
            "absolute right-3 top-3 flex size-9 items-center justify-center rounded-full",
            "bg-white/90 backdrop-blur-sm transition-all duration-200",
            "hover:bg-white hover:scale-110",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "size-5 transition-colors",
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "fill-transparent text-foreground/70"
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Category */}
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category}
        </span>

        {/* Product Name */}
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-foreground">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-3",
                  i < Math.floor(product.avgRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-border"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {product.avgRating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-foreground">
            {formatIDR(product.price)}
          </span>
          {hasDiscount && product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatIDR(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Low Stock Indicator */}
        {showLowStock && (
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" />
            <span className="text-xs text-amber-600">
              Stok tersisa {product.stock}
            </span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onAddToCart(product.id)
          }}
          disabled={product.stock === 0}
          className={cn(
            "mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-foreground",
            "px-4 py-2.5 text-sm font-medium text-foreground",
            "transition-all duration-200",
            "hover:bg-foreground hover:text-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground"
          )}
        >
          <ShoppingCart className="size-4" />
          {product.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
        </button>
      </div>
    </article>
  )
}

"use client"

import { useState } from "react"
import { Heart, Share2, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductInfoProps {
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  seller: string
  stock: number
  description: string
  onAddToCart: () => void
  isWishlisted?: boolean
  onToggleWishlist?: () => void
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

export function ProductInfo({
  name,
  price,
  originalPrice,
  rating,
  reviewCount,
  seller,
  stock,
  description,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}: ProductInfoProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Rating & Reviews */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-4",
                  i < Math.floor(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-border"
                )}
              />
            ))}
          </div>
          <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
        </div>
        <button className="text-sm text-accent hover:underline">
          {reviewCount} ulasan
        </button>
      </div>

      {/* Product Name */}
      <div>
        <h1 className="text-3xl font-bold leading-tight text-foreground">{name}</h1>
      </div>

      {/* Seller */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Dijual oleh</span>
        <button className="font-semibold text-accent hover:underline">{seller}</button>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-foreground">{formatIDR(price)}</span>
        {originalPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatIDR(originalPrice)}
            </span>
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
              -{discount}%
            </Badge>
          </>
        )}
      </div>

      {/* Stock Status */}
      <div className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 w-fit",
        stock > 10
          ? "bg-green-100 text-green-700"
          : stock > 0
            ? "bg-amber-100 text-amber-700"
            : "bg-red-100 text-red-700"
      )}>
        <span className="text-sm font-medium">
          {stock > 10
            ? `Stok Tersedia (${stock})`
            : stock > 0
              ? `Stok Terbatas (${stock})`
              : "Stok Habis"}
        </span>
      </div>

      {/* Description */}
      <div className="space-y-2 rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-foreground">{description}</p>
      </div>

      {/* Features */}
      <div className="grid gap-3">
        <div className="flex items-start gap-3">
          <Truck className="size-5 shrink-0 text-accent mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Pengiriman Gratis</p>
            <p className="text-xs text-muted-foreground">Ke seluruh Indonesia</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Shield className="size-5 shrink-0 text-accent mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Garansi Resmi</p>
            <p className="text-xs text-muted-foreground">Produk original 100%</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <RotateCcw className="size-5 shrink-0 text-accent mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Return Mudah</p>
            <p className="text-xs text-muted-foreground">30 hari tanpa pertanyaan</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onAddToCart}
          disabled={stock === 0}
          className="flex-1 h-12 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Tambah ke Keranjang
        </Button>
        <button
          onClick={onToggleWishlist}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-lg border-2 px-6 transition-all duration-200",
            isWishlisted
              ? "border-red-500 bg-red-50 text-red-500"
              : "border-border text-foreground hover:border-foreground"
          )}
        >
          <Heart className={cn("size-5", isWishlisted && "fill-current")} />
          <span className="text-sm font-medium hidden sm:inline">
            {isWishlisted ? "Disimpan" : "Simpan"}
          </span>
        </button>
        <button className="flex h-12 items-center justify-center rounded-lg border-2 border-border px-6 text-foreground transition-all duration-200 hover:border-foreground hover:bg-muted/50">
          <Share2 className="size-5" />
        </button>
      </div>
    </div>
  )
}

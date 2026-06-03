"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  author: string
  avatar: string
  rating: number
  date: string
  title: string
  content: string
  helpful: number
  images?: string[]
}

const mockReviews: Review[] = [
  {
    id: "1",
    author: "Siti Nurhaliza",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    date: "2 minggu lalu",
    title: "Sangat memuaskan!",
    content: "Produk sesuai deskripsi, kualitas bagus, dan pengiriman cepat. Saya sangat puas dengan pembelian ini!",
    helpful: 234,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
    ],
  },
  {
    id: "2",
    author: "Ahmad Wijaya",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 4,
    date: "1 bulan lalu",
    title: "Bagus tapi bisa lebih",
    content: "Produknya bagus, tapi packaging bisa lebih rapi. Overall memuaskan lah.",
    helpful: 128,
  },
  {
    id: "3",
    author: "Retno Kusuma",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    date: "1 bulan lalu",
    title: "Rekomendasi banget!",
    content: "Sudah beli 3x dari seller ini. Konsisten kualitasnya bagus dan pelayanan ramah. Highly recommended!",
    helpful: 456,
  },
]

export function ProductReviews() {
  const [sortBy, setSortBy] = useState<"helpful" | "recent">("helpful")

  const sortedReviews = [...mockReviews].sort((a, b) => {
    if (sortBy === "helpful") {
      return b.helpful - a.helpful
    }
    return 0
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">Ulasan Pembeli ({mockReviews.length})</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "helpful" | "recent")}
          className={cn(
            "rounded-lg border-2 border-border bg-background px-3 py-2 text-sm",
            "text-foreground transition-all duration-200",
            "hover:border-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          )}
        >
          <option value="helpful">Paling Membantu</option>
          <option value="recent">Terbaru</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-border/60 hover:shadow-sm"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <Image
                  src={review.avatar}
                  alt={review.author}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-foreground">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-4",
                      i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-border"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Review Title & Content */}
            <div className="mb-3">
              <h3 className="font-semibold text-foreground mb-1">{review.title}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{review.content}</p>
            </div>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-3">
                {review.images.map((image, idx) => (
                  <Image
                    key={idx}
                    src={image}
                    alt={`Review image ${idx + 1}`}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            {/* Helpful Button */}
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ThumbsUp className="size-4" />
              Membantu ({review.helpful})
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={images[selectedIndex]}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            fill
            className="object-cover transition-transform duration-500"
            priority
          />
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2",
                "flex size-10 items-center justify-center rounded-full",
                "bg-white/90 backdrop-blur-sm transition-all duration-200",
                "hover:bg-white hover:scale-110",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5 text-foreground" />
            </button>
            <button
              onClick={handleNext}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2",
                "flex size-10 items-center justify-center rounded-full",
                "bg-white/90 backdrop-blur-sm transition-all duration-200",
                "hover:bg-white hover:scale-110",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              )}
              aria-label="Next image"
            >
              <ChevronRight className="size-5 text-foreground" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200",
                selectedIndex === index
                  ? "border-foreground"
                  : "border-border hover:border-foreground/50"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

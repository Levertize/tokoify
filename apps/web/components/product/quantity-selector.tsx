"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuantitySelectorProps {
  max: number
  onQuantityChange: (quantity: number) => void
}

export function QuantitySelector({ max, onQuantityChange }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1)

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1
      setQuantity(newQuantity)
      onQuantityChange(newQuantity)
    }
  }

  const handleIncrease = () => {
    if (quantity < max) {
      const newQuantity = quantity + 1
      setQuantity(newQuantity)
      onQuantityChange(newQuantity)
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground">Jumlah</label>
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrease}
          disabled={quantity === 1}
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border-2 transition-all duration-200",
            quantity === 1
              ? "border-border bg-muted text-muted-foreground cursor-not-allowed"
              : "border-border text-foreground hover:border-foreground hover:bg-muted"
          )}
        >
          <Minus className="size-4" />
        </button>

        <div className="w-16 text-center">
          <span className="text-lg font-semibold text-foreground">{quantity}</span>
        </div>

        <button
          onClick={handleIncrease}
          disabled={quantity === max}
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border-2 transition-all duration-200",
            quantity === max
              ? "border-border bg-muted text-muted-foreground cursor-not-allowed"
              : "border-border text-foreground hover:border-foreground hover:bg-muted"
          )}
        >
          <Plus className="size-4" />
        </button>

        <span className="text-xs text-muted-foreground ml-2">
          Max: {max}
        </span>
      </div>
    </div>
  )
}

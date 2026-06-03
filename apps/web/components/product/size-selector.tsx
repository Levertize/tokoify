"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SizeSelectorProps {
  sizes: string[]
  onSelect: (size: string) => void
}

export function SizeSelector({ sizes, onSelect }: SizeSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (size: string) => {
    setSelected(size)
    onSelect(size)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground">Pilih Ukuran</label>
      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => handleSelect(size)}
            className={cn(
              "rounded-lg border-2 py-3 text-sm font-medium transition-all duration-200",
              selected === size
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:border-foreground/50"
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}
